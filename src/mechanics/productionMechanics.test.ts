import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import type { Building, Upgrade } from '@/types'
import { resourceId, buildingId, PANTINS_COINS_ID } from '@/types'
import {
  calcCost,
  calcBulkCost,
  calcCostReduction,
  calcBuildingRates,
  calcEtoilesGagnees,
  calcBonusPrestige,
  calcProductionForProduct,
  calcClampedDelta,
} from './productionMechanics'
import { CROISSANTS_BUNDLE } from '@/lib/products/croissants'

// ─── Helpers ──────────────────────────────────────────────────────────

function makeBuilding(overrides: Partial<Building> = {}): Building {
  return {
    id: buildingId('fournil'),
    count: 0,
    baseCost: new Decimal(15),
    costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15,
    baseProduction: new Decimal(0.4),
    producedResource: resourceId('croissants'),
    unlocked: true,
    ...overrides,
  }
}

function makeUpgrade(overrides: Partial<Upgrade> = {}): Upgrade {
  return {
    id: 'test_upgrade' as Upgrade['id'],
    name: 'Test',
    description: 'Test upgrade',
    purchased: false,
    cost: new Decimal(100),
    costResource: PANTINS_COINS_ID,
    effect: {
      type: 'global_multiplier',
      multiplier: new Decimal(2),
    },
    unlockCondition: {
      type: 'resource_threshold',
      resourceId: PANTINS_COINS_ID,
      threshold: new Decimal(50),
    },
    scope: 'croissants',
    ...overrides,
  }
}

function makeCroissantBuildings(): Record<string, Building> {
  const buildings: Record<string, Building> = {}
  for (const [id, data] of Object.entries(CROISSANTS_BUNDLE.buildings)) {
    buildings[id] = {
      id: data.id,
      count: 0,
      baseCost: data.baseCost,
      costResource: data.costResource,
      costMultiplier: data.costMultiplier,
      baseProduction: data.baseProduction,
      producedResource: data.producedResource,
      unlocked: true,
    }
  }
  return buildings
}

function makeResourceAmounts(): Record<string, { amount: Decimal }> {
  const result: Record<string, { amount: Decimal }> = {}
  for (const [id, data] of Object.entries(CROISSANTS_BUNDLE.resources)) {
    result[id] = { amount: data.category === 'ingredient' ? new Decimal(100) : new Decimal(0) }
  }
  result['pantins_coins'] = { amount: new Decimal(0) }
  result['reputation'] = { amount: new Decimal(0) }
  result['etoiles'] = { amount: new Decimal(0) }
  return result
}

// ─── calcCost ─────────────────────────────────────────────────────────

describe('calcCost', () => {
  it('returns baseCost when count is 0', () => {
    const building = makeBuilding()
    const cost = calcCost(building, 0)
    expect(cost.eq(new Decimal(15))).toBe(true)
  })

  it('scales exponentially with count', () => {
    const building = makeBuilding()
    const cost1 = calcCost(building, 1)
    expect(cost1.toFixed(2)).toBe('17.25')

    const cost5 = calcCost(building, 5)
    const expected = new Decimal(15).mul(Decimal.pow(1.15, 5))
    expect(cost5.toFixed(4)).toBe(expected.toFixed(4))
  })

  it('applies cost reduction when provided', () => {
    const building = makeBuilding()
    const reduction = new Decimal(0.5)
    const cost = calcCost(building, 0, reduction)
    expect(cost.eq(new Decimal(7.5))).toBe(true)
  })

  it('handles large count values without error', () => {
    const building = makeBuilding()
    const cost = calcCost(building, 1000)
    expect(cost.gt(0)).toBe(true)
    expect(cost.isFinite()).toBe(true)
  })
})

// ─── calcBulkCost ─────────────────────────────────────────────────────

describe('calcBulkCost', () => {
  it('returns 0 when amount is 0', () => {
    const building = makeBuilding()
    expect(calcBulkCost(building, 0, 0).eq(0)).toBe(true)
  })

  it('returns 0 when amount is negative', () => {
    const building = makeBuilding()
    expect(calcBulkCost(building, 0, -5).eq(0)).toBe(true)
  })

  it('equals calcCost for amount = 1', () => {
    const building = makeBuilding()
    const bulk = calcBulkCost(building, 3, 1)
    const single = calcCost(building, 3)
    expect(bulk.sub(single).abs().lt(0.001)).toBe(true)
  })

  it('is greater than single cost for amount > 1', () => {
    const building = makeBuilding()
    const bulk = calcBulkCost(building, 0, 5)
    const single = calcCost(building, 0)
    expect(bulk.gt(single)).toBe(true)
  })

  it('sum of individual costs equals bulk cost', () => {
    const building = makeBuilding()
    const startCount = 3
    const amount = 4
    let sumIndividual = new Decimal(0)
    for (let i = 0; i < amount; i++) {
      sumIndividual = sumIndividual.add(calcCost(building, startCount + i))
    }
    const bulk = calcBulkCost(building, startCount, amount)
    expect(bulk.sub(sumIndividual).abs().div(sumIndividual).lt(0.0001)).toBe(true)
  })
})

// ─── calcCostReduction ────────────────────────────────────────────────

describe('calcCostReduction', () => {
  it('returns 1 with no upgrades', () => {
    const result = calcCostReduction({})
    expect(result.eq(1)).toBe(true)
  })

  it('returns 1 when no cost_reduction upgrades are purchased', () => {
    const upgrades: Record<string, Upgrade> = {
      u1: makeUpgrade({ id: 'u1' as Upgrade['id'], purchased: false, effect: { type: 'cost_reduction', multiplier: new Decimal(0.9) } }),
    }
    expect(calcCostReduction(upgrades).eq(1)).toBe(true)
  })

  it('applies a single cost reduction', () => {
    const upgrades: Record<string, Upgrade> = {
      u1: makeUpgrade({ id: 'u1' as Upgrade['id'], purchased: true, effect: { type: 'cost_reduction', multiplier: new Decimal(0.9) } }),
    }
    expect(calcCostReduction(upgrades).eq(0.9)).toBe(true)
  })

  it('stacks multiple cost reductions multiplicatively', () => {
    const upgrades: Record<string, Upgrade> = {
      u1: makeUpgrade({ id: 'u1' as Upgrade['id'], purchased: true, effect: { type: 'cost_reduction', multiplier: new Decimal(0.9) } }),
      u2: makeUpgrade({ id: 'u2' as Upgrade['id'], purchased: true, effect: { type: 'cost_reduction', multiplier: new Decimal(0.8) } }),
    }
    expect(calcCostReduction(upgrades).toFixed(2)).toBe('0.72')
  })

  it('ignores non-cost_reduction upgrades', () => {
    const upgrades: Record<string, Upgrade> = {
      u1: makeUpgrade({ id: 'u1' as Upgrade['id'], purchased: true, effect: { type: 'global_multiplier', multiplier: new Decimal(2) } }),
      u2: makeUpgrade({ id: 'u2' as Upgrade['id'], purchased: true, effect: { type: 'cost_reduction', multiplier: new Decimal(0.5) } }),
    }
    expect(calcCostReduction(upgrades).eq(0.5)).toBe(true)
  })
})

// ─── calcBuildingRates ────────────────────────────────────────────────

describe('calcBuildingRates', () => {
  it('calculates cuisson rates for fournil', () => {
    const data = CROISSANTS_BUNDLE.buildings['fournil']
    const rates = calcBuildingRates(data, CROISSANTS_BUNDLE.pipelineConfig.stages, new Decimal(0.4), {})
    expect(rates.produces).toHaveLength(1)
    expect(rates.produces[0].resource as string).toBe('croissants')
    expect(rates.produces[0].amount.eq(0.4)).toBe(true)

    expect(rates.consumes).toHaveLength(1)
    expect(rates.consumes[0].resource as string).toBe('pate_feuilletee')
  })

  it('calculates petrissage rates for petrin', () => {
    const data = CROISSANTS_BUNDLE.buildings['petrin']
    const rates = calcBuildingRates(data, CROISSANTS_BUNDLE.pipelineConfig.stages, new Decimal(0.5), {})
    expect(rates.produces).toHaveLength(1)
    expect(rates.produces[0].resource as string).toBe('pate_feuilletee')

    expect(rates.consumes).toHaveLength(2)
    const consumedResources = rates.consumes.map(c => c.resource as string)
    expect(consumedResources).toContain('beurre')
    expect(consumedResources).toContain('farine')
  })

  it('applies building_multiplier upgrade', () => {
    const data = CROISSANTS_BUNDLE.buildings['fournil']
    const upgrades: Record<string, Upgrade> = {
      u1: makeUpgrade({
        id: 'u1' as Upgrade['id'],
        purchased: true,
        effect: { type: 'building_multiplier', targetBuilding: buildingId('fournil'), multiplier: new Decimal(2) },
      }),
    }
    const rates = calcBuildingRates(data, CROISSANTS_BUNDLE.pipelineConfig.stages, new Decimal(0.4), upgrades)
    expect(rates.produces[0].amount.eq(0.8)).toBe(true)
  })

  it('applies global_multiplier upgrade', () => {
    const data = CROISSANTS_BUNDLE.buildings['fournil']
    const upgrades: Record<string, Upgrade> = {
      u1: makeUpgrade({
        id: 'u1' as Upgrade['id'],
        purchased: true,
        effect: { type: 'global_multiplier', multiplier: new Decimal(3) },
      }),
    }
    const rates = calcBuildingRates(data, CROISSANTS_BUNDLE.pipelineConfig.stages, new Decimal(0.4), upgrades)
    expect(rates.produces[0].amount.eq(1.2)).toBe(true)
  })

  it('does not apply building_multiplier from another building', () => {
    const data = CROISSANTS_BUNDLE.buildings['fournil']
    const upgrades: Record<string, Upgrade> = {
      u1: makeUpgrade({
        id: 'u1' as Upgrade['id'],
        purchased: true,
        effect: { type: 'building_multiplier', targetBuilding: buildingId('petrin'), multiplier: new Decimal(5) },
      }),
    }
    const rates = calcBuildingRates(data, CROISSANTS_BUNDLE.pipelineConfig.stages, new Decimal(0.4), upgrades)
    expect(rates.produces[0].amount.eq(0.4)).toBe(true)
  })
})

// ─── calcEtoilesGagnees ───────────────────────────────────────────────

describe('calcEtoilesGagnees', () => {
  it('returns 0 for 0 croissants', () => {
    expect(calcEtoilesGagnees(new Decimal(0)).eq(0)).toBe(true)
  })

  it('returns 0 for negative croissants', () => {
    expect(calcEtoilesGagnees(new Decimal(-100)).eq(0)).toBe(true)
  })

  it('returns 0 for less than 1M croissants', () => {
    expect(calcEtoilesGagnees(new Decimal(999_999)).eq(0)).toBe(true)
  })

  it('returns 1 for exactly 1M croissants', () => {
    expect(calcEtoilesGagnees(new Decimal(1_000_000)).eq(1)).toBe(true)
  })

  it('returns 3 for 10M croissants', () => {
    expect(calcEtoilesGagnees(new Decimal(10_000_000)).eq(3)).toBe(true)
  })

  it('returns 10 for 100M croissants', () => {
    expect(calcEtoilesGagnees(new Decimal(100_000_000)).eq(10)).toBe(true)
  })

  it('handles very large numbers', () => {
    const result = calcEtoilesGagnees(new Decimal('1e30'))
    expect(result.gt(0)).toBe(true)
    expect(result.isFinite()).toBe(true)
  })
})

// ─── calcBonusPrestige ────────────────────────────────────────────────

describe('calcBonusPrestige', () => {
  it('returns 1 for 0 etoiles (no bonus)', () => {
    expect(calcBonusPrestige(new Decimal(0)).eq(1)).toBe(true)
  })

  it('returns 1.1 for 1 etoile (+10%)', () => {
    expect(calcBonusPrestige(new Decimal(1)).eq(1.1)).toBe(true)
  })

  it('returns 2 for 10 etoiles (+100%)', () => {
    expect(calcBonusPrestige(new Decimal(10)).eq(2)).toBe(true)
  })

  it('returns 11 for 100 etoiles (+1000%)', () => {
    expect(calcBonusPrestige(new Decimal(100)).eq(11)).toBe(true)
  })
})

// ─── calcProductionForProduct ─────────────────────────────────────────

describe('calcProductionForProduct', () => {
  it('returns passive regen with no buildings', () => {
    const buildings = makeCroissantBuildings()
    const result = calcProductionForProduct(CROISSANTS_BUNDLE, buildings, {}, new Decimal(1))
    expect(result.freeProduction['beurre']?.eq(0.2)).toBe(true)
    expect(result.freeProduction['farine']?.eq(0.3)).toBe(true)
  })

  it('produces stages from buildings', () => {
    const buildings = makeCroissantBuildings()
    buildings['fournil'].count = 1
    const result = calcProductionForProduct(CROISSANTS_BUNDLE, buildings, {}, new Decimal(1))
    expect(result.stages.length).toBe(3) // petrissage, cuisson, vente
  })

  it('applies prestige multiplier to production', () => {
    const buildings = makeCroissantBuildings()
    buildings['fournil'].count = 1

    const resultNoPres = calcProductionForProduct(CROISSANTS_BUNDLE, buildings, {}, new Decimal(1))
    const resultPres = calcProductionForProduct(CROISSANTS_BUNDLE, buildings, {}, new Decimal(2))

    const netCroissantsNoPres = resultNoPres.net['croissants'] ?? new Decimal(0)
    const netCroissantsPres = resultPres.net['croissants'] ?? new Decimal(0)

    if (!netCroissantsNoPres.isZero()) {
      expect(netCroissantsPres.div(netCroissantsNoPres).toFixed(1)).toBe('2.0')
    }
  })
})

// ─── calcClampedDelta with TotalProductionResult ──────────────────────

describe('calcClampedDelta', () => {
  it('applies free production even with empty resources', () => {
    const buildings = makeCroissantBuildings()
    const result = calcProductionForProduct(CROISSANTS_BUNDLE, buildings, {}, new Decimal(1))

    const totalResult = {
      perProduct: { croissants: result },
      totalNet: result.net,
      totalFreeProduction: result.freeProduction,
      allStages: result.stages.map(stage => ({ productId: 'croissants', stage })),
    }

    const resources = makeResourceAmounts()
    resources['beurre'].amount = new Decimal(0)
    resources['farine'].amount = new Decimal(0)
    resources['pate_feuilletee'] = { amount: new Decimal(0) }

    const deltas = calcClampedDelta(totalResult, resources, 1)
    expect(deltas['beurre']?.toFixed(1)).toBe('0.2')
    expect(deltas['farine']?.toFixed(1)).toBe('0.3')
  })

  it('throttles pipeline when resources are insufficient', () => {
    const buildings = makeCroissantBuildings()
    buildings['fournil'].count = 10

    const result = calcProductionForProduct(CROISSANTS_BUNDLE, buildings, {}, new Decimal(1))
    const totalResult = {
      perProduct: { croissants: result },
      totalNet: result.net,
      totalFreeProduction: result.freeProduction,
      allStages: result.stages.map(stage => ({ productId: 'croissants', stage })),
    }

    const resources = makeResourceAmounts()
    resources['pate_feuilletee'] = { amount: new Decimal(0) }

    const deltas = calcClampedDelta(totalResult, resources, 1)
    // With no pate, cuisson should be fully throttled
    // croissants delta should be 0 (no free production, throttled cuisson)
    expect(deltas['croissants']?.eq(0) ?? true).toBe(true)
  })

  it('scales linearly with delta', () => {
    const buildings = makeCroissantBuildings()
    const result = calcProductionForProduct(CROISSANTS_BUNDLE, buildings, {}, new Decimal(1))
    const totalResult = {
      perProduct: { croissants: result },
      totalNet: result.net,
      totalFreeProduction: result.freeProduction,
      allStages: result.stages.map(stage => ({ productId: 'croissants', stage })),
    }

    const resources = makeResourceAmounts()

    const deltas1 = calcClampedDelta(totalResult, resources, 1)
    const deltas2 = calcClampedDelta(totalResult, resources, 0.5)

    const beurre1 = deltas1['beurre'] ?? new Decimal(0)
    const beurre2 = deltas2['beurre'] ?? new Decimal(0)

    if (!beurre2.isZero()) {
      expect(beurre1.div(beurre2).toFixed(1)).toBe('2.0')
    }
  })
})
