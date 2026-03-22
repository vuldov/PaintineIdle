import { create } from 'zustand'
import Decimal from 'decimal.js'
import type { Building, BuildingId, ProductId } from '@/types'
import { MILESTONE_THRESHOLDS } from '@/types'
import { PRODUCT_REGISTRY, getBuildingProduct } from '@/lib/products/registry'
import { calcCost, calcCostReduction, calcBulkCost, calcMaxAffordable } from '@/mechanics/productionMechanics'
import { useResourceStore } from '@/store/resourceStore'
import { useUpgradeStore } from '@/store/upgradeStore'

export type BuyMode = '1' | '10' | 'next' | 'max'

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
  buyMode: BuyMode

  /** Get a building by ID (searches all products) */
  getBuilding: (id: BuildingId) => Building | undefined

  /** Get all buildings flattened */
  getAllBuildings: () => Record<string, Building>

  /** Get buildings for a specific product */
  getBuildingsForProduct: (productId: ProductId) => Record<string, Building>

  /** Set buy mode */
  setBuyMode: (mode: BuyMode) => void

  /** Buy building(s) according to current buyMode */
  buyBuilding: (id: BuildingId) => boolean

  /** Sell one building */
  sellBuilding: (id: BuildingId) => boolean

  /** Unlock a building */
  unlockBuilding: (id: BuildingId) => void

  /** Reset building counts to initial state */
  resetBuildings: () => void
}

// ─── Store ──────────────────────────────────────────────────────

/** Helper: get scoped upgrades + cost reduction for a product */
function getScopedCostReduction(productId: string) {
  const { upgrades } = useUpgradeStore.getState()
  const scopedUpgrades = Object.fromEntries(
    Object.entries(upgrades).filter(([, u]) => u.scope === productId || u.scope === 'global')
  )
  return calcCostReduction(scopedUpgrades)
}

/** Resolve how many buildings to buy based on mode */
function resolveAmount(mode: BuyMode, building: Building, budget: Decimal, costReduction: Decimal): number {
  switch (mode) {
    case '1': return 1
    case '10': return 10
    case 'next': {
      const next = MILESTONE_THRESHOLDS.find(t => t > building.count)
      return next ? next - building.count : 1
    }
    case 'max':
      return calcMaxAffordable(building, building.count, budget, costReduction)
  }
}

export const useBuildingStore = create<BuildingStore>((set, get) => ({
  buildings: createInitialBuildings(),
  buyMode: '1' as BuyMode,

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

  setBuyMode: (mode) => set({ buyMode: mode }),

  buyBuilding: (id) => {
    const bid = id as string
    const productId = getBuildingProduct(bid)
    if (!productId) return false

    const building = get().buildings[productId]?.[bid]
    if (!building || !building.unlocked) return false

    const costReduction = getScopedCostReduction(productId)
    const resourceStore = useResourceStore.getState()
    const budget = resourceStore.getResource(building.costResource)?.amount ?? new Decimal(0)

    const amount = resolveAmount(get().buyMode, building, budget, costReduction)
    if (amount <= 0) return false

    const cost = amount === 1
      ? calcCost(building, building.count, costReduction)
      : calcBulkCost(building, building.count, amount, costReduction)

    if (!resourceStore.canAfford(building.costResource, cost)) return false
    resourceStore.spendResource(building.costResource, cost)

    set((state) => ({
      buildings: {
        ...state.buildings,
        [productId]: {
          ...state.buildings[productId],
          [bid]: {
            ...state.buildings[productId][bid],
            count: state.buildings[productId][bid].count + amount,
          },
        },
      },
    }))

    return true
  },

  sellBuilding: (id) => {
    const bid = id as string
    const productId = getBuildingProduct(bid)
    if (!productId) return false

    const building = get().buildings[productId]?.[bid]
    if (!building || building.count <= 0) return false

    // Refund 50% of the last building's cost
    const costReduction = getScopedCostReduction(productId)
    const refund = calcCost(building, building.count - 1, costReduction).mul(0.5)
    useResourceStore.getState().applyDeltas({ [building.costResource as string]: refund })

    set((state) => ({
      buildings: {
        ...state.buildings,
        [productId]: {
          ...state.buildings[productId],
          [bid]: {
            ...state.buildings[productId][bid],
            count: state.buildings[productId][bid].count - 1,
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
    set({ buildings: createInitialBuildings(), buyMode: '1' })
  },
}))
