import { useCallback, useEffect, useRef } from 'react'
import type Decimal from 'decimal.js'
import type { ResourceId, ProductId, Upgrade } from '@/types'
import { PANTINS_COINS_ID } from '@/types'
import { calcTotalProduction, calcClampedDelta } from '@/mechanics/productionMechanics'
import { calcSynergyBonuses } from '@/mechanics/synergyMechanics'
import type { SynergyCalcInput } from '@/mechanics/synergyMechanics'
import { COMBO_DEFINITIONS } from '@/lib/synergies/combos'
import { useResourceStore } from '@/store/resourceStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { useCraftingStore } from '@/store/craftingStore'
import { useProductStore } from '@/store/productStore'
import { useSynergyStore } from '@/store/synergyStore'
import {
  PRODUCT_REGISTRY,
  PRODUCT_ORDER,
  ALL_BUILDINGS as ALL_BUILDING_DATA,
  SHARED_RESOURCE_UNLOCK_THRESHOLDS,
  getAllBuildingUnlockThresholds,
} from '@/lib/products/registry'

/**
 * Check and unlock buildings and resources.
 */
function checkUnlocks() {
  const resourceStore = useResourceStore.getState()
  const allResources = resourceStore.getAllResources()
  const buildingStore = useBuildingStore.getState()

  // Building unlocks (all products)
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

  // Shared resource unlocks
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

/**
 * Check if new products should be unlocked based on pantins_coins totalEarned.
 */
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
    }
  }
}

/**
 * Game loop using requestAnimationFrame.
 */
export function useGameLoop() {
  const lastTimeRef = useRef<number>(0)
  const rafRef = useRef<number>(0)

  const tick = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp
      rafRef.current = requestAnimationFrame(tick)
      return
    }

    const rawDelta = (timestamp - lastTimeRef.current) / 1000
    const delta = Math.min(rawDelta, 1)
    lastTimeRef.current = timestamp

    // 1. Tick all active crafting tasks
    useCraftingStore.getState().tickCrafting(delta)

    // 2. Calculate production for all unlocked products
    const { unlockedProducts } = useProductStore.getState()
    const buildingStore = useBuildingStore.getState()
    const { upgrades } = useUpgradeStore.getState()
    const resourceStore = useResourceStore.getState()

    // Compute synergy bonuses
    const allBuildings = buildingStore.getAllBuildings()
    const allResources = resourceStore.getAllResources()

    // Determine active products (products with at least 1 building in cuisson or full_pipeline)
    const activeProductIds: ProductId[] = []
    for (const productId of unlockedProducts) {
      const productBuildings = buildingStore.buildings[productId as ProductId] ?? {}
      const bundle = PRODUCT_REGISTRY[productId as ProductId]
      if (!bundle) continue
      let isActive = false
      for (const [bid, building] of Object.entries(productBuildings)) {
        if (building.count <= 0) continue
        const data = bundle.buildings[bid]
        if (data && (data.pipelineRole === 'cuisson' || data.pipelineRole === 'full_pipeline')) {
          isActive = true
          break
        }
      }
      if (isActive) activeProductIds.push(productId as ProductId)
    }

    // Gather purchased upgrades
    const purchasedUpgrades: Upgrade[] = Object.values(upgrades).filter(u => u.purchased)

    // Count totals for scaling upgrades
    let totalBuildingCount = 0
    for (const building of Object.values(allBuildings)) {
      totalBuildingCount += building.count
    }
    const totalUpgradeCount = purchasedUpgrades.length

    // Gather resource totals for cross-product upgrades
    const resourceTotals: Record<string, Decimal> = {}
    for (const [rid, res] of Object.entries(allResources)) {
      resourceTotals[rid] = res.totalEarned
    }

    const synergyInput: SynergyCalcInput = {
      allBuildings,
      allBuildingData: ALL_BUILDING_DATA,
      purchasedUpgrades,
      activeProductIds,
      comboDefinitions: COMBO_DEFINITIONS,
      totalBuildingCount,
      totalUpgradeCount,
      resourceTotals,
    }

    const synergyBonuses = calcSynergyBonuses(synergyInput)

    // Update synergy store for UI components
    useSynergyStore.getState().updateBonuses(
      synergyBonuses,
      activeProductIds,
      totalBuildingCount,
      totalUpgradeCount,
    )

    const totalResult = calcTotalProduction(
      unlockedProducts,
      PRODUCT_REGISTRY,
      buildingStore.buildings,
      upgrades,
      synergyBonuses,
    )

    // 3. Apply clamped deltas
    const deltas = calcClampedDelta(totalResult, allResources, delta)

    resourceStore.applyDeltas(deltas)
    resourceStore.updatePerSecond(totalResult.totalNet)

    // 4. Check unlocks
    checkUnlocks()
    checkProductUnlocks()

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(rafRef.current) }
  }, [tick])
}
