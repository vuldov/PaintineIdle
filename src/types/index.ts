import type Decimal from 'decimal.js'

// Re-export synergy types
export type {
  AuraEffectType,
  BuildingAura,
  ComboBoulangerie,
  SynergyBonuses,
} from './synergies'

// ─── Branded string types ──────────────────────────────────────
declare const __brand: unique symbol
type Brand<T, B extends string> = T & { readonly [__brand]: B }

export type ProductId = 'croissants' | 'pains_au_chocolat' | 'chocolatines' | 'pizzas'
export type ResourceId = Brand<string, 'ResourceId'>
export type BuildingId = Brand<string, 'BuildingId'>
export type CraftingRecipeId = Brand<string, 'CraftingRecipeId'>
export type UpgradeId = Brand<string, 'UpgradeId'>
export type SupplierId = Brand<string, 'SupplierId'>

// Helpers — cast raw strings into branded IDs
export const resourceId = (id: string): ResourceId => id as ResourceId
export const buildingId = (id: string): BuildingId => id as BuildingId
export const craftingRecipeId = (id: string): CraftingRecipeId => id as CraftingRecipeId
export const upgradeId = (id: string): UpgradeId => id as UpgradeId
export const supplierId = (id: string): SupplierId => id as SupplierId

// ─── Entity scope ──────────────────────────────────────────────
export type EntityScope = ProductId | 'global'

// ─── Special IDs ───────────────────────────────────────────────
export const PANTINS_COINS_ID = resourceId('pantins_coins')

// ─── Resource category ─────────────────────────────────────────
export type ResourceCategory = 'ingredient' | 'intermediaire' | 'produit_fini' | 'monnaie' | 'meta'

// ─── Pipeline role ─────────────────────────────────────────────
export type PipelineRole =
  | 'petrissage'
  | 'garnissage'
  | 'dorure'
  | 'preparation_sauce'
  | 'etalage'
  | 'cuisson'
  | 'vente'

// ─── Milestone system ─────────────────────────────────────────
export const MILESTONE_THRESHOLDS = [1, 5, 10, 25, 50, 75, 100, 150, 200, 250] as const
export type MilestoneThreshold = typeof MILESTONE_THRESHOLDS[number]

export type MilestoneEffectType =
  | 'building_production_multiplier'
  | 'crafting_ratio_bonus'
  | 'crafting_duration_reduction'
  | 'crafting_auto_unlock'

export interface MilestoneEffect {
  type: MilestoneEffectType
  value: Decimal
}

export interface MilestoneData {
  id: string
  buildingId: BuildingId
  threshold: MilestoneThreshold
  name: string
  description: string
  effects: MilestoneEffect[]
}

// ─── Resource data (definition, not state) ─────────────────────
export interface ResourceData {
  id: ResourceId
  name: string
  emoji: string
  category: ResourceCategory
  initiallyUnlocked: boolean
  initialAmount: Decimal
  scope: EntityScope
}

// ─── Building data (definition, not state) ─────────────────────
export interface BuildingData {
  id: BuildingId
  name: string
  emoji: string
  description: string
  baseCost: Decimal
  costResource: ResourceId
  costMultiplier: number
  baseProduction: Decimal
  producedResource: ResourceId
  pipelineRole: PipelineRole
  scope: EntityScope
  /** Optional synergy aura emitted by this building */
  aura?: import('./synergies').BuildingAura
}

// ─── Pipeline stage config (data-driven) ───────────────────────
export interface PipelineStageConfig {
  role: PipelineRole
  consumes: Array<{ resource: ResourceId; ratio: Decimal }>
  produces: Array<{ resource: ResourceId; ratio: Decimal }>
  /** Optional: extra free production from this stage */
  freeProduces?: Array<{ resource: ResourceId; ratio: Decimal }>
}

// ─── Crafting recipe data ──────────────────────────────────────
export interface CraftingInput {
  resource: ResourceId
  amount: Decimal
}

export interface CraftingOutput {
  resource: ResourceId
  amount: Decimal
}

export interface CraftingRecipeData {
  id: CraftingRecipeId
  name: string
  emoji: string
  verb: string
  inputs: CraftingInput[]
  output: CraftingOutput
  durationSeconds: number
  scope: EntityScope
  linkedBuildingId?: BuildingId
}

// ─── Product definition ────────────────────────────────────────
export interface ProductDefinition {
  id: ProductId
  name: string
  emoji: string
  color: string
  unlockCondition: { resource: ResourceId; amount: Decimal } | null
}

// ─── Product bundle ────────────────────────────────────────────
export interface ProductBundle {
  definition: ProductDefinition
  resources: Record<string, ResourceData>
  buildings: Record<string, BuildingData>
  buildingOrder: BuildingId[]
  buildingUnlockThresholds: Record<string, { resource: ResourceId; amount: Decimal }>
  craftingRecipes: Record<string, CraftingRecipeData>
  craftingOrder: CraftingRecipeId[]
  upgrades: Record<string, UpgradeData>
  upgradeOrder: UpgradeId[]
  pipelineConfig: { stages: PipelineStageConfig[] }
  passiveRegen: Record<string, Decimal>
  /** Supplier definitions (one per ingredient) */
  suppliers: Record<string, SupplierData>
  supplierOrder: SupplierId[]
  /** Supplier upgrade definitions */
  supplierUpgrades: Record<string, SupplierUpgradeData>
  supplierUpgradeOrder: SupplierUpgradeId[]
  /** The resource ID of the finished product (e.g., croissants, pains_au_chocolat) */
  finishedProductId: ResourceId
  baseSellRate: Decimal
  /** Milestone definitions for buildings in this product */
  milestones: MilestoneData[]
}

// ─── Upgrade data ──────────────────────────────────────────────
export type UpgradeEffectType =
  | 'building_multiplier'
  | 'global_multiplier'
  | 'resource_multiplier'
  | 'crafting_speed'
  | 'sell_multiplier'
  | 'cost_reduction'
  | 'synergy'
  | 'unlock'
  | 'specialization'
  | 'cross_product_synergy'
  | 'scaling'
  | 'crafting_ratio_bonus'
  | 'crafting_duration_reduction'
  | 'crafting_auto_unlock'

export interface UpgradeEffect {
  type: UpgradeEffectType
  targetBuilding?: BuildingId
  targetResource?: ResourceId
  targetRecipe?: CraftingRecipeId
  synergyBuildings?: [BuildingId, BuildingId]
  multiplier: Decimal
  /** For 'specialization': scaling bonus based on building count */
  scalingBonus?: {
    bonusType: 'global' | 'production' | 'sell'
    bonusPerUnit: Decimal
    scalingBuildingId?: BuildingId
    scalingDivisor?: number
  }
  /** For 'cross_product_synergy': cross-product interaction */
  crossProductEffect?: {
    sourceProduct: ProductId
    sourceResource?: string
    targetProduct: ProductId
    bonusType: 'sell' | 'production'
    bonusPerUnit: Decimal
    scalingDivisor?: number
  }
  /** For 'scaling': bonus that scales with total buildings/upgrades */
  scalingEffect?: {
    source: 'total_buildings' | 'total_upgrades' | 'building_count'
    sourceBuildingId?: BuildingId
    bonusType: 'global_production' | 'sell'
    bonusPerUnit: Decimal
    scalingDivisor?: number
  }
  /** For milestone upgrades: additional building production multiplier when primary type is a crafting effect */
  buildingProductionMultiplier?: Decimal
}

export type UnlockConditionType = 'resource_threshold' | 'building_count' | 'upgrade_purchased'

export interface UnlockCondition {
  type: UnlockConditionType
  resourceId?: ResourceId
  buildingId?: BuildingId
  upgradeId?: UpgradeId
  threshold: Decimal
}

export interface UpgradeData {
  id: UpgradeId
  name: string
  description: string
  emoji: string
  cost: Decimal
  costResource: ResourceId
  effect: UpgradeEffect
  unlockCondition: UnlockCondition
  scope: EntityScope
  category?: 'specialization' | 'synergy' | 'scaling' | 'milestone'
}

// ─── Supplier data (definition, not state) ──────────────────────

export interface SupplierData {
  id: SupplierId
  name: string
  emoji: string
  description: string
  /** The ingredient this supplier produces */
  producedResource: ResourceId
  /** Base maximum units produced per second (before upgrades) */
  baseMaxRate: Decimal
  /** Base cost in paintine coins per second at full rate (before upgrades) */
  baseCostPerSecond: Decimal
  /** One-time cost in paintine coins to unlock this supplier */
  contractCost: Decimal
  /** Which product this supplier belongs to */
  scope: ProductId
}

// ─── Supplier upgrade data ───────────────────────────────────────

export type SupplierUpgradeId = Brand<string, 'SupplierUpgradeId'>
export const supplierUpgradeId = (id: string): SupplierUpgradeId => id as SupplierUpgradeId

export type SupplierUpgradeEffectType = 'max_rate_bonus' | 'cost_reduction' | 'set_max_rate'

export interface SupplierUpgradeData {
  id: SupplierUpgradeId
  name: string
  emoji: string
  description: string
  /** Which supplier this upgrade targets */
  targetSupplier: SupplierId
  /** Cost to purchase this upgrade */
  cost: Decimal
  /** Resource spent (typically an intermediate resource like pate_feuilletee) */
  costResource: ResourceId
  /** What this upgrade does */
  effectType: SupplierUpgradeEffectType
  /** Multiplicative value: e.g. 1.5 = +50% maxRate, or 0.8 = -20% cost */
  effectValue: Decimal
  scope: ProductId
}

// ─── Supplier runtime state ──────────────────────────────────────

export interface SupplierState {
  id: SupplierId
  /** Has the contract been purchased? */
  unlocked: boolean
  /** Is this supplier currently active (producing)? */
  active: boolean
  /** Production rate as percentage of effective max (0–100) */
  ratePercent: number
}

export interface SupplierUpgradeState {
  id: SupplierUpgradeId
  purchased: boolean
}

// ─── Runtime state types ───────────────────────────────────────

export interface Resource {
  id: ResourceId
  amount: Decimal
  perSecond: Decimal
  totalEarned: Decimal
  unlocked: boolean
}

export interface Building {
  id: BuildingId
  count: number
  baseCost: Decimal
  costResource: ResourceId
  costMultiplier: number
  baseProduction: Decimal
  producedResource: ResourceId
  unlocked: boolean
}

export interface CraftingTask {
  recipeId: CraftingRecipeId
  progress: number          // 0 -> 1
  totalSeconds: number
}

export interface Upgrade {
  id: UpgradeId
  name: string
  description: string
  purchased: boolean
  cost: Decimal
  costResource: ResourceId
  effect: UpgradeEffect
  unlockCondition: UnlockCondition
  scope: EntityScope
  category?: 'specialization' | 'synergy' | 'scaling' | 'milestone'
}

// ─── Stats ───────────────────────────────────────────────────────

export interface GameStats {
  totalCroissantsProduits: Decimal
  tempsDeJeu: number
  totalClics: number
  meilleurCroissantsParSeconde: Decimal
  dateDebut: number
}

// ─── Game state (assembled from stores, for mechanics) ──────────

export interface GameState {
  resources: Record<string, Resource>
  buildings: Record<string, Building>
  upgrades: Record<string, Upgrade>
  stats: GameStats
  version: number
  lastSave: number
}
