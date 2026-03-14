import type Decimal from 'decimal.js'

// ─── Identifiants ────────────────────────────────────────────────

export type ResourceId =
  | 'croissants'
  | 'beurre'
  | 'farine'
  | 'pate'
  | 'pantins_coins'
  | 'reputation'
  | 'etoiles'

export type BuildingId =
  | 'fournil'
  | 'petrin'
  | 'four_pro'
  | 'boutique'
  | 'laboratoire'
  | 'usine'
  | 'franchise'
  | 'empire'

export type UpgradeId = string

export type CraftingRecipeId = 'petrissage' | 'cuisson'

// ─── Ressources ──────────────────────────────────────────────────

export interface Resource {
  id: ResourceId
  amount: Decimal
  perSecond: Decimal
  totalEarned: Decimal
  unlocked: boolean
}

// ─── Bâtiments ───────────────────────────────────────────────────

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

// ─── Crafting (fabrication manuelle) ─────────────────────────────

export interface CraftingInput {
  resource: ResourceId
  amount: Decimal
}

export interface CraftingOutput {
  resource: ResourceId
  amount: Decimal
}

export interface CraftingTask {
  recipeId: CraftingRecipeId
  progress: number          // 0 → 1
  totalSeconds: number
}

// ─── Upgrades ────────────────────────────────────────────────────

export type UpgradeEffectType =
  | 'building_multiplier'
  | 'global_multiplier'
  | 'resource_multiplier'
  | 'crafting_speed'
  | 'sell_multiplier'
  | 'cost_reduction'
  | 'synergy'
  | 'unlock'

export interface UpgradeEffect {
  type: UpgradeEffectType
  targetBuilding?: BuildingId
  targetResource?: ResourceId
  targetRecipe?: CraftingRecipeId
  synergyBuildings?: [BuildingId, BuildingId]
  multiplier: Decimal
}

export type UnlockConditionType = 'resource_threshold' | 'building_count' | 'upgrade_purchased'

export interface UnlockCondition {
  type: UnlockConditionType
  resourceId?: ResourceId
  buildingId?: BuildingId
  upgradeId?: UpgradeId
  threshold: Decimal
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
}

// ─── Prestige ────────────────────────────────────────────────────

export interface PrestigeState {
  etoiles: Decimal
  etoilesCettePartie: Decimal
  totalPrestiges: number
  bonusMultiplier: Decimal
}

// ─── Stats ───────────────────────────────────────────────────────

export interface GameStats {
  totalCroissantsProduits: Decimal
  tempsDeJeu: number
  totalClics: number
  meilleurCroissantsParSeconde: Decimal
  dateDebut: number
}

// ─── État global ─────────────────────────────────────────────────

export interface GameState {
  resources: Record<ResourceId, Resource>
  buildings: Record<BuildingId, Building>
  upgrades: Record<UpgradeId, Upgrade>
  prestige: PrestigeState
  stats: GameStats
  version: number
  lastSave: number
}
