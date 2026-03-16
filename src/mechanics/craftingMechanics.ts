import Decimal from 'decimal.js'
import type { Resource, Upgrade, CraftingRecipeData, SynergyBonuses } from '@/types'

/**
 * Check if the player has enough resources to start a crafting recipe.
 * Takes the recipe directly (no lookup).
 */
export function canStartCrafting(
  recipe: CraftingRecipeData,
  resources: Record<string, Resource>,
): boolean {
  for (const input of recipe.inputs) {
    const rid = input.resource as string
    const resource = resources[rid]
    if (!resource || resource.amount.lt(input.amount)) return false
  }
  return true
}

/**
 * Calculate the effective duration of a recipe taking into account upgrades and synergies.
 */
export function calcCraftingDuration(
  recipe: CraftingRecipeData,
  upgrades: Record<string, Upgrade>,
  synergyBonuses?: SynergyBonuses,
): number {
  let speedMultiplier = new Decimal(1)

  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    if (upgrade.effect.type === 'crafting_speed') {
      // Either a global boost (no targetRecipe) or specific to this recipe
      if (!upgrade.effect.targetRecipe || (upgrade.effect.targetRecipe as string) === (recipe.id as string)) {
        speedMultiplier = speedMultiplier.mul(upgrade.effect.multiplier)
      }
    }
  }

  // Apply synergy crafting speed bonuses
  if (synergyBonuses) {
    const recipeId = recipe.id as string
    // Per-recipe bonus
    const recipeMult = synergyBonuses.craftingSpeedMultipliers[recipeId]
    if (recipeMult) {
      speedMultiplier = speedMultiplier.mul(recipeMult)
    }
    // Global crafting speed bonus
    const globalMult = synergyBonuses.craftingSpeedMultipliers['_global']
    if (globalMult) {
      speedMultiplier = speedMultiplier.mul(globalMult)
    }
  }

  return new Decimal(recipe.durationSeconds).div(speedMultiplier).toNumber()
}

/**
 * Calculate the sell value of N products.
 * Takes baseSellRate as a parameter (product-specific).
 */
export function calcSellValue(
  amount: Decimal,
  upgrades: Record<string, Upgrade>,
  baseSellRate: Decimal,
  synergyBonuses?: SynergyBonuses,
  productId?: string,
): Decimal {
  let sellRate = baseSellRate

  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    if (upgrade.effect.type === 'sell_multiplier') {
      sellRate = sellRate.mul(upgrade.effect.multiplier)
    }
  }

  let synergyMult = new Decimal(1)
  if (synergyBonuses) {
    synergyMult = synergyMult.mul(synergyBonuses.globalSellMultiplier)
    if (productId) {
      const productSellMult = synergyBonuses.sellMultipliers[productId]
      if (productSellMult) {
        synergyMult = synergyMult.mul(productSellMult)
      }
    }
  }

  return amount.mul(sellRate).mul(synergyMult)
}
