import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import type { SupplierData, SupplierState, SupplierUpgradeData, SupplierUpgradeState } from '@/types'
import { supplierId, resourceId, supplierUpgradeId } from '@/types'
import {
  calcEffectiveMaxRate,
  calcEffectiveCostPerSecond,
  calcSupplierProduction,
  calcSupplierCostPerSecond,
  calcSupplierTick,
} from './supplierMechanics'

// ─── Fixtures ──────────────────────────────────────────────────

const BEURRE = resourceId('beurre')
const FARINE = resourceId('farine')
const PATE = resourceId('pate_feuilletee')

function makeData(overrides: Partial<SupplierData> = {}): SupplierData {
  return {
    id: supplierId('test_supplier'),
    name: 'Test Supplier',
    emoji: '🧈',
    description: 'A test supplier',
    producedResource: BEURRE,
    baseMaxRate: new Decimal(10),
    baseCostPerSecond: new Decimal(5),
    contractCost: new Decimal(100),
    scope: 'croissants',
    ...overrides,
  }
}

function makeState(overrides: Partial<SupplierState> = {}): SupplierState {
  return {
    id: supplierId('test_supplier'),
    unlocked: true,
    active: true,
    ratePercent: 100,
    ...overrides,
  }
}

const NO_UPGRADES: Record<string, SupplierUpgradeData> = {}
const NO_UPGRADE_STATES: Record<string, SupplierUpgradeState> = {}

// ─── calcEffectiveMaxRate ───────────────────────────────────────

describe('calcEffectiveMaxRate', () => {
  it('returns baseMaxRate with no upgrades', () => {
    const data = makeData()
    const result = calcEffectiveMaxRate(data, NO_UPGRADES, NO_UPGRADE_STATES)
    expect(result.eq(new Decimal(10))).toBe(true)
  })

  it('applies max_rate_bonus multiplier from purchased upgrade', () => {
    const data = makeData()
    const upgrades: Record<string, SupplierUpgradeData> = {
      up1: {
        id: supplierUpgradeId('up1'), name: 'Boost', emoji: '⬆️',
        description: 'test', targetSupplier: supplierId('test_supplier'),
        cost: new Decimal(10), costResource: PATE,
        effectType: 'max_rate_bonus', effectValue: new Decimal(1.5),
        scope: 'croissants',
      },
    }
    const states: Record<string, SupplierUpgradeState> = {
      up1: { id: supplierUpgradeId('up1'), purchased: true },
    }
    const result = calcEffectiveMaxRate(data, upgrades, states)
    expect(result.eq(new Decimal(15))).toBe(true)
  })

  it('ignores unpurchased upgrades', () => {
    const data = makeData()
    const upgrades: Record<string, SupplierUpgradeData> = {
      up1: {
        id: supplierUpgradeId('up1'), name: 'Boost', emoji: '⬆️',
        description: 'test', targetSupplier: supplierId('test_supplier'),
        cost: new Decimal(10), costResource: PATE,
        effectType: 'max_rate_bonus', effectValue: new Decimal(2),
        scope: 'croissants',
      },
    }
    const states: Record<string, SupplierUpgradeState> = {
      up1: { id: supplierUpgradeId('up1'), purchased: false },
    }
    const result = calcEffectiveMaxRate(data, upgrades, states)
    expect(result.eq(new Decimal(10))).toBe(true)
  })
})

// ─── calcEffectiveCostPerSecond ─────────────────────────────────

describe('calcEffectiveCostPerSecond', () => {
  it('returns baseCostPerSecond with no upgrades', () => {
    const data = makeData()
    const result = calcEffectiveCostPerSecond(data, NO_UPGRADES, NO_UPGRADE_STATES)
    expect(result.eq(new Decimal(5))).toBe(true)
  })

  it('applies cost_reduction multiplier from purchased upgrade', () => {
    const data = makeData()
    const upgrades: Record<string, SupplierUpgradeData> = {
      up1: {
        id: supplierUpgradeId('up1'), name: 'Discount', emoji: '⬇️',
        description: 'test', targetSupplier: supplierId('test_supplier'),
        cost: new Decimal(10), costResource: PATE,
        effectType: 'cost_reduction', effectValue: new Decimal(0.8),
        scope: 'croissants',
      },
    }
    const states: Record<string, SupplierUpgradeState> = {
      up1: { id: supplierUpgradeId('up1'), purchased: true },
    }
    const result = calcEffectiveCostPerSecond(data, upgrades, states)
    expect(result.eq(new Decimal(4))).toBe(true)
  })
})

// ─── calcSupplierProduction ─────────────────────────────────────

describe('calcSupplierProduction', () => {
  it('returns effectiveMaxRate at 100%', () => {
    const result = calcSupplierProduction(new Decimal(10), makeState())
    expect(result.eq(new Decimal(10))).toBe(true)
  })

  it('scales linearly with ratePercent', () => {
    const result = calcSupplierProduction(new Decimal(10), makeState({ ratePercent: 50 }))
    expect(result.eq(new Decimal(5))).toBe(true)
  })

  it('returns 0 at ratePercent 0', () => {
    const result = calcSupplierProduction(new Decimal(10), makeState({ ratePercent: 0 }))
    expect(result.isZero()).toBe(true)
  })

  it('returns 0 if not unlocked', () => {
    const result = calcSupplierProduction(new Decimal(10), makeState({ unlocked: false }))
    expect(result.isZero()).toBe(true)
  })

  it('returns 0 if not active', () => {
    const result = calcSupplierProduction(new Decimal(10), makeState({ active: false }))
    expect(result.isZero()).toBe(true)
  })
})

// ─── calcSupplierCostPerSecond ───────────────────────────────────

describe('calcSupplierCostPerSecond', () => {
  it('returns effectiveCost at 100% when no rate upgrades', () => {
    // baseMaxRate=10, effectiveMax=10 (no upgrades), so costPerUnit=5/10=0.5, cost=0.5*10=5
    const result = calcSupplierCostPerSecond(new Decimal(5), new Decimal(10), new Decimal(10), makeState())
    expect(result.eq(new Decimal(5))).toBe(true)
  })

  it('scales linearly with ratePercent', () => {
    const result = calcSupplierCostPerSecond(new Decimal(5), new Decimal(10), new Decimal(10), makeState({ ratePercent: 50 }))
    expect(result.eq(new Decimal(2.5))).toBe(true)
  })

  it('returns 0 when inactive', () => {
    const result = calcSupplierCostPerSecond(new Decimal(5), new Decimal(10), new Decimal(10), makeState({ active: false }))
    expect(result.isZero()).toBe(true)
  })

  it('cost increases sub-linearly with rate upgrades', () => {
    // baseMaxRate=10, effectiveMax=30 (×3 upgrade), baseCost=5
    // costPerUnit = 5/10 = 0.5, actualProduction = 30, cost = 0.5 * 30 = 15
    // Without this fix, cost would still be 5 (old formula: effectiveCost * ratePercent/100)
    const result = calcSupplierCostPerSecond(new Decimal(5), new Decimal(10), new Decimal(30), makeState())
    expect(result.eq(new Decimal(15))).toBe(true)
    // But production is 30 (×3), cost is 15 (×3) — cost per unit stays 0.5
    // The benefit is that cost_reduction upgrades stack multiplicatively on top
  })
})

// ─── calcSupplierTick ─────────────────────────────────────────

describe('calcSupplierTick', () => {
  it('produces resources and costs coins for a single active supplier', () => {
    const data = makeData()
    const state = makeState()
    const suppliers = { test_supplier: state }
    const supplierData = { test_supplier: data }

    const result = calcSupplierTick(suppliers, supplierData, NO_UPGRADES, NO_UPGRADE_STATES, new Decimal(1000), 1)

    expect(result.entries).toHaveLength(1)
    expect(result.entries[0].production.eq(new Decimal(10))).toBe(true)
    expect(result.entries[0].cost.eq(new Decimal(5))).toBe(true)
    expect(result.resourceDeltas['beurre']?.eq(new Decimal(10))).toBe(true)
    expect(result.resourceDeltas['pantins_coins']?.eq(new Decimal(-5))).toBe(true)
  })

  it('applies delta time correctly', () => {
    const suppliers = { test_supplier: makeState() }
    const supplierData = { test_supplier: makeData() }

    const result = calcSupplierTick(suppliers, supplierData, NO_UPGRADES, NO_UPGRADE_STATES, new Decimal(1000), 0.5)

    expect(result.entries[0].production.eq(new Decimal(5))).toBe(true)
    expect(result.entries[0].cost.eq(new Decimal(2.5))).toBe(true)
  })

  it('throttles when coins are insufficient', () => {
    const suppliers = { test_supplier: makeState() }
    const supplierData = { test_supplier: makeData() }

    // Cost is 5/sec, delta is 1s, so need 5 coins. Only 2.5 available.
    const result = calcSupplierTick(suppliers, supplierData, NO_UPGRADES, NO_UPGRADE_STATES, new Decimal(2.5), 1)

    // Throttle = 2.5 / 5 = 0.5
    expect(result.entries[0].production.eq(new Decimal(5))).toBe(true)
    expect(result.entries[0].cost.eq(new Decimal(2.5))).toBe(true)
    expect(result.resourceDeltas['pantins_coins']?.eq(new Decimal(-2.5))).toBe(true)
    expect(result.resourceDeltas['beurre']?.eq(new Decimal(5))).toBe(true)
  })

  it('throttles proportionally across multiple suppliers', () => {
    const data1 = makeData({ id: supplierId('s1'), producedResource: BEURRE })
    const data2 = makeData({
      id: supplierId('s2'),
      producedResource: FARINE,
      baseMaxRate: new Decimal(20),
      baseCostPerSecond: new Decimal(10),
    })

    const state1 = makeState({ id: supplierId('s1') })
    const state2 = makeState({ id: supplierId('s2') })

    const suppliers = { s1: state1, s2: state2 }
    const supplierData = { s1: data1, s2: data2 }

    // Total cost/sec = 5 + 10 = 15. Available = 7.5 → throttle = 0.5
    const result = calcSupplierTick(suppliers, supplierData, NO_UPGRADES, NO_UPGRADE_STATES, new Decimal(7.5), 1)

    expect(result.entries).toHaveLength(2)

    const s1Entry = result.entries.find(e => e.supplierId === 's1')!
    const s2Entry = result.entries.find(e => e.supplierId === 's2')!

    expect(s1Entry.production.eq(new Decimal(5))).toBe(true) // 10 * 0.5
    expect(s1Entry.cost.eq(new Decimal(2.5))).toBe(true)     // 5 * 0.5
    expect(s2Entry.production.eq(new Decimal(10))).toBe(true) // 20 * 0.5
    expect(s2Entry.cost.eq(new Decimal(5))).toBe(true)        // 10 * 0.5
  })

  it('skips inactive/unlocked suppliers', () => {
    const suppliers = {
      s1: makeState({ id: supplierId('s1'), active: false }),
      s2: makeState({ id: supplierId('s2'), unlocked: false }),
    }
    const supplierData = {
      s1: makeData({ id: supplierId('s1') }),
      s2: makeData({ id: supplierId('s2') }),
    }

    const result = calcSupplierTick(suppliers, supplierData, NO_UPGRADES, NO_UPGRADE_STATES, new Decimal(1000), 1)

    expect(result.entries).toHaveLength(0)
    expect(Object.keys(result.resourceDeltas)).toHaveLength(0)
  })

  it('produces nothing when availableCoins is 0', () => {
    const suppliers = { test_supplier: makeState() }
    const supplierData = { test_supplier: makeData() }

    const result = calcSupplierTick(suppliers, supplierData, NO_UPGRADES, NO_UPGRADE_STATES, new Decimal(0), 1)

    expect(result.entries).toHaveLength(1)
    expect(result.entries[0].production.isZero()).toBe(true)
    expect(result.entries[0].cost.isZero()).toBe(true)
  })

  it('never costs more than available coins', () => {
    const suppliers = { test_supplier: makeState() }
    const supplierData = { test_supplier: makeData() }
    const available = new Decimal(0.001)

    const result = calcSupplierTick(suppliers, supplierData, NO_UPGRADES, NO_UPGRADE_STATES, available, 1)

    const coinCost = result.resourceDeltas['pantins_coins']?.abs() ?? new Decimal(0)
    expect(coinCost.lte(available)).toBe(true)
  })

  it('returns totalCostPerSecond for UI display', () => {
    const suppliers = { test_supplier: makeState({ ratePercent: 50 }) }
    const supplierData = { test_supplier: makeData() }

    const result = calcSupplierTick(suppliers, supplierData, NO_UPGRADES, NO_UPGRADE_STATES, new Decimal(1000), 1)

    expect(result.totalCostPerSecond.eq(new Decimal(2.5))).toBe(true)
  })

  it('returns effective rates per supplier', () => {
    const suppliers = { test_supplier: makeState() }
    const supplierData = { test_supplier: makeData() }

    const result = calcSupplierTick(suppliers, supplierData, NO_UPGRADES, NO_UPGRADE_STATES, new Decimal(1000), 1)

    expect(result.effectiveRates['test_supplier'].maxRate.eq(new Decimal(10))).toBe(true)
    expect(result.effectiveRates['test_supplier'].costPerSec.eq(new Decimal(5))).toBe(true)
  })
})
