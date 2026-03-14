import type Decimal from 'decimal.js'

// ─── Identifiants ────────────────────────────────────────────────

export type ResourceId = 'croissants' | 'beurre' | 'farine' | 'reputation' | 'etoiles'

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

// ─── Upgrades ────────────────────────────────────────────────────

export type UpgradeEffectType =
  | 'building_multiplier'
  | 'global_multiplier'
  | 'resource_multiplier'
  | 'click_multiplier'
  | 'cost_reduction'
  | 'synergy'
  | 'unlock'

export interface UpgradeEffect {
  type: UpgradeEffectType
  targetBuilding?: BuildingId
  targetResource?: ResourceId
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
  tempsDeJeu: number            // en secondes
  totalClics: number
  meilleurCroissantsParSeconde: Decimal
  dateDebut: number             // timestamp unix
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
