import Decimal from 'decimal.js'
import type { BuildingId, PipelineRole, MilestoneData, MilestoneEffect, MilestoneThreshold, UpgradeData, ResourceId, EntityScope, UpgradeEffectType } from '@/types'
import { MILESTONE_THRESHOLDS, upgradeId, PANTINS_COINS_ID } from '@/types'

// ─── Templates per role ──────────────────────────────────────────

type EffectTemplate = { effects: Array<{ type: MilestoneEffect['type']; value: number }> }

const PETRISSAGE_TEMPLATE: Record<MilestoneThreshold, EffectTemplate> = {
  1:   { effects: [{ type: 'building_production_multiplier', value: 1.5 }] },
  5:   { effects: [{ type: 'crafting_duration_reduction', value: 0.85 }] },
  10:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  25:  { effects: [{ type: 'crafting_ratio_bonus', value: 1.5 }] },
  50:  { effects: [{ type: 'crafting_auto_unlock', value: 1 }] },
  75:  { effects: [{ type: 'crafting_duration_reduction', value: 0.7 }] },
  100: { effects: [{ type: 'building_production_multiplier', value: 3 }] },
  150: { effects: [{ type: 'crafting_ratio_bonus', value: 2 }] },
  200: { effects: [{ type: 'building_production_multiplier', value: 5 }] },
  250: { effects: [{ type: 'crafting_duration_reduction', value: 0.5 }, { type: 'building_production_multiplier', value: 2 }] },
}

const CUISSON_TEMPLATE: Record<MilestoneThreshold, EffectTemplate> = {
  1:   { effects: [{ type: 'building_production_multiplier', value: 1.5 }] },
  5:   { effects: [{ type: 'building_production_multiplier', value: 1.5 }] },
  10:  { effects: [{ type: 'crafting_ratio_bonus', value: 1.5 }] },
  25:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  50:  { effects: [{ type: 'crafting_auto_unlock', value: 1 }] },
  75:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  100: { effects: [{ type: 'crafting_duration_reduction', value: 0.7 }] },
  150: { effects: [{ type: 'building_production_multiplier', value: 3 }] },
  200: { effects: [{ type: 'crafting_ratio_bonus', value: 2 }] },
  250: { effects: [{ type: 'building_production_multiplier', value: 5 }] },
}

const VENTE_TEMPLATE: Record<MilestoneThreshold, EffectTemplate> = {
  1:   { effects: [{ type: 'building_production_multiplier', value: 1.5 }] },
  5:   { effects: [{ type: 'crafting_ratio_bonus', value: 1.5 }] },
  10:  { effects: [{ type: 'crafting_duration_reduction', value: 0.85 }] },
  25:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  50:  { effects: [{ type: 'crafting_auto_unlock', value: 1 }] },
  75:  { effects: [{ type: 'crafting_ratio_bonus', value: 2 }] },
  100: { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  150: { effects: [{ type: 'crafting_duration_reduction', value: 0.6 }] },
  200: { effects: [{ type: 'building_production_multiplier', value: 3 }] },
  250: { effects: [{ type: 'crafting_ratio_bonus', value: 3 }, { type: 'building_production_multiplier', value: 2 }] },
}

const BALANCED_TEMPLATE: Record<MilestoneThreshold, EffectTemplate> = {
  1:   { effects: [{ type: 'building_production_multiplier', value: 1.5 }] },
  5:   { effects: [{ type: 'crafting_ratio_bonus', value: 1.3 }] },
  10:  { effects: [{ type: 'crafting_duration_reduction', value: 0.85 }] },
  25:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  50:  { effects: [{ type: 'crafting_auto_unlock', value: 1 }] },
  75:  { effects: [{ type: 'building_production_multiplier', value: 2 }] },
  100: { effects: [{ type: 'crafting_ratio_bonus', value: 2 }] },
  150: { effects: [{ type: 'crafting_duration_reduction', value: 0.7 }] },
  200: { effects: [{ type: 'building_production_multiplier', value: 3 }] },
  250: { effects: [{ type: 'building_production_multiplier', value: 3 }, { type: 'crafting_ratio_bonus', value: 2 }] },
}

function getTemplate(role: PipelineRole): Record<MilestoneThreshold, EffectTemplate> {
  switch (role) {
    case 'petrissage': return PETRISSAGE_TEMPLATE
    case 'cuisson': return CUISSON_TEMPLATE
    case 'vente': return VENTE_TEMPLATE
    default: return BALANCED_TEMPLATE
  }
}

// ─── French milestone name/description generators ────────────────

const THRESHOLD_NAMES: Record<MilestoneThreshold, string> = {
  1: 'Premier pas',
  5: 'Apprenti',
  10: 'Confirme',
  25: 'Expert',
  50: 'Maitre',
  75: 'Virtuose',
  100: 'Legendaire',
  150: 'Mythique',
  200: 'Transcendant',
  250: 'Ultime',
}

function effectDescription(e: { type: MilestoneEffect['type']; value: number }): string {
  switch (e.type) {
    case 'building_production_multiplier': return `x${e.value} production`
    case 'crafting_ratio_bonus': return `x${e.value} rendement crafting`
    case 'crafting_duration_reduction': return `x${e.value} duree crafting`
    case 'crafting_auto_unlock': return 'Crafting automatique debloque'
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

function milestoneEffectToUpgradeEffectType(e: MilestoneEffect['type']): UpgradeEffectType {
  switch (e) {
    case 'building_production_multiplier': return 'building_multiplier'
    case 'crafting_ratio_bonus': return 'crafting_ratio_bonus'
    case 'crafting_duration_reduction': return 'crafting_duration_reduction'
    case 'crafting_auto_unlock': return 'crafting_auto_unlock'
  }
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

  for (const threshold of MILESTONE_THRESHOLDS) {
    const entry = template[threshold]
    const effects: MilestoneEffect[] = entry.effects.map(e => ({
      type: e.type,
      value: new Decimal(e.value),
    }))

    const effectDescs = entry.effects.map(effectDescription).join(' + ')
    const id = `milestone_${bId as string}_${threshold}`

    // MilestoneData for dots
    milestones.push({
      id,
      buildingId: bId,
      threshold,
      name: `${THRESHOLD_NAMES[threshold]} - ${buildingName}`,
      description: `${threshold} ${buildingName} : ${effectDescs}`,
      effects,
    })

    // UpgradeData for the purchase system
    // Determine cost resource: thresholds 5 and 75 use intermediate resource if available
    const useIntermediate = INTERMEDIATE_COST_THRESHOLDS.has(threshold) && intermediateResource
    const costResource = useIntermediate ? intermediateResource : PANTINS_COINS_ID
    const cost = MILESTONE_COSTS[threshold].mul(costScale)

    // Determine the primary effect (first effect in the list)
    const primaryEffect = entry.effects[0]
    const primaryType = milestoneEffectToUpgradeEffectType(primaryEffect.type)

    // Check for a secondary building_production_multiplier
    const secondaryBuildingMult = entry.effects.find(
      (e, i) => i > 0 && e.type === 'building_production_multiplier'
    )
    // Check for secondary crafting effects (when primary is building_production_multiplier)
    const secondaryCraftingEffect = entry.effects.find(
      (e, i) => i > 0 && e.type !== 'building_production_multiplier'
    )

    // Build the upgrade effect
    const upgradeData: UpgradeData = {
      id: upgradeId(id),
      name: `${THRESHOLD_NAMES[threshold]} - ${buildingName}`,
      description: `${threshold} ${buildingName} : ${effectDescs}`,
      emoji: '🏆',
      cost,
      costResource,
      effect: {
        type: primaryType,
        targetBuilding: bId,
        multiplier: new Decimal(primaryEffect.value),
        // If primary is a crafting effect but there's also a building mult, add it
        ...(secondaryBuildingMult ? { buildingProductionMultiplier: new Decimal(secondaryBuildingMult.value) } : {}),
      },
      unlockCondition: {
        type: 'building_count',
        buildingId: bId,
        threshold: new Decimal(threshold),
      },
      scope,
      category: 'milestone',
    }

    // If primary is building_multiplier and there's a secondary crafting effect,
    // swap: make the crafting effect the primary (so it's detected by crafting store)
    // and put building mult in buildingProductionMultiplier
    if (primaryType === 'building_multiplier' && secondaryCraftingEffect) {
      upgradeData.effect = {
        type: milestoneEffectToUpgradeEffectType(secondaryCraftingEffect.type),
        targetBuilding: bId,
        multiplier: new Decimal(secondaryCraftingEffect.value),
        buildingProductionMultiplier: new Decimal(primaryEffect.value),
      }
    }

    upgrades[id] = upgradeData
    upgradeOrder.push(id)
  }

  return { milestones, upgrades, upgradeOrder }
}
