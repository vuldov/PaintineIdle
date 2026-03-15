import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import type { Building, GameState, ResourceId, Upgrade, UpgradeId } from '@/types'
import {
  calcCost,
  calcBulkCost,
  calcCostReduction,
  calcBuildingRates,
  calcEtoilesGagnees,
  calcBonusPrestige,
  calcProduction,
  calcClampedDelta,
} from './productionMechanics'

// ─── Helpers ──────────────────────────────────────────────────────────

function makeBuilding(overrides: Partial<Building> = {}): Building {
  return {
    id: 'fournil',
    count: 0,
    baseCost: new Decimal(15),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(0.4),
    producedResource: 'croissants',
    unlocked: true,
    ...overrides,
  }
}

function makeUpgrade(overrides: Partial<Upgrade> = {}): Upgrade {
  return {
    id: 'test_upgrade',
    name: 'Test',
    description: 'Test upgrade',
    purchased: false,
    cost: new Decimal(100),
    costResource: 'pantins_coins',
    effect: {
      type: 'global_multiplier',
      multiplier: new Decimal(2),
    },
    unlockCondition: {
      type: 'resource_threshold',
      resourceId: 'pantins_coins',
      threshold: new Decimal(50),
    },
    ...overrides,
  }
}

function emptyResources(): Record<ResourceId, { amount: Decimal }> {
  return {
    croissants: { amount: new Decimal(0) },
    beurre: { amount: new Decimal(100) },
    farine: { amount: new Decimal(100) },
    pate: { amount: new Decimal(100) },
    pantins_coins: { amount: new Decimal(0) },
    reputation: { amount: new Decimal(0) },
    etoiles: { amount: new Decimal(0) },
  }
}

function makeMinimalGameState(overrides: Partial<GameState> = {}): GameState {
  const defaultResources: Record<ResourceId, { id: ResourceId; amount: Decimal; perSecond: Decimal; totalEarned: Decimal; unlocked: boolean }> = {
    croissants: { id: 'croissants', amount: new Decimal(0), perSecond: new Decimal(0), totalEarned: new Decimal(0), unlocked: true },
    beurre: { id: 'beurre', amount: new Decimal(100), perSecond: new Decimal(0), totalEarned: new Decimal(0), unlocked: true },
    farine: { id: 'farine', amount: new Decimal(100), perSecond: new Decimal(0), totalEarned: new Decimal(0), unlocked: true },
    pate: { id: 'pate', amount: new Decimal(100), perSecond: new Decimal(0), totalEarned: new Decimal(0), unlocked: true },
    pantins_coins: { id: 'pantins_coins', amount: new Decimal(0), perSecond: new Decimal(0), totalEarned: new Decimal(0), unlocked: true },
    reputation: { id: 'reputation', amount: new Decimal(0), perSecond: new Decimal(0), totalEarned: new Decimal(0), unlocked: false },
    etoiles: { id: 'etoiles', amount: new Decimal(0), perSecond: new Decimal(0), totalEarned: new Decimal(0), unlocked: false },
  }

  const defaultBuildings: Record<string, Building> = {
    fournil: makeBuilding({ id: 'fournil', count: 0 }),
    petrin: makeBuilding({ id: 'petrin', count: 0, baseCost: new Decimal(30), baseProduction: new Decimal(0.5), producedResource: 'pate' }),
    four_pro: makeBuilding({ id: 'four_pro', count: 0, baseCost: new Decimal(200), baseProduction: new Decimal(2), producedResource: 'croissants' }),
    boutique: makeBuilding({ id: 'boutique', count: 0, baseCost: new Decimal(500), baseProduction: new Decimal(1), producedResource: 'pantins_coins' }),
    laboratoire: makeBuilding({ id: 'laboratoire', count: 0, baseCost: new Decimal(1500), baseProduction: new Decimal(2), producedResource: 'beurre' }),
    usine: makeBuilding({ id: 'usine', count: 0, baseCost: new Decimal(10000), baseProduction: new Decimal(5), producedResource: 'croissants' }),
    franchise: makeBuilding({ id: 'franchise', count: 0, baseCost: new Decimal(50000), baseProduction: new Decimal(10), producedResource: 'pantins_coins' }),
    empire: makeBuilding({ id: 'empire', count: 0, baseCost: new Decimal(500000), baseProduction: new Decimal(50), producedResource: 'croissants' }),
  }

  return {
    resources: defaultResources,
    buildings: defaultBuildings as GameState['buildings'],
    upgrades: {} as Record<UpgradeId, Upgrade>,
    prestige: {
      etoiles: new Decimal(0),
      etoilesCettePartie: new Decimal(0),
      totalPrestiges: 0,
      bonusMultiplier: new Decimal(1),
    },
    stats: {
      totalCroissantsProduits: new Decimal(0),
      tempsDeJeu: 0,
      totalClics: 0,
      meilleurCroissantsParSeconde: new Decimal(0),
      dateDebut: Date.now(),
    },
    version: 2,
    lastSave: Date.now(),
    ...overrides,
  }
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
    // 15 * 1.15^1 = 17.25
    expect(cost1.toFixed(2)).toBe('17.25')

    const cost5 = calcCost(building, 5)
    // 15 * 1.15^5
    const expected = new Decimal(15).mul(Decimal.pow(1.15, 5))
    expect(cost5.toFixed(4)).toBe(expected.toFixed(4))
  })

  it('applies cost reduction when provided', () => {
    const building = makeBuilding()
    const reduction = new Decimal(0.5)
    const cost = calcCost(building, 0, reduction)
    // 15 * 0.5 = 7.5
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
    // They should be very close (floating point tolerance)
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
    // Should match within floating point tolerance
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
    const upgrades: Record<UpgradeId, Upgrade> = {
      u1: makeUpgrade({ id: 'u1', purchased: false, effect: { type: 'cost_reduction', multiplier: new Decimal(0.9) } }),
    }
    expect(calcCostReduction(upgrades).eq(1)).toBe(true)
  })

  it('applies a single cost reduction', () => {
    const upgrades: Record<UpgradeId, Upgrade> = {
      u1: makeUpgrade({ id: 'u1', purchased: true, effect: { type: 'cost_reduction', multiplier: new Decimal(0.9) } }),
    }
    expect(calcCostReduction(upgrades).eq(0.9)).toBe(true)
  })

  it('stacks multiple cost reductions multiplicatively', () => {
    const upgrades: Record<UpgradeId, Upgrade> = {
      u1: makeUpgrade({ id: 'u1', purchased: true, effect: { type: 'cost_reduction', multiplier: new Decimal(0.9) } }),
      u2: makeUpgrade({ id: 'u2', purchased: true, effect: { type: 'cost_reduction', multiplier: new Decimal(0.8) } }),
    }
    // 0.9 * 0.8 = 0.72
    expect(calcCostReduction(upgrades).toFixed(2)).toBe('0.72')
  })

  it('ignores non-cost_reduction upgrades', () => {
    const upgrades: Record<UpgradeId, Upgrade> = {
      u1: makeUpgrade({ id: 'u1', purchased: true, effect: { type: 'global_multiplier', multiplier: new Decimal(2) } }),
      u2: makeUpgrade({ id: 'u2', purchased: true, effect: { type: 'cost_reduction', multiplier: new Decimal(0.5) } }),
    }
    expect(calcCostReduction(upgrades).eq(0.5)).toBe(true)
  })
})

// ─── calcBuildingRates ────────────────────────────────────────────────

describe('calcBuildingRates', () => {
  it('calculates cuisson rates for fournil', () => {
    const rates = calcBuildingRates('fournil', new Decimal(0.4), {})
    expect(rates.produces).toHaveLength(1)
    expect(rates.produces[0].resource).toBe('croissants')
    expect(rates.produces[0].amount.eq(0.4)).toBe(true)

    expect(rates.consumes).toHaveLength(1)
    expect(rates.consumes[0].resource).toBe('pate')
  })

  it('calculates petrissage rates for petrin', () => {
    const rates = calcBuildingRates('petrin', new Decimal(0.5), {})
    expect(rates.produces).toHaveLength(1)
    expect(rates.produces[0].resource).toBe('pate')

    expect(rates.consumes).toHaveLength(2)
    const consumedResources = rates.consumes.map(c => c.resource)
    expect(consumedResources).toContain('beurre')
    expect(consumedResources).toContain('farine')
  })

  it('applies building_multiplier upgrade', () => {
    const upgrades: Record<UpgradeId, Upgrade> = {
      u1: makeUpgrade({
        id: 'u1',
        purchased: true,
        effect: { type: 'building_multiplier', targetBuilding: 'fournil', multiplier: new Decimal(2) },
      }),
    }
    const rates = calcBuildingRates('fournil', new Decimal(0.4), upgrades)
    // 0.4 * 2 = 0.8
    expect(rates.produces[0].amount.eq(0.8)).toBe(true)
  })

  it('applies global_multiplier upgrade', () => {
    const upgrades: Record<UpgradeId, Upgrade> = {
      u1: makeUpgrade({
        id: 'u1',
        purchased: true,
        effect: { type: 'global_multiplier', multiplier: new Decimal(3) },
      }),
    }
    const rates = calcBuildingRates('fournil', new Decimal(0.4), upgrades)
    // 0.4 * 3 = 1.2
    expect(rates.produces[0].amount.eq(1.2)).toBe(true)
  })

  it('does not apply building_multiplier from another building', () => {
    const upgrades: Record<UpgradeId, Upgrade> = {
      u1: makeUpgrade({
        id: 'u1',
        purchased: true,
        effect: { type: 'building_multiplier', targetBuilding: 'petrin', multiplier: new Decimal(5) },
      }),
    }
    const rates = calcBuildingRates('fournil', new Decimal(0.4), upgrades)
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
    // sqrt(10M / 1M) = sqrt(10) = 3.16... → floor = 3
    expect(calcEtoilesGagnees(new Decimal(10_000_000)).eq(3)).toBe(true)
  })

  it('returns 10 for 100M croissants', () => {
    // sqrt(100M / 1M) = sqrt(100) = 10
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

// ─── calcProduction ───────────────────────────────────────────────────

describe('calcProduction', () => {
  it('returns zero production with no buildings', () => {
    const state = makeMinimalGameState()
    const result = calcProduction(state)
    // Free production includes passive regen (beurre 0.2, farine 0.3)
    expect(result.freeProduction.beurre.eq(0.2)).toBe(true)
    expect(result.freeProduction.farine.eq(0.3)).toBe(true)
    expect(result.freeProduction.croissants.eq(0)).toBe(true)
  })

  it('produces croissants from fournil (cuisson pipeline)', () => {
    const state = makeMinimalGameState()
    state.buildings.fournil.count = 1
    const result = calcProduction(state)
    // Fournil: baseProduction 0.4, pipelineRole cuisson
    // cuisson stage should produce croissants and consume pate
    expect(result.stages.length).toBe(3) // petrissage, cuisson, vente
  })

  it('applies prestige multiplier to production', () => {
    const stateNoPres = makeMinimalGameState()
    stateNoPres.buildings.fournil.count = 1
    const resultNoPres = calcProduction(stateNoPres)

    const statePres = makeMinimalGameState()
    statePres.buildings.fournil.count = 1
    statePres.prestige.bonusMultiplier = new Decimal(2)
    const resultPres = calcProduction(statePres)

    // With 2x prestige, net croissants should be doubled
    expect(resultPres.net.croissants.div(resultNoPres.net.croissants).toFixed(1)).toBe('2.0')
  })
})

// ─── calcClampedDelta ─────────────────────────────────────────────────

describe('calcClampedDelta', () => {
  it('applies free production even with empty resources', () => {
    const state = makeMinimalGameState()
    const result = calcProduction(state)
    const resources = emptyResources()
    // Set beurre and farine to 0 to test free regen still works
    resources.beurre.amount = new Decimal(0)
    resources.farine.amount = new Decimal(0)

    const deltas = calcClampedDelta(result, resources, 1)
    // Passive regen: beurre +0.2/s, farine +0.3/s
    expect(deltas.beurre.toFixed(1)).toBe('0.2')
    expect(deltas.farine.toFixed(1)).toBe('0.3')
  })

  it('throttles pipeline when resources are insufficient', () => {
    const state = makeMinimalGameState()
    state.buildings.fournil.count = 10 // Wants a lot of pate
    const result = calcProduction(state)

    // Set pate to 0 so cuisson pipeline gets fully throttled
    const resources = emptyResources()
    resources.pate.amount = new Decimal(0)

    const deltas = calcClampedDelta(result, resources, 1)
    // With no pate available, cuisson pipeline should be throttled to 0
    // So croissants delta should be 0 (no free croissant production, throttled pipeline)
    expect(deltas.croissants.eq(0)).toBe(true)
  })

  it('scales linearly with delta', () => {
    const state = makeMinimalGameState()
    const result = calcProduction(state)
    const resources = emptyResources()

    const deltas1 = calcClampedDelta(result, resources, 1)
    const deltas2 = calcClampedDelta(result, resources, 0.5)

    // Free production should scale linearly with delta
    expect(deltas1.beurre.div(deltas2.beurre).toFixed(1)).toBe('2.0')
  })
})
