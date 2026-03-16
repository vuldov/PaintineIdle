import { useEffect } from 'react'
import Decimal from 'decimal.js'
import type { ProductId } from '@/types'
import { useResourceStore } from '@/store/resourceStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { useProductStore } from '@/store/productStore'
import { SAVE_KEY, AUTOSAVE_INTERVAL_MS, MAX_OFFLINE_SECONDS, GAME_VERSION, PRODUCT_REGISTRY } from '@/lib/constants'
import { calcTotalProduction, calcClampedDelta } from '@/mechanics/productionMechanics'

// ─── Serialization types ────────────────────────────────────────

interface SerializedResource {
  id: string
  amount: string
  perSecond: string
  totalEarned: string
  unlocked: boolean
}

interface SerializedBuilding {
  id: string
  count: number
  baseCost: string
  costResource: string
  costMultiplier: number
  baseProduction: string
  producedResource: string
  unlocked: boolean
}

interface SaveDataV3 {
  globalResources: Record<string, SerializedResource>
  productResources: Record<string, Record<string, SerializedResource>>
  buildings: Record<string, Record<string, SerializedBuilding>>
  upgrades: Record<string, { purchased: boolean }>
  unlockedProducts: string[]
  activeProduct: string
  version: number
  lastSave: number
}

// Legacy v2 types for migration
interface SaveDataV2 {
  resources: Record<string, SerializedResource>
  buildings: Record<string, SerializedBuilding>
  upgrades?: Record<string, { purchased: boolean }>
  version: number
  lastSave: number
}

// ─── Serialization ──────────────────────────────────────────────

function serializeResource(resource: { id: { toString(): string }; amount: { toString(): string }; perSecond: { toString(): string }; totalEarned: { toString(): string }; unlocked: boolean }): SerializedResource {
  return {
    id: String(resource.id),
    amount: resource.amount.toString(),
    perSecond: resource.perSecond.toString(),
    totalEarned: resource.totalEarned.toString(),
    unlocked: resource.unlocked,
  }
}

function serializeBuilding(building: { id: { toString(): string }; count: number; baseCost: { toString(): string }; costResource: { toString(): string }; costMultiplier: number; baseProduction: { toString(): string }; producedResource: { toString(): string }; unlocked: boolean }): SerializedBuilding {
  return {
    id: String(building.id),
    count: building.count,
    baseCost: building.baseCost.toString(),
    costResource: String(building.costResource),
    costMultiplier: building.costMultiplier,
    baseProduction: building.baseProduction.toString(),
    producedResource: String(building.producedResource),
    unlocked: building.unlocked,
  }
}

function serializeSave(): SaveDataV3 {
  const { globalResources, productResources } = useResourceStore.getState()
  const { buildings } = useBuildingStore.getState()
  const { upgrades } = useUpgradeStore.getState()
  const { unlockedProducts, activeProduct } = useProductStore.getState()

  const serializedGlobal: Record<string, SerializedResource> = {}
  for (const [id, resource] of Object.entries(globalResources)) {
    serializedGlobal[id] = serializeResource(resource)
  }

  const serializedProductResources: Record<string, Record<string, SerializedResource>> = {}
  for (const [productId, resources] of Object.entries(productResources)) {
    serializedProductResources[productId] = {}
    for (const [id, resource] of Object.entries(resources)) {
      serializedProductResources[productId][id] = serializeResource(resource)
    }
  }

  const serializedBuildings: Record<string, Record<string, SerializedBuilding>> = {}
  for (const [productId, productBuildings] of Object.entries(buildings)) {
    serializedBuildings[productId] = {}
    for (const [id, building] of Object.entries(productBuildings)) {
      serializedBuildings[productId][id] = serializeBuilding(building)
    }
  }

  const serializedUpgrades: Record<string, { purchased: boolean }> = {}
  for (const [id, upgrade] of Object.entries(upgrades)) {
    serializedUpgrades[id] = { purchased: upgrade.purchased }
  }

  return {
    globalResources: serializedGlobal,
    productResources: serializedProductResources,
    buildings: serializedBuildings,
    upgrades: serializedUpgrades,
    unlockedProducts: [...unlockedProducts],
    activeProduct,
    version: GAME_VERSION,
    lastSave: Date.now(),
  }
}

function saveGame() {
  const data = serializeSave()
  localStorage.setItem(SAVE_KEY, JSON.stringify(data))
}

// ─── Migration v2 -> v3 ─────────────────────────────────────────

function migrateV2ToV3(data: SaveDataV2): SaveDataV3 {
  // Map old resource IDs to the new croissant product
  const oldToCroissantResources: Record<string, string> = {
    beurre: 'beurre',
    farine: 'farine',
    pate: 'pate_feuilletee',
    croissants: 'croissants',
  }

  const globalResources: Record<string, SerializedResource> = {}
  const croissantResources: Record<string, SerializedResource> = {}

  for (const [id, resource] of Object.entries(data.resources)) {
    if (id === 'pantins_coins') {
      globalResources[id] = { ...resource, id }
    } else if (oldToCroissantResources[id]) {
      const newId = oldToCroissantResources[id]
      croissantResources[newId] = { ...resource, id: newId }
    }
  }

  // Migrate old building IDs (they stay the same for croissants)
  const croissantBuildings: Record<string, SerializedBuilding> = {}
  for (const [id, building] of Object.entries(data.buildings)) {
    // Map producedResource
    let producedResource = building.producedResource
    if (producedResource === 'pate') producedResource = 'pate_feuilletee'
    croissantBuildings[id] = { ...building, producedResource }
  }

  // Migrate upgrades
  const upgrades: Record<string, { purchased: boolean }> = {}
  if (data.upgrades) {
    // Map old crafting recipe IDs
    const recipeIdMap: Record<string, string> = {
      petrissage: 'petrissage_croissant',
      cuisson: 'cuisson_croissant',
    }

    for (const [id, upgrade] of Object.entries(data.upgrades)) {
      // Check if the upgrade ID still exists in new data
      // Old upgrade IDs are the same for croissants product
      upgrades[id] = { purchased: upgrade.purchased }
    }

    // Update recipe-targeted upgrades: petrissage_rapide -> targets petrissage_croissant
    // This is handled in the upgrade data definitions, no ID change needed
    void recipeIdMap
  }

  return {
    globalResources,
    productResources: {
      croissants: croissantResources,
    },
    buildings: {
      croissants: croissantBuildings,
    },
    upgrades,
    unlockedProducts: ['croissants'],
    activeProduct: 'croissants',
    version: 3,
    lastSave: data.lastSave,
  }
}

// ─── Load ───────────────────────────────────────────────────────

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return

  try {
    const rawData = JSON.parse(raw) as { version?: number }

    // Handle v1 -- too old, discard
    if (!rawData.version || rawData.version < 2) {
      localStorage.removeItem(SAVE_KEY)
      return
    }

    // Migrate v2 -> v3
    let data: SaveDataV3
    if (rawData.version === 2) {
      data = migrateV2ToV3(rawData as SaveDataV2)
    } else {
      data = rawData as SaveDataV3
    }

    // Restore global resources
    const resourceState = useResourceStore.getState()
    const restoredGlobal = { ...resourceState.globalResources }
    for (const [id, serialized] of Object.entries(data.globalResources)) {
      if (restoredGlobal[id]) {
        restoredGlobal[id] = {
          id: restoredGlobal[id].id,
          amount: new Decimal(serialized.amount),
          perSecond: new Decimal(serialized.perSecond),
          totalEarned: new Decimal(serialized.totalEarned),
          unlocked: serialized.unlocked,
        }
      }
    }

    // Restore product resources
    const restoredProducts = { ...resourceState.productResources }
    for (const [productId, resources] of Object.entries(data.productResources ?? {})) {
      const pid = productId as ProductId
      if (!restoredProducts[pid]) continue
      restoredProducts[pid] = { ...restoredProducts[pid] }
      for (const [id, serialized] of Object.entries(resources)) {
        if (restoredProducts[pid][id]) {
          restoredProducts[pid][id] = {
            id: restoredProducts[pid][id].id,
            amount: new Decimal(serialized.amount),
            perSecond: new Decimal(serialized.perSecond),
            totalEarned: new Decimal(serialized.totalEarned),
            unlocked: serialized.unlocked,
          }
        }
      }
    }

    useResourceStore.setState({
      globalResources: restoredGlobal,
      productResources: restoredProducts,
    })

    // Restore buildings
    const buildingState = useBuildingStore.getState()
    const restoredBuildings = { ...buildingState.buildings }
    for (const [productId, buildings] of Object.entries(data.buildings ?? {})) {
      const pid = productId as ProductId
      if (!restoredBuildings[pid]) continue
      restoredBuildings[pid] = { ...restoredBuildings[pid] }
      for (const [id, serialized] of Object.entries(buildings)) {
        if (restoredBuildings[pid][id]) {
          restoredBuildings[pid][id] = {
            id: restoredBuildings[pid][id].id,
            count: serialized.count,
            baseCost: new Decimal(serialized.baseCost),
            costResource: restoredBuildings[pid][id].costResource,
            costMultiplier: serialized.costMultiplier,
            baseProduction: new Decimal(serialized.baseProduction),
            producedResource: restoredBuildings[pid][id].producedResource,
            unlocked: serialized.unlocked,
          }
        }
      }
    }
    useBuildingStore.setState({ buildings: restoredBuildings })

    // Restore upgrades
    if (data.upgrades) {
      const upgradeState = useUpgradeStore.getState()
      const restoredUpgrades = { ...upgradeState.upgrades }
      for (const [id, serialized] of Object.entries(data.upgrades)) {
        if (restoredUpgrades[id]) {
          restoredUpgrades[id] = {
            ...restoredUpgrades[id],
            purchased: serialized.purchased,
          }
        }
      }
      useUpgradeStore.setState({ upgrades: restoredUpgrades })
    }

    // Restore product store
    if (data.unlockedProducts) {
      useProductStore.setState({
        unlockedProducts: data.unlockedProducts as ProductId[],
        activeProduct: (data.activeProduct as ProductId) ?? 'croissants',
      })
    }

    // Offline progress
    const offlineSeconds = Math.min(
      (Date.now() - data.lastSave) / 1000,
      MAX_OFFLINE_SECONDS,
    )

    if (offlineSeconds > 1) {
      const { unlockedProducts } = useProductStore.getState()
      const buildingStoreState = useBuildingStore.getState()
      const { upgrades } = useUpgradeStore.getState()
      const resourceStoreState = useResourceStore.getState()

      const totalResult = calcTotalProduction(
        unlockedProducts,
        PRODUCT_REGISTRY,
        buildingStoreState.buildings,
        upgrades,
      )

      const allResources = resourceStoreState.getAllResources()
      const deltas = calcClampedDelta(totalResult, allResources, offlineSeconds)
      useResourceStore.getState().applyDeltas(deltas)
    }
  } catch {
    console.warn('Impossible de charger la sauvegarde, elle sera ignoree.')
  }
}

// ─── Hook ────────────────────────────────────────────────────────

export function useAutoSave() {
  useEffect(() => {
    loadGame()
  }, [])

  useEffect(() => {
    const interval = setInterval(saveGame, AUTOSAVE_INTERVAL_MS)

    const handleBeforeUnload = () => saveGame()
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      saveGame()
    }
  }, [])
}
