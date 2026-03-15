import { create } from 'zustand'
import type { Building, BuildingId, ProductId } from '@/types'
import { PRODUCT_REGISTRY, getBuildingProduct } from '@/lib/products/registry'
import { calcCost, calcCostReduction } from '@/mechanics/productionMechanics'
import { useResourceStore } from '@/store/resourceStore'
import { useUpgradeStore } from '@/store/upgradeStore'

// ─── Initial state ──────────────────────────────────────────────

function createInitialBuildings(): Record<ProductId, Record<string, Building>> {
  const result = {} as Record<ProductId, Record<string, Building>>
  for (const [productId, bundle] of Object.entries(PRODUCT_REGISTRY)) {
    const buildings: Record<string, Building> = {}
    for (const [id, data] of Object.entries(bundle.buildings)) {
      buildings[id] = {
        id: data.id,
        count: 0,
        baseCost: data.baseCost,
        costResource: data.costResource,
        costMultiplier: data.costMultiplier,
        baseProduction: data.baseProduction,
        producedResource: data.producedResource,
        unlocked: false,
      }
    }
    result[productId as ProductId] = buildings
  }
  return result
}

// ─── Interface ──────────────────────────────────────────────────

interface BuildingStore {
  buildings: Record<ProductId, Record<string, Building>>

  /** Get a building by ID (searches all products) */
  getBuilding: (id: BuildingId) => Building | undefined

  /** Get all buildings flattened */
  getAllBuildings: () => Record<string, Building>

  /** Get buildings for a specific product */
  getBuildingsForProduct: (productId: ProductId) => Record<string, Building>

  /** Buy a building */
  buyBuilding: (id: BuildingId) => boolean

  /** Unlock a building */
  unlockBuilding: (id: BuildingId) => void

  /** Reset building counts (prestige) */
  resetBuildings: () => void
}

// ─── Store ──────────────────────────────────────────────────────

export const useBuildingStore = create<BuildingStore>((set, get) => ({
  buildings: createInitialBuildings(),

  getBuilding: (id) => {
    const bid = id as string
    for (const productBuildings of Object.values(get().buildings)) {
      if (productBuildings[bid]) return productBuildings[bid]
    }
    return undefined
  },

  getAllBuildings: () => {
    const all: Record<string, Building> = {}
    for (const productBuildings of Object.values(get().buildings)) {
      Object.assign(all, productBuildings)
    }
    return all
  },

  getBuildingsForProduct: (productId) => {
    return get().buildings[productId] ?? {}
  },

  buyBuilding: (id) => {
    const bid = id as string
    const productId = getBuildingProduct(bid)
    if (!productId) return false

    const building = get().buildings[productId]?.[bid]
    if (!building || !building.unlocked) return false

    const { upgrades } = useUpgradeStore.getState()
    // Filter upgrades to same product scope for cost reduction
    const scopedUpgrades = Object.fromEntries(
      Object.entries(upgrades).filter(([, u]) => u.scope === productId || u.scope === 'global')
    )
    const costReduction = calcCostReduction(scopedUpgrades)
    const cost = calcCost(building, building.count, costReduction)
    const resourceStore = useResourceStore.getState()

    if (!resourceStore.canAfford(building.costResource, cost)) return false

    resourceStore.spendResource(building.costResource, cost)

    set((state) => ({
      buildings: {
        ...state.buildings,
        [productId]: {
          ...state.buildings[productId],
          [bid]: {
            ...state.buildings[productId][bid],
            count: state.buildings[productId][bid].count + 1,
          },
        },
      },
    }))

    return true
  },

  unlockBuilding: (id) => {
    const bid = id as string
    const productId = getBuildingProduct(bid)
    if (!productId) return

    set((state) => ({
      buildings: {
        ...state.buildings,
        [productId]: {
          ...state.buildings[productId],
          [bid]: {
            ...state.buildings[productId][bid],
            unlocked: true,
          },
        },
      },
    }))
  },

  resetBuildings: () => {
    set({ buildings: createInitialBuildings() })
  },
}))
