import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import type { Resource, ResourceId, Upgrade, UpgradeId } from '@/types'
import { CRAFTING_RECIPES } from '@/lib/crafting'
import { canStartCrafting, calcCraftingDuration, calcSellValue } from './craftingMechanics'

// ─── Helpers ──────────────────────────────────────────────────────────

function makeResources(overrides: Partial<Record<ResourceId, Partial<Resource>>> = {}): Record<ResourceId, Resource> {
  const defaults: Record<ResourceId, Resource> = {
    croissants: { id: 'croissants', amount: new Decimal(0), perSecond: new Decimal(0), totalEarned: new Decimal(0), unlocked: true },
    beurre: { id: 'beurre', amount: new Decimal(0), perSecond: new Decimal(0), totalEarned: new Decimal(0), unlocked: true },
    farine: { id: 'farine', amount: new Decimal(0), perSecond: new Decimal(0), totalEarned: new Decimal(0), unlocked: true },
    pate: { id: 'pate', amount: new Decimal(0), perSecond: new Decimal(0), totalEarned: new Decimal(0), unlocked: true },
    pantins_coins: { id: 'pantins_coins', amount: new Decimal(0), perSecond: new Decimal(0), totalEarned: new Decimal(0), unlocked: true },
    reputation: { id: 'reputation', amount: new Decimal(0), perSecond: new Decimal(0), totalEarned: new Decimal(0), unlocked: false },
    etoiles: { id: 'etoiles', amount: new Decimal(0), perSecond: new Decimal(0), totalEarned: new Decimal(0), unlocked: false },
  }

  for (const [key, value] of Object.entries(overrides)) {
    defaults[key as ResourceId] = { ...defaults[key as ResourceId], ...value }
  }

  return defaults
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

// ─── canStartCrafting ─────────────────────────────────────────────────

describe('canStartCrafting', () => {
  it('returns false when player has no resources for petrissage', () => {
    const resources = makeResources()
    expect(canStartCrafting('petrissage', resources)).toBe(false)
  })

  it('returns true when player has exactly enough for petrissage', () => {
    // petrissage needs: beurre 2, farine 3
    const resources = makeResources({
      beurre: { amount: new Decimal(2) },
      farine: { amount: new Decimal(3) },
    })
    expect(canStartCrafting('petrissage', resources)).toBe(true)
  })

  it('returns true when player has more than enough', () => {
    const resources = makeResources({
      beurre: { amount: new Decimal(1000) },
      farine: { amount: new Decimal(1000) },
    })
    expect(canStartCrafting('petrissage', resources)).toBe(true)
  })

  it('returns false when one input is insufficient', () => {
    const resources = makeResources({
      beurre: { amount: new Decimal(100) },
      farine: { amount: new Decimal(2) }, // needs 3
    })
    expect(canStartCrafting('petrissage', resources)).toBe(false)
  })

  it('works for cuisson recipe', () => {
    // cuisson needs: pate 2
    const resources = makeResources({
      pate: { amount: new Decimal(2) },
    })
    expect(canStartCrafting('cuisson', resources)).toBe(true)
  })

  it('returns false for cuisson with insufficient pate', () => {
    const resources = makeResources({
      pate: { amount: new Decimal(1.5) },
    })
    expect(canStartCrafting('cuisson', resources)).toBe(false)
  })
})

// ─── calcCraftingDuration ─────────────────────────────────────────────

describe('calcCraftingDuration', () => {
  it('returns base duration with no upgrades', () => {
    const recipe = CRAFTING_RECIPES.petrissage
    const duration = calcCraftingDuration(recipe, {})
    expect(duration).toBe(3) // petrissage base = 3s
  })

  it('halves duration with a 2x speed upgrade', () => {
    const recipe = CRAFTING_RECIPES.petrissage
    const upgrades: Record<UpgradeId, Upgrade> = {
      speed: makeUpgrade({
        id: 'speed',
        purchased: true,
        effect: { type: 'crafting_speed', multiplier: new Decimal(2) },
      }),
    }
    const duration = calcCraftingDuration(recipe, upgrades)
    expect(duration).toBe(1.5)
  })

  it('does not apply unpurchased upgrades', () => {
    const recipe = CRAFTING_RECIPES.cuisson
    const upgrades: Record<UpgradeId, Upgrade> = {
      speed: makeUpgrade({
        id: 'speed',
        purchased: false,
        effect: { type: 'crafting_speed', multiplier: new Decimal(10) },
      }),
    }
    const duration = calcCraftingDuration(recipe, upgrades)
    expect(duration).toBe(5) // cuisson base = 5s
  })

  it('applies targeted recipe speed boost only to matching recipe', () => {
    const petrissageRecipe = CRAFTING_RECIPES.petrissage
    const cuissonRecipe = CRAFTING_RECIPES.cuisson
    const upgrades: Record<UpgradeId, Upgrade> = {
      speed: makeUpgrade({
        id: 'speed',
        purchased: true,
        effect: { type: 'crafting_speed', targetRecipe: 'petrissage', multiplier: new Decimal(3) },
      }),
    }
    // Petrissage should be boosted: 3/3 = 1s
    expect(calcCraftingDuration(petrissageRecipe, upgrades)).toBe(1)
    // Cuisson should NOT be boosted: stays at 5s
    expect(calcCraftingDuration(cuissonRecipe, upgrades)).toBe(5)
  })

  it('stacks multiple speed upgrades', () => {
    const recipe = CRAFTING_RECIPES.petrissage // base 3s
    const upgrades: Record<UpgradeId, Upgrade> = {
      s1: makeUpgrade({
        id: 's1',
        purchased: true,
        effect: { type: 'crafting_speed', multiplier: new Decimal(2) },
      }),
      s2: makeUpgrade({
        id: 's2',
        purchased: true,
        effect: { type: 'crafting_speed', multiplier: new Decimal(3) },
      }),
    }
    // 3 / (2 * 3) = 0.5
    expect(calcCraftingDuration(recipe, upgrades)).toBe(0.5)
  })
})

// ─── calcSellValue ────────────────────────────────────────────────────

describe('calcSellValue', () => {
  it('returns base value with no upgrades and no prestige bonus', () => {
    // BASE_SELL_RATE = 1, so 10 croissants = 10 pantins_coins
    const value = calcSellValue(new Decimal(10), {}, new Decimal(1))
    expect(value.eq(10)).toBe(true)
  })

  it('applies sell_multiplier upgrade', () => {
    const upgrades: Record<UpgradeId, Upgrade> = {
      sell: makeUpgrade({
        id: 'sell',
        purchased: true,
        effect: { type: 'sell_multiplier', multiplier: new Decimal(2) },
      }),
    }
    const value = calcSellValue(new Decimal(10), upgrades, new Decimal(1))
    // 10 * 1 (base) * 2 (upgrade) * 1 (prestige) = 20
    expect(value.eq(20)).toBe(true)
  })

  it('applies prestige multiplier', () => {
    const value = calcSellValue(new Decimal(10), {}, new Decimal(3))
    // 10 * 1 * 3 = 30
    expect(value.eq(30)).toBe(true)
  })

  it('stacks sell upgrades and prestige', () => {
    const upgrades: Record<UpgradeId, Upgrade> = {
      s1: makeUpgrade({
        id: 's1',
        purchased: true,
        effect: { type: 'sell_multiplier', multiplier: new Decimal(2) },
      }),
      s2: makeUpgrade({
        id: 's2',
        purchased: true,
        effect: { type: 'sell_multiplier', multiplier: new Decimal(1.5) },
      }),
    }
    const value = calcSellValue(new Decimal(10), upgrades, new Decimal(2))
    // 10 * (1 * 2 * 1.5) * 2 = 10 * 3 * 2 = 60
    expect(value.eq(60)).toBe(true)
  })

  it('returns 0 for 0 croissants', () => {
    const value = calcSellValue(new Decimal(0), {}, new Decimal(1))
    expect(value.eq(0)).toBe(true)
  })

  it('handles very large amounts', () => {
    const value = calcSellValue(new Decimal('1e100'), {}, new Decimal(1))
    expect(value.isFinite()).toBe(true)
    expect(value.eq(new Decimal('1e100'))).toBe(true)
  })
})
