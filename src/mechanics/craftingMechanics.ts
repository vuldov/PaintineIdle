import Decimal from 'decimal.js'
import type { CraftingRecipeId, Resource, ResourceId, Upgrade, UpgradeId } from '@/types'
import { CRAFTING_RECIPES, BASE_SELL_RATE } from '@/lib/crafting'
import type { CraftingRecipeData } from '@/lib/crafting'

/**
 * Vérifie si le joueur a assez de ressources pour lancer une recette.
 */
export function canStartCrafting(
  recipeId: CraftingRecipeId,
  resources: Record<ResourceId, Resource>,
): boolean {
  const recipe = CRAFTING_RECIPES[recipeId]
  for (const input of recipe.inputs) {
    if (resources[input.resource].amount.lt(input.amount)) return false
  }
  return true
}

/**
 * Calcule la durée effective d'une recette en prenant en compte les upgrades.
 */
export function calcCraftingDuration(
  recipe: CraftingRecipeData,
  upgrades: Record<UpgradeId, Upgrade>,
): number {
  let speedMultiplier = new Decimal(1)

  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    if (upgrade.effect.type === 'crafting_speed') {
      // Soit c'est un boost global (pas de targetRecipe), soit c'est spécifique
      if (!upgrade.effect.targetRecipe || upgrade.effect.targetRecipe === recipe.id) {
        speedMultiplier = speedMultiplier.mul(upgrade.effect.multiplier)
      }
    }
  }

  return new Decimal(recipe.durationSeconds).div(speedMultiplier).toNumber()
}

/**
 * Calcule le prix de vente de N croissants en prenant en compte les upgrades et le prestige.
 */
export function calcSellValue(
  amount: Decimal,
  upgrades: Record<UpgradeId, Upgrade>,
  prestigeMultiplier: Decimal,
): Decimal {
  let sellRate = BASE_SELL_RATE

  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    if (upgrade.effect.type === 'sell_multiplier') {
      sellRate = sellRate.mul(upgrade.effect.multiplier)
    }
  }

  return amount.mul(sellRate).mul(prestigeMultiplier)
}
