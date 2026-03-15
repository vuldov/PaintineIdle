import { create } from 'zustand'
import Decimal from 'decimal.js'
import type { Upgrade, UpgradeId } from '@/types'
import { UPGRADES_DATA } from '@/lib/upgrades'
import { useResourceStore } from '@/store/resourceStore'

// ─── État initial ────────────────────────────────────────────────

function createInitialUpgrades(): Record<UpgradeId, Upgrade> {
  const upgrades: Record<UpgradeId, Upgrade> = {}
  for (const [id, data] of Object.entries(UPGRADES_DATA)) {
    upgrades[id] = {
      id,
      name: data.name,
      description: data.description,
      purchased: false,
      cost: data.cost,
      costResource: data.costResource,
      effect: data.effect,
      unlockCondition: data.unlockCondition,
    }
  }
  return upgrades
}

// ─── Interface ───────────────────────────────────────────────────

interface UpgradeStore {
  upgrades: Record<UpgradeId, Upgrade>

  /** Achète une amélioration. Retourne true si succès. */
  buyUpgrade: (upgradeId: UpgradeId) => boolean

  /** Remet les upgrades à zéro (prestige) */
  resetUpgrades: () => void
}

// ─── Store ───────────────────────────────────────────────────────

export const useUpgradeStore = create<UpgradeStore>((set, get) => ({
  upgrades: createInitialUpgrades(),

  buyUpgrade: (upgradeId) => {
    const upgrade = get().upgrades[upgradeId]
    if (!upgrade || upgrade.purchased) return false

    const resourceStore = useResourceStore.getState()
    if (!resourceStore.canAfford(upgrade.costResource, upgrade.cost)) return false

    resourceStore.spendResource(upgrade.costResource, upgrade.cost)

    set((state) => ({
      upgrades: {
        ...state.upgrades,
        [upgradeId]: {
          ...state.upgrades[upgradeId],
          purchased: true,
        },
      },
    }))

    return true
  },

  resetUpgrades: () => {
    set({ upgrades: createInitialUpgrades() })
  },
}))

// ─── Helpers (fonctions pures, lisent le state mais pas de side-effect) ──

/**
 * Vérifie si une amélioration est visible (condition de déblocage remplie).
 */
export function isUpgradeVisible(
  upgradeId: UpgradeId,
  resources: ReturnType<typeof useResourceStore.getState>['resources'],
  buildings: Record<string, { count: number }>,
  purchasedUpgrades: Record<UpgradeId, { purchased: boolean }>,
): boolean {
  const data = UPGRADES_DATA[upgradeId]
  if (!data) return false

  const cond = data.unlockCondition

  switch (cond.type) {
    case 'resource_threshold': {
      if (!cond.resourceId) return false
      const resource = resources[cond.resourceId]
      return resource.totalEarned.gte(cond.threshold)
    }
    case 'building_count': {
      if (!cond.buildingId) return false
      const building = buildings[cond.buildingId]
      return building ? new Decimal(building.count).gte(cond.threshold) : false
    }
    case 'upgrade_purchased': {
      if (!cond.upgradeId) return false
      return purchasedUpgrades[cond.upgradeId]?.purchased ?? false
    }
    default:
      return false
  }
}
