import { create } from 'zustand'
import Decimal from 'decimal.js'
import type { Upgrade, UpgradeId, Resource } from '@/types'
import { ALL_UPGRADES } from '@/lib/products/registry'
import { useResourceStore } from '@/store/resourceStore'

// ─── Initial state ──────────────────────────────────────────────

function createInitialUpgrades(): Record<string, Upgrade> {
  const upgrades: Record<string, Upgrade> = {}
  for (const [id, data] of Object.entries(ALL_UPGRADES)) {
    upgrades[id] = {
      id: data.id,
      name: data.name,
      description: data.description,
      purchased: false,
      cost: data.cost,
      costResource: data.costResource,
      effect: data.effect,
      unlockCondition: data.unlockCondition,
      scope: data.scope,
      category: data.category,
    }
  }
  return upgrades
}

// ─── Interface ──────────────────────────────────────────────────

interface UpgradeStore {
  upgrades: Record<string, Upgrade>

  /** Buy an upgrade. Returns true if successful. */
  buyUpgrade: (upgradeId: UpgradeId) => boolean

  /** Reset upgrades to initial state */
  resetUpgrades: () => void
}

// ─── Store ──────────────────────────────────────────────────────

export const useUpgradeStore = create<UpgradeStore>((set, get) => ({
  upgrades: createInitialUpgrades(),

  buyUpgrade: (upgradeId) => {
    const uid = upgradeId as string
    const upgrade = get().upgrades[uid]
    if (!upgrade || upgrade.purchased) return false

    const resourceStore = useResourceStore.getState()
    if (!resourceStore.canAfford(upgrade.costResource, upgrade.cost)) return false

    resourceStore.spendResource(upgrade.costResource, upgrade.cost)

    set((state) => ({
      upgrades: {
        ...state.upgrades,
        [uid]: {
          ...state.upgrades[uid],
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

// ─── Visibility check (pure function) ──────────────────────────

/**
 * Check if an upgrade should be visible based on its unlock condition.
 */
export function isUpgradeVisible(
  upgradeId: string,
  allResources: Record<string, Resource>,
  allBuildings: Record<string, { count: number }>,
  purchasedUpgrades: Record<string, { purchased: boolean }>,
): boolean {
  const data = ALL_UPGRADES[upgradeId]
  if (!data) return false

  const cond = data.unlockCondition

  switch (cond.type) {
    case 'resource_threshold': {
      if (!cond.resourceId) return false
      const rid = cond.resourceId as string
      const resource = allResources[rid]
      if (!resource) return false
      return resource.totalEarned.gte(cond.threshold)
    }
    case 'building_count': {
      if (!cond.buildingId) return false
      const bid = cond.buildingId as string
      const building = allBuildings[bid]
      return building ? new Decimal(building.count).gte(cond.threshold) : false
    }
    case 'upgrade_purchased': {
      if (!cond.upgradeId) return false
      const uid = cond.upgradeId as string
      return purchasedUpgrades[uid]?.purchased ?? false
    }
    default:
      return false
  }
}
