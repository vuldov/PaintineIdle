import type Decimal from 'decimal.js'
import type { ProductId } from './index'

// ─── Aura effect types ───────────────────────────────────────────

export type AuraEffectType =
  | 'crafting_speed_bonus'
  | 'production_bonus'
  | 'global_production_bonus'
  | 'sell_price_bonus'
  | 'ingredient_generation_bonus'
  | 'all_speed_bonus'
  | 'cross_product_bonus'

// ─── Building aura (attached to BuildingData) ────────────────────

export interface BuildingAura {
  effectType: AuraEffectType
  /** Bonus per building owned (e.g., 0.02 = +2% per building) */
  bonusPerBuilding: Decimal
  /** Which product this aura targets (if applicable) */
  targetProduct?: ProductId
  /** Which crafting recipe this aura targets (if applicable) */
  targetRecipe?: string  // CraftingRecipeId as string
  /** Which resource this aura targets (if applicable) */
  targetResource?: string
  /** For cross_product_bonus: which product receives the bonus */
  crossProductTarget?: ProductId
  /** UI description of the aura */
  description: string
}

// ─── Combo boulangerie ───────────────────────────────────────────

export interface ComboBoulangerie {
  id: string
  name: string
  description: string
  requiredProducts: ProductId[]
  bonusType: 'sell' | 'production' | 'global'
  /** The bonus multiplier (e.g., 0.10 = +10%) */
  bonusMultiplier: Decimal
}

// ─── Synergy bonuses (computed each tick) ────────────────────────

export interface SynergyBonuses {
  /** Per-product production multipliers (keyed by ProductId) */
  productionMultipliers: Record<string, Decimal>
  /** Global production multiplier (stacks with per-product) */
  globalProductionMultiplier: Decimal
  /** Per-product sell multipliers (keyed by ProductId) */
  sellMultipliers: Record<string, Decimal>
  /** Global sell multiplier */
  globalSellMultiplier: Decimal
  /** Per-recipe crafting speed multipliers (keyed by CraftingRecipeId string) */
  craftingSpeedMultipliers: Record<string, Decimal>
  /** Per-resource ingredient generation multipliers (keyed by resource string) */
  ingredientMultipliers: Record<string, Decimal>
  /** Currently active combos */
  activeCombos: ComboBoulangerie[]
}
