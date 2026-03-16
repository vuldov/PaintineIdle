import type { ProductId, ProductBundle, ResourceData, BuildingData, UpgradeData, CraftingRecipeData } from '@/types'
import { SHARED_RESOURCES, SHARED_RESOURCE_UNLOCK_THRESHOLDS } from './shared'
import { CROISSANTS_BUNDLE } from './croissants'
import { PAINS_AU_CHOCOLAT_BUNDLE } from './pains_au_chocolat'
import { CHOCOLATINES_BUNDLE } from './chocolatines'
import { PIZZAS_BUNDLE } from './pizzas'
import { SYNERGY_UPGRADES } from '@/lib/synergies/synergyUpgrades'
import type Decimal from 'decimal.js'
import type { ResourceId } from '@/types'

// ─── Product registry ──────────────────────────────────────────

export const PRODUCT_REGISTRY: Record<ProductId, ProductBundle> = {
  croissants: CROISSANTS_BUNDLE,
  pains_au_chocolat: PAINS_AU_CHOCOLAT_BUNDLE,
  chocolatines: CHOCOLATINES_BUNDLE,
  pizzas: PIZZAS_BUNDLE,
}

export const PRODUCT_ORDER: ProductId[] = [
  'croissants',
  'pains_au_chocolat',
  'chocolatines',
  'pizzas',
]

// ─── Aggregated lookups ────────────────────────────────────────

/** All resource definitions (shared + all products), keyed by ResourceId string */
export const ALL_RESOURCES: Record<string, ResourceData> = { ...SHARED_RESOURCES }

/** All building definitions, keyed by BuildingId string */
export const ALL_BUILDINGS: Record<string, BuildingData> = {}

/** All upgrade definitions, keyed by UpgradeId string */
export const ALL_UPGRADES: Record<string, UpgradeData> = {}

/** All crafting recipe definitions, keyed by CraftingRecipeId string */
export const ALL_CRAFTING: Record<string, CraftingRecipeData> = {}

// Populate from products
for (const bundle of Object.values(PRODUCT_REGISTRY)) {
  for (const [key, value] of Object.entries(bundle.resources)) {
    if (ALL_RESOURCES[key]) {
      throw new Error(`Duplicate resource ID: ${key}`)
    }
    ALL_RESOURCES[key] = value
  }
  for (const [key, value] of Object.entries(bundle.buildings)) {
    if (ALL_BUILDINGS[key]) {
      throw new Error(`Duplicate building ID: ${key}`)
    }
    ALL_BUILDINGS[key] = value
  }
  for (const [key, value] of Object.entries(bundle.upgrades)) {
    if (ALL_UPGRADES[key]) {
      throw new Error(`Duplicate upgrade ID: ${key}`)
    }
    ALL_UPGRADES[key] = value
  }
  for (const [key, value] of Object.entries(bundle.craftingRecipes)) {
    if (ALL_CRAFTING[key]) {
      throw new Error(`Duplicate crafting recipe ID: ${key}`)
    }
    ALL_CRAFTING[key] = value
  }
}

// Merge synergy upgrades into ALL_UPGRADES
for (const [key, value] of Object.entries(SYNERGY_UPGRADES)) {
  if (ALL_UPGRADES[key]) {
    throw new Error(`Duplicate upgrade ID (synergy): ${key}`)
  }
  ALL_UPGRADES[key] = value
}

// ─── Re-exports ────────────────────────────────────────────────

export { SHARED_RESOURCES, SHARED_RESOURCE_UNLOCK_THRESHOLDS }
export { CROISSANTS_BUNDLE } from './croissants'
export { PAINS_AU_CHOCOLAT_BUNDLE } from './pains_au_chocolat'
export { CHOCOLATINES_BUNDLE } from './chocolatines'
export { PIZZAS_BUNDLE } from './pizzas'

// ─── Helpers ───────────────────────────────────────────────────

/** Find which product a resource belongs to (or 'global' for shared resources) */
export function getResourceScope(resId: ResourceId): ProductId | 'global' {
  const shared = SHARED_RESOURCES[resId as string]
  if (shared) return 'global'
  for (const [productId, bundle] of Object.entries(PRODUCT_REGISTRY)) {
    if (bundle.resources[resId as string]) return productId as ProductId
  }
  return 'global'
}

/** Find which product a building belongs to */
export function getBuildingProduct(bId: string): ProductId | undefined {
  for (const [productId, bundle] of Object.entries(PRODUCT_REGISTRY)) {
    if (bundle.buildings[bId]) return productId as ProductId
  }
  return undefined
}

/** Find which product an upgrade belongs to (using scope) */
export function getUpgradeScope(upId: string): ProductId | 'global' {
  const upgrade = ALL_UPGRADES[upId]
  if (!upgrade) return 'global'
  return upgrade.scope
}

/** All building unlock thresholds across products, merged */
export function getAllBuildingUnlockThresholds(): Record<string, { resource: ResourceId; amount: Decimal }> {
  const result: Record<string, { resource: ResourceId; amount: Decimal }> = {}
  for (const bundle of Object.values(PRODUCT_REGISTRY)) {
    Object.assign(result, bundle.buildingUnlockThresholds)
  }
  return result
}
