import Decimal from 'decimal.js'
import type { Resource, Upgrade, CraftingRecipeData } from '@/types'

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
 * Calculate the effective duration of a recipe taking into account upgrades.
 */
export function calcCraftingDuration(
  recipe: CraftingRecipeData,
  upgrades: Record<string, Upgrade>,
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

  return new Decimal(recipe.durationSeconds).div(speedMultiplier).toNumber()
}

/**
 * Calculate the sell value of N products.
 * Takes baseSellRate as a parameter (product-specific).
 */
export function calcSellValue(
  amount: Decimal,
  upgrades: Record<string, Upgrade>,
  prestigeMultiplier: Decimal,
  baseSellRate: Decimal,
): Decimal {
  let sellRate = baseSellRate

  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    if (upgrade.effect.type === 'sell_multiplier') {
      sellRate = sellRate.mul(upgrade.effect.multiplier)
    }
  }

  return amount.mul(sellRate).mul(prestigeMultiplier)
}
