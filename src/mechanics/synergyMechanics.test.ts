import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { calcSynergyBonuses, getDefaultSynergyBonuses } from './synergyMechanics'
import type { SynergyCalcInput } from './synergyMechanics'
import type { Building, BuildingData, Upgrade } from '@/types'
import { buildingId, upgradeId, resourceId, PANTINS_COINS_ID } from '@/types'
import type { ComboBoulangerie } from '@/types/synergies'

// ─── Helpers ────────────────────────────────────────────────────

function makeBuilding(id: string, count: number): Building {
  return {
    id: buildingId(id),
    count,
    baseCost: new Decimal(10),
    costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15,
    baseProduction: new Decimal(1),
    producedResource: resourceId('test'),
    unlocked: true,
  }
}

function makeBuildingData(id: string, aura?: BuildingData['aura']): BuildingData {
  return {
    id: buildingId(id),
    name: id,
    emoji: '',
    description: '',
    baseCost: new Decimal(10),
    costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15,
    baseProduction: new Decimal(1),
    producedResource: resourceId('test'),
    pipelineRole: 'cuisson',
    scope: 'croissants',
    aura,
  }
}

function makeBaseInput(overrides?: Partial<SynergyCalcInput>): SynergyCalcInput {
  return {
    allBuildings: {},
    allBuildingData: {},
    purchasedUpgrades: [],
    activeProductIds: [],
    comboDefinitions: [],
    totalBuildingCount: 0,
    totalUpgradeCount: 0,
    resourceTotals: {},
    ...overrides,
  }
}

// ─── Tests ──────────────────────────────────────────────────────

describe('getDefaultSynergyBonuses', () => {
  it('returns neutral values', () => {
    const defaults = getDefaultSynergyBonuses()
    expect(defaults.globalProductionMultiplier.eq(1)).toBe(true)
    expect(defaults.globalSellMultiplier.eq(1)).toBe(true)
    expect(Object.keys(defaults.productionMultipliers)).toHaveLength(0)
    expect(Object.keys(defaults.sellMultipliers)).toHaveLength(0)
    expect(Object.keys(defaults.craftingSpeedMultipliers)).toHaveLength(0)
    expect(Object.keys(defaults.ingredientMultipliers)).toHaveLength(0)
    expect(defaults.activeCombos).toHaveLength(0)
  })
})

describe('calcSynergyBonuses', () => {
  describe('empty input', () => {
    it('returns default neutral bonuses', () => {
      const result = calcSynergyBonuses(makeBaseInput())
      expect(result.globalProductionMultiplier.eq(1)).toBe(true)
      expect(result.globalSellMultiplier.eq(1)).toBe(true)
      expect(result.activeCombos).toHaveLength(0)
    })
  })

  describe('building auras', () => {
    it('applies production_bonus aura to target product', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: { fournil: makeBuilding('fournil', 10) },
        allBuildingData: {
          fournil: makeBuildingData('fournil', {
            effectType: 'production_bonus',
            bonusPerBuilding: new Decimal(0.01),
            targetProduct: 'croissants',
            description: 'test',
          }),
        },
      }))
      // 10 buildings * 0.01 = 0.10, so multiplier should be 1 + 0.10 = 1.10
      expect(result.productionMultipliers['croissants']?.toNumber()).toBeCloseTo(1.10, 10)
    })

    it('applies global_production_bonus aura', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: { usine: makeBuilding('usine', 5) },
        allBuildingData: {
          usine: makeBuildingData('usine', {
            effectType: 'global_production_bonus',
            bonusPerBuilding: new Decimal(0.01),
            description: 'test',
          }),
        },
      }))
      // 5 * 0.01 = 0.05, so 1 + 0.05 = 1.05
      expect(result.globalProductionMultiplier.toNumber()).toBeCloseTo(1.05, 10)
    })

    it('applies sell_price_bonus aura to target product', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: { boutique: makeBuilding('boutique', 8) },
        allBuildingData: {
          boutique: makeBuildingData('boutique', {
            effectType: 'sell_price_bonus',
            bonusPerBuilding: new Decimal(0.05),
            targetProduct: 'croissants',
            description: 'test',
          }),
        },
      }))
      // 8 * 0.05 = 0.40, so 1 + 0.40 = 1.40
      expect(result.sellMultipliers['croissants']?.toNumber()).toBeCloseTo(1.40, 10)
    })

    it('applies global sell_price_bonus aura (no target)', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: { franchise: makeBuilding('franchise', 3) },
        allBuildingData: {
          franchise: makeBuildingData('franchise', {
            effectType: 'sell_price_bonus',
            bonusPerBuilding: new Decimal(0.01),
            description: 'test',
          }),
        },
      }))
      // 3 * 0.01 = 0.03, so 1 + 0.03 = 1.03
      expect(result.globalSellMultiplier.toNumber()).toBeCloseTo(1.03, 10)
    })

    it('applies crafting_speed_bonus aura to specific recipe', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: { petrin: makeBuilding('petrin', 10) },
        allBuildingData: {
          petrin: makeBuildingData('petrin', {
            effectType: 'crafting_speed_bonus',
            bonusPerBuilding: new Decimal(0.02),
            targetRecipe: 'petrissage_croissant',
            description: 'test',
          }),
        },
      }))
      // 10 * 0.02 = 0.20, so 1 + 0.20 = 1.20
      expect(result.craftingSpeedMultipliers['petrissage_croissant']?.toNumber()).toBeCloseTo(1.20, 10)
    })

    it('applies global crafting_speed_bonus aura', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: { four_ventile: makeBuilding('four_ventile', 5) },
        allBuildingData: {
          four_ventile: makeBuildingData('four_ventile', {
            effectType: 'crafting_speed_bonus',
            bonusPerBuilding: new Decimal(0.02),
            description: 'test',
          }),
        },
      }))
      // 5 * 0.02 = 0.10, so 1 + 0.10 = 1.10
      expect(result.craftingSpeedMultipliers['_global']?.toNumber()).toBeCloseTo(1.10, 10)
    })

    it('applies ingredient_generation_bonus aura to specific resource', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: { atelier: makeBuilding('atelier', 4) },
        allBuildingData: {
          atelier: makeBuildingData('atelier', {
            effectType: 'ingredient_generation_bonus',
            bonusPerBuilding: new Decimal(0.05),
            targetResource: 'chocolat_patissier',
            description: 'test',
          }),
        },
      }))
      // 4 * 0.05 = 0.20, so 1 + 0.20 = 1.20
      expect(result.ingredientMultipliers['chocolat_patissier']?.toNumber()).toBeCloseTo(1.20, 10)
    })

    it('applies global ingredient_generation_bonus aura', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: { labo: makeBuilding('labo', 6) },
        allBuildingData: {
          labo: makeBuildingData('labo', {
            effectType: 'ingredient_generation_bonus',
            bonusPerBuilding: new Decimal(0.02),
            description: 'test',
          }),
        },
      }))
      // 6 * 0.02 = 0.12, so 1 + 0.12 = 1.12
      expect(result.ingredientMultipliers['_global']?.toNumber()).toBeCloseTo(1.12, 10)
    })

    it('applies cross_product_bonus aura', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: { malaxeur: makeBuilding('malaxeur', 7) },
        allBuildingData: {
          malaxeur: makeBuildingData('malaxeur', {
            effectType: 'cross_product_bonus',
            bonusPerBuilding: new Decimal(0.02),
            crossProductTarget: 'croissants',
            description: 'test',
          }),
        },
      }))
      // 7 * 0.02 = 0.14, so 1 + 0.14 = 1.14
      expect(result.productionMultipliers['croissants']?.toNumber()).toBeCloseTo(1.14, 10)
    })

    it('applies all_speed_bonus aura to both crafting and production', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: { empire: makeBuilding('empire', 2) },
        allBuildingData: {
          empire: makeBuildingData('empire', {
            effectType: 'all_speed_bonus',
            bonusPerBuilding: new Decimal(0.005),
            description: 'test',
          }),
        },
      }))
      // 2 * 0.005 = 0.01
      expect(result.globalProductionMultiplier.toNumber()).toBeCloseTo(1.01, 10)
      expect(result.craftingSpeedMultipliers['_global']?.toNumber()).toBeCloseTo(1.01, 10)
    })

    it('skips buildings with count = 0', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: { fournil: makeBuilding('fournil', 0) },
        allBuildingData: {
          fournil: makeBuildingData('fournil', {
            effectType: 'production_bonus',
            bonusPerBuilding: new Decimal(0.01),
            targetProduct: 'croissants',
            description: 'test',
          }),
        },
      }))
      expect(result.productionMultipliers['croissants']).toBeUndefined()
    })

    it('stacks multiple auras from different buildings', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: {
          usine: makeBuilding('usine', 3),
          empire_choco: makeBuilding('empire_choco', 2),
        },
        allBuildingData: {
          usine: makeBuildingData('usine', {
            effectType: 'global_production_bonus',
            bonusPerBuilding: new Decimal(0.01),
            description: 'test',
          }),
          empire_choco: makeBuildingData('empire_choco', {
            effectType: 'global_production_bonus',
            bonusPerBuilding: new Decimal(0.005),
            description: 'test',
          }),
        },
      }))
      // 3*0.01 + 2*0.005 = 0.03 + 0.01 = 0.04, so 1 + 0.04 = 1.04
      expect(result.globalProductionMultiplier.toNumber()).toBeCloseTo(1.04, 10)
    })
  })

  describe('combo evaluation', () => {
    const testCombos: ComboBoulangerie[] = [
      {
        id: 'duo',
        name: 'Duo',
        description: 'test',
        requiredProducts: ['croissants', 'pains_au_chocolat'],
        bonusType: 'sell',
        bonusMultiplier: new Decimal(0.10),
      },
      {
        id: 'trio',
        name: 'Trio',
        description: 'test',
        requiredProducts: ['croissants', 'pains_au_chocolat', 'chocolatines'],
        bonusType: 'production',
        bonusMultiplier: new Decimal(0.20),
      },
    ]

    it('activates combo when all required products are active', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        activeProductIds: ['croissants', 'pains_au_chocolat'],
        comboDefinitions: testCombos,
      }))
      expect(result.activeCombos).toHaveLength(1)
      expect(result.activeCombos[0].id).toBe('duo')
      expect(result.globalSellMultiplier.toNumber()).toBeCloseTo(1.10, 10)
    })

    it('does not activate combo when missing a required product', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        activeProductIds: ['croissants'],
        comboDefinitions: testCombos,
      }))
      expect(result.activeCombos).toHaveLength(0)
      expect(result.globalSellMultiplier.eq(1)).toBe(true)
    })

    it('stacks multiple combos', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        activeProductIds: ['croissants', 'pains_au_chocolat', 'chocolatines'],
        comboDefinitions: testCombos,
      }))
      expect(result.activeCombos).toHaveLength(2)
      // sell: +10%, production: +20%
      expect(result.globalSellMultiplier.toNumber()).toBeCloseTo(1.10, 10)
      expect(result.globalProductionMultiplier.toNumber()).toBeCloseTo(1.20, 10)
    })

    it('handles global combo bonusType', () => {
      const globalCombo: ComboBoulangerie[] = [{
        id: 'global_test',
        name: 'Test',
        description: 'test',
        requiredProducts: ['croissants'],
        bonusType: 'global',
        bonusMultiplier: new Decimal(0.15),
      }]
      const result = calcSynergyBonuses(makeBaseInput({
        activeProductIds: ['croissants'],
        comboDefinitions: globalCombo,
      }))
      expect(result.globalProductionMultiplier.toNumber()).toBeCloseTo(1.15, 10)
      expect(result.globalSellMultiplier.toNumber()).toBeCloseTo(1.15, 10)
    })
  })

  describe('upgrade effects', () => {
    it('applies scaling upgrade (total_buildings)', () => {
      const upgrade: Upgrade = {
        id: upgradeId('industrialisation'),
        name: 'test',
        description: 'test',
        purchased: true,
        cost: new Decimal(0),
        costResource: PANTINS_COINS_ID,
        effect: {
          type: 'scaling',
          multiplier: new Decimal(1),
          scalingEffect: {
            source: 'total_buildings',
            bonusType: 'global_production',
            bonusPerUnit: new Decimal(0.005),
            scalingDivisor: 1,
          },
        },
        unlockCondition: { type: 'resource_threshold', threshold: new Decimal(0) },
        scope: 'global',
      }
      const result = calcSynergyBonuses(makeBaseInput({
        purchasedUpgrades: [upgrade],
        totalBuildingCount: 50,
      }))
      // 50 * 0.005 = 0.25, so 1 + 0.25 = 1.25
      expect(result.globalProductionMultiplier.toNumber()).toBeCloseTo(1.25, 10)
    })

    it('applies scaling upgrade (building_count) with sell bonus', () => {
      const upgrade: Upgrade = {
        id: upgradeId('franchise_scaling'),
        name: 'test',
        description: 'test',
        purchased: true,
        cost: new Decimal(0),
        costResource: PANTINS_COINS_ID,
        effect: {
          type: 'scaling',
          multiplier: new Decimal(1),
          scalingEffect: {
            source: 'building_count',
            sourceBuildingId: buildingId('boutique'),
            bonusType: 'sell',
            bonusPerUnit: new Decimal(0.02),
            scalingDivisor: 1,
          },
        },
        unlockCondition: { type: 'resource_threshold', threshold: new Decimal(0) },
        scope: 'global',
      }
      const result = calcSynergyBonuses(makeBaseInput({
        purchasedUpgrades: [upgrade],
        allBuildings: { boutique: makeBuilding('boutique', 15) },
      }))
      // 15 * 0.02 = 0.30, so 1 + 0.30 = 1.30
      expect(result.globalSellMultiplier.toNumber()).toBeCloseTo(1.30, 10)
    })

    it('applies cross_product_synergy upgrade', () => {
      const upgrade: Upgrade = {
        id: upgradeId('petit_dej'),
        name: 'test',
        description: 'test',
        purchased: true,
        cost: new Decimal(0),
        costResource: PANTINS_COINS_ID,
        effect: {
          type: 'cross_product_synergy',
          multiplier: new Decimal(1),
          crossProductEffect: {
            sourceProduct: 'croissants',
            sourceResource: 'croissants',
            targetProduct: 'pains_au_chocolat',
            bonusType: 'sell',
            bonusPerUnit: new Decimal(0.02),
            scalingDivisor: 100,
          },
        },
        unlockCondition: { type: 'resource_threshold', threshold: new Decimal(0) },
        scope: 'global',
      }
      const result = calcSynergyBonuses(makeBaseInput({
        purchasedUpgrades: [upgrade],
        resourceTotals: { croissants: new Decimal(550) },
      }))
      // floor(550 / 100) = 5, 5 * 0.02 = 0.10, so 1 + 0.10 = 1.10
      expect(result.sellMultipliers['pains_au_chocolat']?.toNumber()).toBeCloseTo(1.10, 10)
    })

    it('applies specialization upgrade with scaling bonus', () => {
      const upgrade: Upgrade = {
        id: upgradeId('beurre_spec'),
        name: 'test',
        description: 'test',
        purchased: true,
        cost: new Decimal(0),
        costResource: PANTINS_COINS_ID,
        effect: {
          type: 'specialization',
          multiplier: new Decimal(2),
          targetBuilding: buildingId('petrin'),
          scalingBonus: {
            bonusType: 'global',
            bonusPerUnit: new Decimal(0.005),
            scalingBuildingId: buildingId('petrin'),
            scalingDivisor: 50,
          },
        },
        unlockCondition: { type: 'resource_threshold', threshold: new Decimal(0) },
        scope: 'global',
      }
      const result = calcSynergyBonuses(makeBaseInput({
        purchasedUpgrades: [upgrade],
        allBuildings: { petrin: makeBuilding('petrin', 100) },
      }))
      // floor(100 / 50) = 2, 2 * 0.005 = 0.01, so global = 1 + 0.01 = 1.01
      expect(result.globalProductionMultiplier.toNumber()).toBeCloseTo(1.01, 10)
    })
  })

  describe('large values', () => {
    it('handles very large building counts', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: { usine: makeBuilding('usine', 10_000) },
        allBuildingData: {
          usine: makeBuildingData('usine', {
            effectType: 'global_production_bonus',
            bonusPerBuilding: new Decimal(0.01),
            description: 'test',
          }),
        },
      }))
      // 10000 * 0.01 = 100, so 1 + 100 = 101
      expect(result.globalProductionMultiplier.toNumber()).toBeCloseTo(101, 10)
    })

  })

  describe('edge cases', () => {
    it('handles zero resource totals in cross-product synergy', () => {
      const upgrade: Upgrade = {
        id: upgradeId('cross_zero'),
        name: 'test',
        description: 'test',
        purchased: true,
        cost: new Decimal(0),
        costResource: PANTINS_COINS_ID,
        effect: {
          type: 'cross_product_synergy',
          multiplier: new Decimal(1),
          crossProductEffect: {
            sourceProduct: 'croissants',
            sourceResource: 'croissants',
            targetProduct: 'pains_au_chocolat',
            bonusType: 'sell',
            bonusPerUnit: new Decimal(0.02),
            scalingDivisor: 100,
          },
        },
        unlockCondition: { type: 'resource_threshold', threshold: new Decimal(0) },
        scope: 'global',
      }
      const result = calcSynergyBonuses(makeBaseInput({
        purchasedUpgrades: [upgrade],
        resourceTotals: {},
      }))
      // 0 / 100 = 0, floor(0) = 0, bonus = 0 -> no change
      expect(result.sellMultipliers['pains_au_chocolat']).toBeUndefined()
    })

    it('handles building aura without matching building data', () => {
      // Building exists but no BuildingData — should not crash
      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: { unknown: makeBuilding('unknown', 5) },
        allBuildingData: {},
      }))
      expect(result.globalProductionMultiplier.eq(1)).toBe(true)
    })

    it('handles building data with aura but building not present', () => {
      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: {},
        allBuildingData: {
          fournil: makeBuildingData('fournil', {
            effectType: 'production_bonus',
            bonusPerBuilding: new Decimal(0.01),
            targetProduct: 'croissants',
            description: 'test',
          }),
        },
      }))
      expect(result.productionMultipliers['croissants']).toBeUndefined()
    })

    it('handles scaling divisor of 0 safely (divisor defaults to 1)', () => {
      const upgrade: Upgrade = {
        id: upgradeId('scaling_zero_div'),
        name: 'test',
        description: 'test',
        purchased: true,
        cost: new Decimal(0),
        costResource: PANTINS_COINS_ID,
        effect: {
          type: 'scaling',
          multiplier: new Decimal(1),
          scalingEffect: {
            source: 'total_buildings',
            bonusType: 'global_production',
            bonusPerUnit: new Decimal(0.005),
            // scalingDivisor not set, defaults to 1
          },
        },
        unlockCondition: { type: 'resource_threshold', threshold: new Decimal(0) },
        scope: 'global',
      }
      const result = calcSynergyBonuses(makeBaseInput({
        purchasedUpgrades: [upgrade],
        totalBuildingCount: 10,
      }))
      // 10/1 = 10, 10*0.005 = 0.05, 1+0.05=1.05
      expect(result.globalProductionMultiplier.toNumber()).toBeCloseTo(1.05, 10)
    })
  })

  describe('integration: auras + combos + upgrades together', () => {
    it('stacks all bonus sources correctly', () => {
      const combos: ComboBoulangerie[] = [{
        id: 'duo',
        name: 'Duo',
        description: 'test',
        requiredProducts: ['croissants', 'pains_au_chocolat'],
        bonusType: 'sell',
        bonusMultiplier: new Decimal(0.10),
      }]

      const upgrade: Upgrade = {
        id: upgradeId('scaling_test'),
        name: 'test',
        description: 'test',
        purchased: true,
        cost: new Decimal(0),
        costResource: PANTINS_COINS_ID,
        effect: {
          type: 'scaling',
          multiplier: new Decimal(1),
          scalingEffect: {
            source: 'total_buildings',
            bonusType: 'global_production',
            bonusPerUnit: new Decimal(0.01),
            scalingDivisor: 1,
          },
        },
        unlockCondition: { type: 'resource_threshold', threshold: new Decimal(0) },
        scope: 'global',
      }

      const result = calcSynergyBonuses(makeBaseInput({
        allBuildings: {
          usine: makeBuilding('usine', 3),
          boutique: makeBuilding('boutique', 5),
        },
        allBuildingData: {
          usine: makeBuildingData('usine', {
            effectType: 'global_production_bonus',
            bonusPerBuilding: new Decimal(0.01),
            description: 'test',
          }),
          boutique: makeBuildingData('boutique', {
            effectType: 'sell_price_bonus',
            bonusPerBuilding: new Decimal(0.05),
            targetProduct: 'croissants',
            description: 'test',
          }),
        },
        purchasedUpgrades: [upgrade],
        activeProductIds: ['croissants', 'pains_au_chocolat'],
        comboDefinitions: combos,
        totalBuildingCount: 8,
      }))

      // Global production:
      // - Aura: usine 3 * 0.01 = 0.03
      // - Upgrade scaling: 8 * 0.01 = 0.08
      // Total: 1 + 0.03 + 0.08 = 1.11
      expect(result.globalProductionMultiplier.toNumber()).toBeCloseTo(1.11, 10)

      // Sell: croissants: 1 + 5*0.05 = 1.25
      expect(result.sellMultipliers['croissants']?.toNumber()).toBeCloseTo(1.25, 10)

      // Global sell: 1 + 0.10 (combo) = 1.10
      expect(result.globalSellMultiplier.toNumber()).toBeCloseTo(1.10, 10)

      // Active combos
      expect(result.activeCombos).toHaveLength(1)
    })
  })
})
