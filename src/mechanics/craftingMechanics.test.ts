import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import type { Resource, Upgrade } from '@/types'
import { PANTINS_COINS_ID } from '@/types'
import { CROISSANTS_BUNDLE } from '@/lib/products/croissants'
import { canStartCrafting, calcCraftingDuration, calcSellValue } from './craftingMechanics'

// ─── Helpers ──────────────────────────────────────────────────────────

function makeResources(overrides: Record<string, Partial<Resource>> = {}): Record<string, Resource> {
  const defaults: Record<string, Resource> = {}

  // Add croissant product resources
  for (const [id, data] of Object.entries(CROISSANTS_BUNDLE.resources)) {
    defaults[id] = {
      id: data.id,
      amount: new Decimal(0),
      perSecond: new Decimal(0),
      totalEarned: new Decimal(0),
      unlocked: true,
    }
  }

  // Add global resources
  defaults['pantins_coins'] = {
    id: PANTINS_COINS_ID,
    amount: new Decimal(0),
    perSecond: new Decimal(0),
    totalEarned: new Decimal(0),
    unlocked: true,
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (defaults[key]) {
      defaults[key] = { ...defaults[key], ...value }
    }
  }

  return defaults
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

// ─── canStartCrafting ─────────────────────────────────────────────────

describe('canStartCrafting', () => {
  const petrissageRecipe = CROISSANTS_BUNDLE.craftingRecipes['petrissage_croissant']
  const cuissonRecipe = CROISSANTS_BUNDLE.craftingRecipes['cuisson_croissant']

  it('returns false when player has no resources for petrissage', () => {
    const resources = makeResources()
    expect(canStartCrafting(petrissageRecipe, resources)).toBe(false)
  })

  it('returns true when player has exactly enough for petrissage', () => {
    const resources = makeResources({
      beurre: { amount: new Decimal(2) },
      farine: { amount: new Decimal(3) },
    })
    expect(canStartCrafting(petrissageRecipe, resources)).toBe(true)
  })

  it('returns true when player has more than enough', () => {
    const resources = makeResources({
      beurre: { amount: new Decimal(1000) },
      farine: { amount: new Decimal(1000) },
    })
    expect(canStartCrafting(petrissageRecipe, resources)).toBe(true)
  })

  it('returns false when one input is insufficient', () => {
    const resources = makeResources({
      beurre: { amount: new Decimal(100) },
      farine: { amount: new Decimal(2) }, // needs 3
    })
    expect(canStartCrafting(petrissageRecipe, resources)).toBe(false)
  })

  it('works for cuisson recipe', () => {
    const resources = makeResources({
      pate_feuilletee: { amount: new Decimal(2) },
    })
    expect(canStartCrafting(cuissonRecipe, resources)).toBe(true)
  })

  it('returns false for cuisson with insufficient pate', () => {
    const resources = makeResources({
      pate_feuilletee: { amount: new Decimal(1.5) },
    })
    expect(canStartCrafting(cuissonRecipe, resources)).toBe(false)
  })
})

// ─── calcCraftingDuration ─────────────────────────────────────────────

describe('calcCraftingDuration', () => {
  const petrissageRecipe = CROISSANTS_BUNDLE.craftingRecipes['petrissage_croissant']
  const cuissonRecipe = CROISSANTS_BUNDLE.craftingRecipes['cuisson_croissant']

  it('returns base duration with no upgrades', () => {
    const duration = calcCraftingDuration(petrissageRecipe, {})
    expect(duration).toBe(3) // petrissage base = 3s
  })

  it('halves duration with a 2x speed upgrade', () => {
    const upgrades: Record<string, Upgrade> = {
      speed: makeUpgrade({
        id: 'speed' as Upgrade['id'],
        purchased: true,
        effect: { type: 'crafting_speed', multiplier: new Decimal(2) },
      }),
    }
    const duration = calcCraftingDuration(petrissageRecipe, upgrades)
    expect(duration).toBe(1.5)
  })

  it('does not apply unpurchased upgrades', () => {
    const upgrades: Record<string, Upgrade> = {
      speed: makeUpgrade({
        id: 'speed' as Upgrade['id'],
        purchased: false,
        effect: { type: 'crafting_speed', multiplier: new Decimal(10) },
      }),
    }
    const duration = calcCraftingDuration(cuissonRecipe, upgrades)
    expect(duration).toBe(5) // cuisson base = 5s
  })

  it('applies targeted recipe speed boost only to matching recipe', () => {
    const petrissageId = CROISSANTS_BUNDLE.craftingOrder[0]
    const upgrades: Record<string, Upgrade> = {
      speed: makeUpgrade({
        id: 'speed' as Upgrade['id'],
        purchased: true,
        effect: { type: 'crafting_speed', targetRecipe: petrissageId, multiplier: new Decimal(3) },
      }),
    }
    // Petrissage should be boosted: 3/3 = 1s
    expect(calcCraftingDuration(petrissageRecipe, upgrades)).toBe(1)
    // Cuisson should NOT be boosted: stays at 5s
    expect(calcCraftingDuration(cuissonRecipe, upgrades)).toBe(5)
  })

  it('stacks multiple speed upgrades', () => {
    const upgrades: Record<string, Upgrade> = {
      s1: makeUpgrade({
        id: 's1' as Upgrade['id'],
        purchased: true,
        effect: { type: 'crafting_speed', multiplier: new Decimal(2) },
      }),
      s2: makeUpgrade({
        id: 's2' as Upgrade['id'],
        purchased: true,
        effect: { type: 'crafting_speed', multiplier: new Decimal(3) },
      }),
    }
    // 3 / (2 * 3) = 0.5
    expect(calcCraftingDuration(petrissageRecipe, upgrades)).toBe(0.5)
  })
})

// ─── calcSellValue ────────────────────────────────────────────────────

describe('calcSellValue', () => {
  const baseSellRate = CROISSANTS_BUNDLE.baseSellRate

  it('returns base value with no upgrades', () => {
    const value = calcSellValue(new Decimal(10), {}, baseSellRate)
    expect(value.eq(10)).toBe(true)
  })

  it('applies sell_multiplier upgrade', () => {
    const upgrades: Record<string, Upgrade> = {
      sell: makeUpgrade({
        id: 'sell' as Upgrade['id'],
        purchased: true,
        effect: { type: 'sell_multiplier', multiplier: new Decimal(2) },
      }),
    }
    const value = calcSellValue(new Decimal(10), upgrades, baseSellRate)
    expect(value.eq(20)).toBe(true)
  })

  it('stacks multiple sell upgrades', () => {
    const upgrades: Record<string, Upgrade> = {
      s1: makeUpgrade({
        id: 's1' as Upgrade['id'],
        purchased: true,
        effect: { type: 'sell_multiplier', multiplier: new Decimal(2) },
      }),
      s2: makeUpgrade({
        id: 's2' as Upgrade['id'],
        purchased: true,
        effect: { type: 'sell_multiplier', multiplier: new Decimal(1.5) },
      }),
    }
    const value = calcSellValue(new Decimal(10), upgrades, baseSellRate)
    // 10 * (1 * 2 * 1.5) = 30
    expect(value.eq(30)).toBe(true)
  })

  it('returns 0 for 0 amount', () => {
    const value = calcSellValue(new Decimal(0), {}, baseSellRate)
    expect(value.eq(0)).toBe(true)
  })

  it('handles very large amounts', () => {
    const value = calcSellValue(new Decimal('1e100'), {}, baseSellRate)
    expect(value.isFinite()).toBe(true)
    expect(value.eq(new Decimal('1e100'))).toBe(true)
  })

  it('uses different baseSellRate for different products', () => {
    const higherRate = new Decimal(5)
    const value = calcSellValue(new Decimal(10), {}, higherRate)
    expect(value.eq(50)).toBe(true)
  })
})
