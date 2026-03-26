import { useCallback, useEffect, useRef } from 'react'
import Decimal from 'decimal.js'
import type { ResourceId, ProductId, Upgrade, Building } from '@/types'
import { PANTINS_COINS_ID } from '@/types'
import { calcTotalProduction, calcClampedDelta } from '@/mechanics/productionMechanics'
import { calcSynergyBonuses } from '@/mechanics/synergyMechanics'
import { COMBO_DEFINITIONS } from '@/lib/synergies/combos'
import { useResourceStore } from '@/store/resourceStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { useCraftingStore } from '@/store/craftingStore'
import { useProductStore } from '@/store/productStore'
import { useSynergyStore } from '@/store/synergyStore'
import { useSupplierStore } from '@/store/supplierStore'
import { calcSupplierTick } from '@/mechanics/supplierMechanics'
import type { SupplierTickResult } from '@/mechanics/supplierMechanics'
import { ALL_SUPPLIERS, ALL_SUPPLIER_UPGRADES } from '@/lib/products/registry'
import {
  PRODUCT_REGISTRY,
  PRODUCT_ORDER,
  ALL_BUILDINGS as ALL_BUILDING_DATA,
  SHARED_RESOURCE_UNLOCK_THRESHOLDS,
  getAllBuildingUnlockThresholds,
} from '@/lib/products/registry'
import { useToastStore } from '@/store/toastStore'
import i18n from '@/i18n'

// ─── Unlock checks ──────────────────────────────────────────────

function checkBuildingAndResourceUnlocks() {
  const resourceStore = useResourceStore.getState()
  const allResources = resourceStore.getAllResources()
  const buildingStore = useBuildingStore.getState()

  const thresholds = getAllBuildingUnlockThresholds()
  const allBuildings = buildingStore.getAllBuildings()

  for (const [bid, threshold] of Object.entries(thresholds)) {
    const building = allBuildings[bid]
    if (!building || building.unlocked) continue
    const res = allResources[threshold.resource as string]
    if (res && res.totalEarned.gte(threshold.amount)) {
      buildingStore.unlockBuilding(building.id)
    }
  }

  for (const [resourceId, condition] of Object.entries(SHARED_RESOURCE_UNLOCK_THRESHOLDS)) {
    if (!condition) continue
    const res = allResources[resourceId]
    if (!res || res.unlocked) continue
    const condRes = allResources[condition.resource as string]
    if (condRes && condRes.totalEarned.gte(condition.amount)) {
      resourceStore.unlockResource(resourceId as ResourceId)
    }
  }
}

function checkProductUnlocks() {
  const resourceStore = useResourceStore.getState()
  const coinsResource = resourceStore.globalResources[PANTINS_COINS_ID as string]
  if (!coinsResource) return

  const productStore = useProductStore.getState()
  const totalCoins = coinsResource.totalEarned

  for (const productId of PRODUCT_ORDER) {
    if (productStore.isUnlocked(productId)) continue
    const bundle = PRODUCT_REGISTRY[productId]
    if (!bundle.definition.unlockCondition) continue
    if (totalCoins.gte(bundle.definition.unlockCondition.amount)) {
      productStore.unlockProduct(productId)
      const ns = `products/${productId}`
      const resolvedName = i18n.t(bundle.definition.name, { ns })
      const resolvedEmoji = i18n.t(bundle.definition.emoji, { ns })
      useToastStore.getState().addToast(
        i18n.t('toasts.product_unlocked', { ns: 'common', name: resolvedName }),
        resolvedEmoji,
      )
    }
  }
}

// ─── Active product detection ───────────────────────────────────

function getActiveProductIds(
  unlockedProducts: string[],
  buildings: Record<ProductId, Record<string, Building>>,
): ProductId[] {
  const result: ProductId[] = []
  for (const productId of unlockedProducts) {
    const productBuildings = buildings[productId as ProductId] ?? {}
    const bundle = PRODUCT_REGISTRY[productId as ProductId]
    if (!bundle) continue
    for (const [bid, building] of Object.entries(productBuildings)) {
      if (building.count <= 0) continue
      const data = bundle.buildings[bid]
      if (data && data.pipelineRole === 'cuisson') {
        result.push(productId as ProductId)
        break
      }
    }
  }
  return result
}

// ─── Per-second display ─────────────────────────────────────────

/**
 * Build the per-second rates shown in the UI.
 * - Negative rates: show theoretical (demand) so the player sees resource deficit
 * - Positive rates: show actual (post-throttle) so bottlenecked production shows 0
 * Supplier rates are always actual (post-throttle).
 */
function buildDisplayPerSecond(
  theoreticalNet: Record<string, Decimal>,
  buildingDeltas: Record<string, Decimal>,
  supplierResult: SupplierTickResult,
  delta: number,
): Record<string, Decimal> {
  if (delta <= 0) return {}

  const display: Record<string, Decimal> = {}
  const d = new Decimal(delta)

  // For each resource: pick theoretical if negative (shows demand), actual if positive (shows real output)
  const allKeys = new Set([...Object.keys(theoreticalNet), ...Object.keys(buildingDeltas)])
  for (const rid of allKeys) {
    const theoretical = theoreticalNet[rid] ?? new Decimal(0)
    const actual = (buildingDeltas[rid] ?? new Decimal(0)).div(d)
    display[rid] = theoretical.isNegative() ? theoretical : actual
  }

  // Suppliers: actual (post-throttle)
  for (const [rid, amount] of Object.entries(supplierResult.resourceDeltas)) {
    display[rid] = (display[rid] ?? new Decimal(0)).add(amount.div(d))
  }

  return display
}

// ─── Core tick logic (shared by RAF and background interval) ────

const BACKGROUND_INTERVAL_MS = 1000

function executeTick(delta: number) {
  // 1. Crafting
  useCraftingStore.getState().tickCrafting(delta)

  // 2. Production (synergies → production calc → clamped deltas)
  const { unlockedProducts } = useProductStore.getState()
  const buildingStore = useBuildingStore.getState()
  const { upgrades } = useUpgradeStore.getState()
  const resourceStore = useResourceStore.getState()
  const allBuildings = buildingStore.getAllBuildings()
  const allResources = resourceStore.getAllResources()

  const activeProductIds = getActiveProductIds(unlockedProducts, buildingStore.buildings)
  const purchasedUpgrades: Upgrade[] = Object.values(upgrades).filter(u => u.purchased)

  let totalBuildingCount = 0
  for (const building of Object.values(allBuildings)) {
    totalBuildingCount += building.count
  }

  const resourceTotals: Record<string, Decimal> = {}
  for (const [rid, res] of Object.entries(allResources)) {
    resourceTotals[rid] = res.totalEarned
  }

  const synergyBonuses = calcSynergyBonuses({
    allBuildings,
    allBuildingData: ALL_BUILDING_DATA,
    purchasedUpgrades,
    activeProductIds,
    comboDefinitions: COMBO_DEFINITIONS,
    totalBuildingCount,
    totalUpgradeCount: purchasedUpgrades.length,
    resourceTotals,
  })

  useSynergyStore.getState().updateBonuses(
    synergyBonuses,
    activeProductIds,
    totalBuildingCount,
    purchasedUpgrades.length,
  )

  const totalResult = calcTotalProduction(
    unlockedProducts, PRODUCT_REGISTRY, buildingStore.buildings, upgrades, synergyBonuses,
  )

  const buildingDeltas = calcClampedDelta(totalResult, allResources, delta)
  resourceStore.applyDeltas(buildingDeltas)

  // 3. Suppliers (runs after production so earned coins are available)
  const { suppliers, supplierUpgrades: supplierUpgradeStates } = useSupplierStore.getState()
  const coinsAfterProduction = useResourceStore.getState().globalResources['pantins_coins']
  const availableCoins = coinsAfterProduction ? coinsAfterProduction.amount : new Decimal(0)

  const supplierResult = calcSupplierTick(
    suppliers, ALL_SUPPLIERS, ALL_SUPPLIER_UPGRADES, supplierUpgradeStates, availableCoins, delta,
  )
  if (Object.keys(supplierResult.resourceDeltas).length > 0) {
    useResourceStore.getState().applyDeltas(supplierResult.resourceDeltas)
  }

  // 4. Display per-second rates (include all known resources so stale values get zeroed)
  const knownResources = resourceStore.getAllResources()
  const displayRates = buildDisplayPerSecond(totalResult.totalNet, buildingDeltas, supplierResult, delta)
  for (const rid of Object.keys(knownResources)) {
    if (!(rid in displayRates)) {
      displayRates[rid] = new Decimal(0)
    }
  }
  resourceStore.updatePerSecond(displayRates)

  // 5. Unlocks
  checkBuildingAndResourceUnlocks()
  checkProductUnlocks()
}

// ─── Game loop ──────────────────────────────────────────────────

export function useGameLoop() {
  const lastTimeRef = useRef<number>(0)
  const rafRef = useRef<number>(0)
  const backgroundIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastBackgroundTimeRef = useRef<number>(0)

  const tick = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp
      rafRef.current = requestAnimationFrame(tick)
      return
    }

    const rawDelta = (timestamp - lastTimeRef.current) / 1000
    const delta = Math.min(rawDelta, 1)
    lastTimeRef.current = timestamp

    executeTick(delta)

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  // Start background interval (called when tab becomes hidden)
  const startBackground = useCallback(() => {
    if (backgroundIntervalRef.current) return
    cancelAnimationFrame(rafRef.current)
    lastBackgroundTimeRef.current = Date.now()

    backgroundIntervalRef.current = setInterval(() => {
      const now = Date.now()
      const rawDelta = (now - lastBackgroundTimeRef.current) / 1000
      const delta = Math.min(rawDelta, 2) // allow slightly larger ticks in background
      lastBackgroundTimeRef.current = now
      executeTick(delta)
    }, BACKGROUND_INTERVAL_MS)
  }, [])

  // Stop background interval, resume RAF (called when tab becomes visible)
  const stopBackground = useCallback(() => {
    if (!backgroundIntervalRef.current) return
    clearInterval(backgroundIntervalRef.current)
    backgroundIntervalRef.current = null

    // Reset RAF timing to avoid a large delta jump
    lastTimeRef.current = 0
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)

    const onVisibilityChange = () => {
      if (document.hidden) {
        startBackground()
      } else {
        stopBackground()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelAnimationFrame(rafRef.current)
      if (backgroundIntervalRef.current) {
        clearInterval(backgroundIntervalRef.current)
      }
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [tick, startBackground, stopBackground])
}
