import Decimal from 'decimal.js'
import type { BuildingId, PipelineRole, MilestoneData, MilestoneEffect, MilestoneThreshold, UpgradeData, ResourceId, EntityScope, UpgradeEffectType } from '@/types'
import { MILESTONE_THRESHOLDS, upgradeId, PANTINS_COINS_ID } from '@/types'
// ─── Templates per role ──────────────────────────────────────────

type EffectTemplate = { effects: Array<{ type: MilestoneEffect['type']; value: number }> }

const PETRISSAGE_TEMPLATE: Record<MilestoneThreshold, EffectTemplate> = {
  1:   { effects: [{ type: 'building_production_multiplier', value: 1.5 }] },
  5:   { effects: [{ type: 'building_production_multiplier', value: 1.5 }] },
  10:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  25:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  50:  { effects: [{ type: 'building_production_multiplier', value: 2.5 }] },
  75:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  100: { effects: [{ type: 'building_production_multiplier', value: 3 }] },
  150: { effects: [{ type: 'building_production_multiplier', value: 3 }] },
  200: { effects: [{ type: 'building_production_multiplier', value: 5 }] },
  250: { effects: [{ type: 'building_production_multiplier', value: 5 }] },
}

const CUISSON_TEMPLATE: Record<MilestoneThreshold, EffectTemplate> = {
  1:   { effects: [{ type: 'building_production_multiplier', value: 1.5 }] },
  5:   { effects: [{ type: 'building_production_multiplier', value: 1.5 }] },
  10:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  25:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  50:  { effects: [{ type: 'building_production_multiplier', value: 2.5 }] },
  75:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  100: { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  150: { effects: [{ type: 'building_production_multiplier', value: 3 }] },
  200: { effects: [{ type: 'building_production_multiplier', value: 3 }] },
  250: { effects: [{ type: 'building_production_multiplier', value: 5 }] },
}

const VENTE_TEMPLATE: Record<MilestoneThreshold, EffectTemplate> = {
  1:   { effects: [{ type: 'building_production_multiplier', value: 1.5 }] },
  5:   { effects: [{ type: 'building_production_multiplier', value: 1.5 }] },
  10:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  25:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  50:  { effects: [{ type: 'building_production_multiplier', value: 2.5 }] },
  75:  { effects: [{ type: 'building_production_multiplier', value: 3 }] },
  100: { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  150: { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  200: { effects: [{ type: 'building_production_multiplier', value: 3 }] },
  250: { effects: [{ type: 'building_production_multiplier', value: 5 }] },
}

const BALANCED_TEMPLATE: Record<MilestoneThreshold, EffectTemplate> = {
  1:   { effects: [{ type: 'building_production_multiplier', value: 1.5 }] },
  5:   { effects: [{ type: 'building_production_multiplier', value: 1.5 }] },
  10:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  25:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  50:  { effects: [{ type: 'building_production_multiplier', value: 2.5 }] },
  75:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  100: { effects: [{ type: 'building_production_multiplier', value: 3 }] },
  150: { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  200: { effects: [{ type: 'building_production_multiplier', value: 3 }] },
  250: { effects: [{ type: 'building_production_multiplier', value: 5 }] },
}

function getTemplate(role: PipelineRole): Record<MilestoneThreshold, EffectTemplate> {
  switch (role) {
    case 'petrissage': return PETRISSAGE_TEMPLATE
    case 'cuisson': return CUISSON_TEMPLATE
    case 'vente': return VENTE_TEMPLATE
    default: return BALANCED_TEMPLATE
  }
}

function effectDescription(e: { type: MilestoneEffect['type']; value: number }): string {
  switch (e.type) {
    case 'building_production_multiplier': return `x${e.value} production`
  }
}

// ─── Milestone upgrade costs ─────────────────────────────────────

const MILESTONE_COSTS: Record<MilestoneThreshold, Decimal> = {
  1:   new Decimal(10),
  5:   new Decimal(50),
  10:  new Decimal(200),
  25:  new Decimal(1_000),
  50:  new Decimal(5_000),
  75:  new Decimal(25_000),
  100: new Decimal(100_000),
  150: new Decimal(500_000),
  200: new Decimal(2_500_000),
  250: new Decimal(10_000_000),
}

/** Thresholds 5 and 75 cost intermediate resources instead of coins */
const INTERMEDIATE_COST_THRESHOLDS: ReadonlySet<MilestoneThreshold> = new Set([5, 75])

// ─── Effect type mapping ──────────────────────────────────────────

function milestoneEffectToUpgradeEffectType(_e: MilestoneEffect['type']): UpgradeEffectType {
  return 'building_multiplier'
}

// ─── Generate result type ────────────────────────────────────────

export interface GeneratedMilestones {
  /** MilestoneData for dot display in BatimentCard */
  milestones: MilestoneData[]
  /** UpgradeData entries to merge into the product's upgrades */
  upgrades: Record<string, UpgradeData>
  /** Ordered UpgradeId strings for upgradeOrder */
  upgradeOrder: string[]
}

/**
 * Generate 10 milestones for a building based on its pipeline role.
 * Returns both MilestoneData (for dots) and UpgradeData (for purchase).
 * Pure function -- no store imports.
 */
export function generateMilestones(
  bId: BuildingId,
  pipelineRole: PipelineRole,
  buildingName: string,
  scope: EntityScope,
  intermediateResource?: ResourceId,
  costScale: number = 1,
): GeneratedMilestones {
  const template = getTemplate(pipelineRole)
  const milestones: MilestoneData[] = []
  const upgrades: Record<string, UpgradeData> = {}
  const upgradeOrder: string[] = []
  const THRESHOLD_NAMES: Record<MilestoneThreshold, string> = {
    1: 'Apprenti', 5: 'Compagnon', 10: 'Artisan',
    25: 'Expert', 50: 'Maitre', 75: 'Grand Maitre',
    100: 'Legendaire', 150: 'Mythique', 200: 'Transcendant', 250: 'Divin',
  }

  for (const threshold of MILESTONE_THRESHOLDS) {
    const entry = template[threshold]
    const effects: MilestoneEffect[] = entry.effects.map(e => ({
      type: e.type,
      value: new Decimal(e.value),
    }))

    const effectDescs = entry.effects.map(effectDescription).join(' + ')
    const id = `milestone_${bId as string}_${threshold}`
    const thresholdName = THRESHOLD_NAMES[threshold]

    // MilestoneData for dots
    milestones.push({
      id,
      buildingId: bId,
      threshold,
      name: `${thresholdName} - ${buildingName}`,
      description: `${threshold} ${buildingName} : ${effectDescs}`,
      effects,
    })

    // UpgradeData for the purchase system
    // Determine cost resource: thresholds 5 and 75 use intermediate resource if available
    const useIntermediate = INTERMEDIATE_COST_THRESHOLDS.has(threshold) && intermediateResource
    const costResource = useIntermediate ? intermediateResource : PANTINS_COINS_ID
    const cost = MILESTONE_COSTS[threshold].mul(costScale)

    // All milestone effects are building_production_multiplier
    const primaryEffect = entry.effects[0]

    const upgradeData: UpgradeData = {
      id: upgradeId(id),
      name: `${thresholdName} - ${buildingName}`,
      description: `${threshold} ${buildingName} : ${effectDescs}`,
      emoji: '🏆',
      cost,
      costResource,
      effect: {
        type: milestoneEffectToUpgradeEffectType(primaryEffect.type),
        targetBuilding: bId,
        multiplier: new Decimal(primaryEffect.value),
      },
      unlockCondition: {
        type: 'building_count',
        buildingId: bId,
        threshold: new Decimal(threshold),
      },
      scope,
      category: 'milestone',
    }

    upgrades[id] = upgradeData
    upgradeOrder.push(id)
  }

  return { milestones, upgrades, upgradeOrder }
}
