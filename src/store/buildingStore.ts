import { create } from 'zustand'
import type { Building, BuildingId } from '@/types'
import { BUILDINGS_DATA } from '@/lib/constants'
import { calcCost, calcCostReduction } from '@/mechanics/productionMechanics'
import { useResourceStore } from '@/store/resourceStore'
import { useUpgradeStore } from '@/store/upgradeStore'

// ─── État initial des bâtiments ──────────────────────────────────

function createInitialBuildings(): Record<BuildingId, Building> {
  const buildings = {} as Record<BuildingId, Building>
  for (const [id, data] of Object.entries(BUILDINGS_DATA)) {
    const buildingId = id as BuildingId
    buildings[buildingId] = {
      id: buildingId,
      count: 0,
      baseCost: data.baseCost,
      costResource: data.costResource,
      costMultiplier: data.costMultiplier,
      baseProduction: data.baseProduction,
      producedResource: data.producedResource,
      unlocked: buildingId === 'fournil', // Seul le fournil est débloqué au départ
    }
  }
  return buildings
}

// ─── Interface du store ──────────────────────────────────────────

interface BuildingStore {
  buildings: Record<BuildingId, Building>

  /** Achète un bâtiment. Retourne true si l'achat a réussi. */
  buyBuilding: (buildingId: BuildingId) => boolean

  /** Débloque un bâtiment */
  unlockBuilding: (buildingId: BuildingId) => void

  /** Remet les bâtiments à zéro (prestige) */
  resetBuildings: () => void
}

// ─── Store ───────────────────────────────────────────────────────

export const useBuildingStore = create<BuildingStore>((set, get) => ({
  buildings: createInitialBuildings(),

  buyBuilding: (buildingId) => {
    const building = get().buildings[buildingId]
    if (!building.unlocked) return false

    const { upgrades } = useUpgradeStore.getState()
    const costReduction = calcCostReduction(upgrades)
    const cost = calcCost(building, building.count, costReduction)
    const resourceStore = useResourceStore.getState()

    if (!resourceStore.canAfford(building.costResource, cost)) return false

    resourceStore.spendResource(building.costResource, cost)

    set((state) => ({
      buildings: {
        ...state.buildings,
        [buildingId]: {
          ...state.buildings[buildingId],
          count: state.buildings[buildingId].count + 1,
        },
      },
    }))

    return true
  },

  unlockBuilding: (buildingId) => {
    set((state) => ({
      buildings: {
        ...state.buildings,
        [buildingId]: {
          ...state.buildings[buildingId],
          unlocked: true,
        },
      },
    }))
  },

  resetBuildings: () => {
    set({ buildings: createInitialBuildings() })
  },
}))
