import type { SupplierContractTierData } from '@/types'

// ─── Constantes de jeu ──────────────────────────────────────────

export const SAVE_KEY = 'croissant_idle_save'
export const AUTOSAVE_INTERVAL_MS = 30_000
export const MAX_OFFLINE_SECONDS = 8 * 60 * 60
export const GAME_VERSION = 9

// ─── Rangs de contrat fournisseur ───────────────────────────────

export const SUPPLIER_CONTRACT_TIERS: SupplierContractTierData[] = [
  { tier: 0, name: 'Artisanal', emoji: '\u{1F3E0}', rateMultiplier: 1, costMultiplier: 1 },
  { tier: 1, name: 'Semi-industriel', emoji: '\u{2699}\u{FE0F}', rateMultiplier: 5, costMultiplier: 10 },
  { tier: 2, name: 'Industriel', emoji: '\u{1F3ED}', rateMultiplier: 25, costMultiplier: 100 },
  { tier: 3, name: 'Import national', emoji: '\u{1F5FA}\u{FE0F}', rateMultiplier: 125, costMultiplier: 1000 },
  { tier: 4, name: 'Import mondial', emoji: '\u{1F30D}', rateMultiplier: 625, costMultiplier: 10000 },
]

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
