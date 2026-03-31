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
