// ─── Constantes de jeu ──────────────────────────────────────────

export const SAVE_KEY = 'croissant_idle_save'
export const AUTOSAVE_INTERVAL_MS = 30_000
export const MAX_OFFLINE_SECONDS = 8 * 60 * 60
export const GAME_VERSION = 5

// ─── Ré-exports depuis le registre produit ──────────────────────

export {
  PRODUCT_REGISTRY,
  PRODUCT_ORDER,
  ALL_RESOURCES,
  ALL_BUILDINGS,
  ALL_UPGRADES,
  ALL_CRAFTING,
  SHARED_RESOURCES,
  SHARED_RESOURCE_UNLOCK_THRESHOLDS,
  getResourceScope,
  getBuildingProduct,
  getUpgradeScope,
  getAllBuildingUnlockThresholds,
} from '@/lib/products/registry'
