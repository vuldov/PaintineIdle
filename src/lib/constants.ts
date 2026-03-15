import Decimal from 'decimal.js'

// ─── Constantes de jeu ──────────────────────────────────────────

export const SAVE_KEY = 'croissant_idle_save'
export const AUTOSAVE_INTERVAL_MS = 30_000
export const MAX_OFFLINE_SECONDS = 8 * 60 * 60
export const PRESTIGE_THRESHOLD = new Decimal(1_000_000)
export const GAME_VERSION = 2

// ─── Ré-exports pour compatibilité ──────────────────────────────

export { RESOURCES_DATA, BASE_INGREDIENT_REGEN, RESOURCE_UNLOCK_THRESHOLDS } from '@/lib/resources'
export type { ResourceCategory, ResourceData } from '@/lib/resources'

export {
  BUILDINGS_DATA,
  BUILDING_ORDER,
  BUILDING_UNLOCK_THRESHOLDS,
  PETRISSAGE_BEURRE_RATIO,
  PETRISSAGE_FARINE_RATIO,
  CUISSON_PATE_RATIO,
  VENTE_CROISSANT_RATIO,
} from '@/lib/buildings'
export type { BuildingPipelineRole, BuildingData } from '@/lib/buildings'

export { UPGRADES_DATA, UPGRADE_ORDER } from '@/lib/upgrades'
export type { UpgradeData } from '@/lib/upgrades'

export { CRAFTING_RECIPES, CRAFTING_ORDER, BASE_SELL_RATE } from '@/lib/crafting'
export type { CraftingRecipeData } from '@/lib/crafting'
