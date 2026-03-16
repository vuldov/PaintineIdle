import { create } from 'zustand'
import type { SynergyBonuses } from '@/types/synergies'
import { getDefaultSynergyBonuses } from '@/mechanics/synergyMechanics'

// ─── Interface ──────────────────────────────────────────────────

interface SynergyStore {
  /** Computed synergy bonuses, updated every tick */
  bonuses: SynergyBonuses

  /** Raw input data cached for UI display */
  activeProductIds: string[]
  totalBuildingCount: number
  totalUpgradeCount: number

  /** Update synergy bonuses (called from game loop) */
  updateBonuses: (
    bonuses: SynergyBonuses,
    activeProductIds: string[],
    totalBuildingCount: number,
    totalUpgradeCount: number,
  ) => void
}

// ─── Store ──────────────────────────────────────────────────────

export const useSynergyStore = create<SynergyStore>((set) => ({
  bonuses: getDefaultSynergyBonuses(),
  activeProductIds: [],
  totalBuildingCount: 0,
  totalUpgradeCount: 0,

  updateBonuses: (bonuses, activeProductIds, totalBuildingCount, totalUpgradeCount) => {
    set({ bonuses, activeProductIds, totalBuildingCount, totalUpgradeCount })
  },
}))
