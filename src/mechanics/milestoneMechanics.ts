import Decimal from 'decimal.js'
import type { MilestoneData, Upgrade } from '@/types'
import { MILESTONE_THRESHOLDS } from '@/types'

/**
 * Get all milestones that are currently unlocked (threshold reached) for a given building count.
 */
export function getUnlockedMilestones(
  milestones: MilestoneData[],
  buildingCount: number,
): MilestoneData[] {
  return milestones.filter(m => buildingCount >= m.threshold)
}

/**
 * Calculate the cumulative crafting ratio bonus from purchased milestone upgrades
 * targeting the given building.
 */
export function calcMilestoneCraftingRatioBonus(
  upgrades: Record<string, Upgrade>,
  buildingId: string,
): Decimal {
  let mult = new Decimal(1)
  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    if (upgrade.category !== 'milestone') continue
    if ((upgrade.effect.targetBuilding as string) !== buildingId) continue
    if (upgrade.effect.type === 'crafting_ratio_bonus') {
      mult = mult.mul(upgrade.effect.multiplier)
    }
  }
  return mult
}

/**
 * Calculate the cumulative crafting duration multiplier from purchased milestone upgrades
 * targeting the given building.
 * Result < 1 means faster crafting.
 */
export function calcMilestoneCraftingDurationMultiplier(
  upgrades: Record<string, Upgrade>,
  buildingId: string,
): Decimal {
  let mult = new Decimal(1)
  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    if (upgrade.category !== 'milestone') continue
    if ((upgrade.effect.targetBuilding as string) !== buildingId) continue
    if (upgrade.effect.type === 'crafting_duration_reduction') {
      mult = mult.mul(upgrade.effect.multiplier)
    }
  }
  return mult
}

/**
 * Check if auto-craft is unlocked via purchased milestone upgrades for this building.
 */
export function isMilestoneAutoCraftUnlocked(
  upgrades: Record<string, Upgrade>,
  buildingId: string,
): boolean {
  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    if (upgrade.category !== 'milestone') continue
    if ((upgrade.effect.targetBuilding as string) !== buildingId) continue
    if (upgrade.effect.type === 'crafting_auto_unlock') {
      return true
    }
  }
  return false
}

/**
 * Get the next milestone that hasn't been reached yet.
 */
export function getNextMilestone(
  milestones: MilestoneData[],
  buildingCount: number,
): MilestoneData | null {
  for (const milestone of milestones) {
    if (buildingCount < milestone.threshold) {
      return milestone
    }
  }
  return null
}

/**
 * Get milestone progress summary.
 */
export function getMilestoneProgress(
  buildingCount: number,
): { achieved: number; total: number; nextThreshold: number | null } {
  const total = MILESTONE_THRESHOLDS.length
  let achieved = 0
  let nextThreshold: number | null = null

  for (const threshold of MILESTONE_THRESHOLDS) {
    if (buildingCount >= threshold) {
      achieved++
    } else if (nextThreshold === null) {
      nextThreshold = threshold
    }
  }

  return { achieved, total, nextThreshold }
}

/**
 * Check if a milestone upgrade has been purchased.
 */
export function isMilestonePurchased(
  upgrades: Record<string, Upgrade>,
  milestoneId: string,
): boolean {
  return upgrades[milestoneId]?.purchased ?? false
}
