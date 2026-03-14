import Decimal from 'decimal.js'
import type {
  BuildingId,
  CraftingInput,
  CraftingOutput,
  CraftingRecipeId,
  ResourceId,
  UpgradeEffect,
  UnlockCondition,
} from '@/types'

// ─── Données de base des ressources ─────────────────────────────

export type ResourceCategory = 'produit_fini' | 'ingredient' | 'monnaie' | 'meta'

export interface ResourceData {
  id: ResourceId
  name: string
  emoji: string
  category: ResourceCategory
  initiallyUnlocked: boolean
  initialAmount: Decimal
}

export const RESOURCES_DATA: Record<ResourceId, ResourceData> = {
  croissants: {
    id: 'croissants',
    name: 'Croissants',
    emoji: '🥐',
    category: 'produit_fini',
    initiallyUnlocked: true,
    initialAmount: new Decimal(0),
  },
  beurre: {
    id: 'beurre',
    name: 'Beurre',
    emoji: '🧈',
    category: 'ingredient',
    initiallyUnlocked: true,
    initialAmount: new Decimal(10),
  },
  farine: {
    id: 'farine',
    name: 'Farine',
    emoji: '🌾',
    category: 'ingredient',
    initiallyUnlocked: true,
    initialAmount: new Decimal(20),
  },
  pate: {
    id: 'pate',
    name: 'Pâte',
    emoji: '🫓',
    category: 'ingredient',
    initiallyUnlocked: true,
    initialAmount: new Decimal(0),
  },
  pantins_coins: {
    id: 'pantins_coins',
    name: 'Paintines Coins',
    emoji: '🪙',
    category: 'monnaie',
    initiallyUnlocked: true,
    initialAmount: new Decimal(0),
  },
  reputation: {
    id: 'reputation',
    name: 'Réputation',
    emoji: '⭐',
    category: 'meta',
    initiallyUnlocked: false,
    initialAmount: new Decimal(0),
  },
  etoiles: {
    id: 'etoiles',
    name: 'Étoiles Michelin',
    emoji: '⭐',
    category: 'meta',
    initiallyUnlocked: false,
    initialAmount: new Decimal(0),
  },
}

// ─── Recettes de fabrication ─────────────────────────────────────

export interface CraftingRecipeData {
  id: CraftingRecipeId
  name: string
  emoji: string
  verb: string                     // texte du bouton : "Pétrir", "Cuire"
  inputs: CraftingInput[]
  output: CraftingOutput
  durationSeconds: number
}

export const CRAFTING_RECIPES: Record<CraftingRecipeId, CraftingRecipeData> = {
  petrissage: {
    id: 'petrissage',
    name: 'Pétrissage',
    emoji: '🤲',
    verb: 'Pétrir',
    inputs: [
      { resource: 'beurre', amount: new Decimal(2) },
      { resource: 'farine', amount: new Decimal(3) },
    ],
    output: { resource: 'pate', amount: new Decimal(2) },
    durationSeconds: 3,
  },
  cuisson: {
    id: 'cuisson',
    name: 'Cuisson',
    emoji: '🔥',
    verb: 'Cuire',
    inputs: [
      { resource: 'pate', amount: new Decimal(2) },
    ],
    output: { resource: 'croissants', amount: new Decimal(3) },
    durationSeconds: 5,
  },
}

export const CRAFTING_ORDER: CraftingRecipeId[] = ['petrissage', 'cuisson']

// ─── Vente ───────────────────────────────────────────────────────

export const BASE_SELL_RATE = new Decimal(1)   // 1 paintines_coin par croissant

// ─── Régénération passive d'ingrédients ──────────────────────────
// Le joueur n'est jamais complètement bloqué

export const BASE_INGREDIENT_REGEN: Partial<Record<ResourceId, Decimal>> = {
  beurre: new Decimal(0.2),   // 0.2/s de base
  farine: new Decimal(0.3),   // 0.3/s de base
}

// ─── Données de base des bâtiments ──────────────────────────────

export type BuildingPipelineRole =
  | 'petrissage'    // consomme beurre+farine → produit pâte
  | 'cuisson'       // consomme pâte → produit croissants
  | 'vente'         // consomme croissants → produit pantins_coins
  | 'ingredients'   // produit beurre et/ou farine
  | 'full_pipeline' // fait tout

export interface BuildingData {
  id: BuildingId
  name: string
  emoji: string
  description: string
  baseCost: Decimal
  costResource: ResourceId
  costMultiplier: number
  baseProduction: Decimal
  producedResource: ResourceId       // ressource principale produite (pour affichage)
  pipelineRole: BuildingPipelineRole
}

export const BUILDINGS_DATA: Record<BuildingId, BuildingData> = {
  fournil: {
    id: 'fournil',
    name: 'Fournil',
    emoji: '🏠',
    description: 'Cuit automatiquement la pâte en croissants',
    baseCost: new Decimal(15),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(0.4),
    producedResource: 'croissants',
    pipelineRole: 'cuisson',
  },
  petrin: {
    id: 'petrin',
    name: 'Pétrin mécanique',
    emoji: '⚙️',
    description: 'Pétrit automatiquement le beurre et la farine en pâte',
    baseCost: new Decimal(30),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(0.5),
    producedResource: 'pate',
    pipelineRole: 'petrissage',
  },
  four_pro: {
    id: 'four_pro',
    name: 'Four professionnel',
    emoji: '🔥',
    description: 'Cuisson rapide et de qualité supérieure',
    baseCost: new Decimal(200),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(2),
    producedResource: 'croissants',
    pipelineRole: 'cuisson',
  },
  boutique: {
    id: 'boutique',
    name: 'Boutique',
    emoji: '🏪',
    description: 'Vend automatiquement les croissants',
    baseCost: new Decimal(500),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(1),
    producedResource: 'pantins_coins',
    pipelineRole: 'vente',
  },
  laboratoire: {
    id: 'laboratoire',
    name: 'Laboratoire pâtissier',
    emoji: '🔬',
    description: 'Génère du beurre et de la farine',
    baseCost: new Decimal(1_500),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(2),
    producedResource: 'beurre',
    pipelineRole: 'ingredients',
  },
  usine: {
    id: 'usine',
    name: 'Usine viennoiserie',
    emoji: '🏭',
    description: 'Production industrielle : pétrit, cuit et vend',
    baseCost: new Decimal(10_000),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(5),
    producedResource: 'croissants',
    pipelineRole: 'full_pipeline',
  },
  franchise: {
    id: 'franchise',
    name: 'Franchise nationale',
    emoji: '🗺️',
    description: 'Réseau de vente dans toute la France',
    baseCost: new Decimal(50_000),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(10),
    producedResource: 'pantins_coins',
    pipelineRole: 'vente',
  },
  empire: {
    id: 'empire',
    name: 'Empire mondial',
    emoji: '🌍',
    description: 'Domination mondiale de la viennoiserie',
    baseCost: new Decimal(500_000),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(50),
    producedResource: 'croissants',
    pipelineRole: 'full_pipeline',
  },
}

// ─── Ratios de consommation du pipeline ──────────────────────────
// Un pétrin qui produit X pâte/s consomme (X × ratio) beurre et farine par seconde

export const PETRISSAGE_BEURRE_RATIO = new Decimal(1)       // 1 beurre par pâte
export const PETRISSAGE_FARINE_RATIO = new Decimal(1.5)     // 1.5 farine par pâte
export const CUISSON_PATE_RATIO = new Decimal(0.7)          // 0.7 pâte par croissant
export const VENTE_CROISSANT_RATIO = new Decimal(1)         // 1 croissant → 1 × sellRate coins

// ─── Ordre de déblocage des bâtiments ───────────────────────────

export const BUILDING_ORDER: BuildingId[] = [
  'petrin',
  'fournil',
  'four_pro',
  'boutique',
  'laboratoire',
  'usine',
  'franchise',
  'empire',
]

// ─── Seuils de déblocage ─────────────────────────────────────────

export const BUILDING_UNLOCK_THRESHOLDS: Partial<Record<BuildingId, { resource: ResourceId; amount: Decimal }>> = {
  petrin:       { resource: 'pantins_coins', amount: new Decimal(5) },
  fournil:      { resource: 'pantins_coins', amount: new Decimal(5) },
  four_pro:     { resource: 'pantins_coins', amount: new Decimal(80) },
  boutique:     { resource: 'pantins_coins', amount: new Decimal(200) },
  laboratoire:  { resource: 'pantins_coins', amount: new Decimal(600) },
  usine:        { resource: 'pantins_coins', amount: new Decimal(4_000) },
  franchise:    { resource: 'pantins_coins', amount: new Decimal(20_000) },
  empire:       { resource: 'pantins_coins', amount: new Decimal(200_000) },
}

export const RESOURCE_UNLOCK_THRESHOLDS: Partial<Record<ResourceId, { resource: ResourceId; amount: Decimal }>> = {
  reputation: { resource: 'pantins_coins', amount: new Decimal(2_000) },
  etoiles:    { resource: 'pantins_coins', amount: new Decimal(1_000_000) },
}

// ─── Données des améliorations ───────────────────────────────────

export interface UpgradeData {
  id: string
  name: string
  description: string
  emoji: string
  cost: Decimal
  costResource: ResourceId
  effect: UpgradeEffect
  unlockCondition: UnlockCondition
}

export const UPGRADES_DATA: Record<string, UpgradeData> = {
  // ── Vitesse de fabrication ─────────────────────────────────────
  petrissage_rapide: {
    id: 'petrissage_rapide',
    name: 'Pétrissage rapide',
    description: 'Pétrissage 2× plus rapide',
    emoji: '⚡',
    cost: new Decimal(20),
    costResource: 'pantins_coins',
    effect: { type: 'crafting_speed', targetRecipe: 'petrissage', multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'pate', threshold: new Decimal(5) },
  },
  cuisson_rapide: {
    id: 'cuisson_rapide',
    name: 'Cuisson rapide',
    description: 'Cuisson 2× plus rapide',
    emoji: '⚡',
    cost: new Decimal(30),
    costResource: 'pantins_coins',
    effect: { type: 'crafting_speed', targetRecipe: 'cuisson', multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'croissants', threshold: new Decimal(10) },
  },

  // ── Améliorations de vente ─────────────────────────────────────
  meilleur_prix: {
    id: 'meilleur_prix',
    name: 'Meilleur prix',
    description: '×2 paintines coins par croissant vendu',
    emoji: '💰',
    cost: new Decimal(50),
    costResource: 'pantins_coins',
    effect: { type: 'sell_multiplier', multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'pantins_coins', threshold: new Decimal(30) },
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    description: '×3 paintines coins par croissant vendu',
    emoji: '📢',
    cost: new Decimal(2_000),
    costResource: 'pantins_coins',
    effect: { type: 'sell_multiplier', multiplier: new Decimal(3) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'pantins_coins', threshold: new Decimal(1_000) },
  },

  // ── Améliorations de bâtiments ─────────────────────────────────
  beurre_aop_1: {
    id: 'beurre_aop_1',
    name: 'Beurre AOP Charentes',
    description: '×2 production des pétrins',
    emoji: '🧈',
    cost: new Decimal(100),
    costResource: 'pantins_coins',
    effect: { type: 'building_multiplier', targetBuilding: 'petrin', multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: 'petrin', threshold: new Decimal(5) },
  },
  croissant_dore: {
    id: 'croissant_dore',
    name: 'Croissant bien doré',
    description: '×2 production des fournils',
    emoji: '✨',
    cost: new Decimal(150),
    costResource: 'pantins_coins',
    effect: { type: 'building_multiplier', targetBuilding: 'fournil', multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: 'fournil', threshold: new Decimal(5) },
  },
  four_turbo: {
    id: 'four_turbo',
    name: 'Four turbo',
    description: '×2 production du four pro',
    emoji: '🔥',
    cost: new Decimal(2_000),
    costResource: 'pantins_coins',
    effect: { type: 'building_multiplier', targetBuilding: 'four_pro', multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: 'four_pro', threshold: new Decimal(5) },
  },
  vitrine_refrigeree: {
    id: 'vitrine_refrigeree',
    name: 'Vitrine réfrigérée',
    description: '×2 ventes de la boutique',
    emoji: '🧊',
    cost: new Decimal(5_000),
    costResource: 'pantins_coins',
    effect: { type: 'building_multiplier', targetBuilding: 'boutique', multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: 'boutique', threshold: new Decimal(5) },
  },
  recette_secrete: {
    id: 'recette_secrete',
    name: 'Recette secrète',
    description: '×3 production du laboratoire',
    emoji: '📜',
    cost: new Decimal(15_000),
    costResource: 'pantins_coins',
    effect: { type: 'building_multiplier', targetBuilding: 'laboratoire', multiplier: new Decimal(3) },
    unlockCondition: { type: 'building_count', buildingId: 'laboratoire', threshold: new Decimal(5) },
  },

  // ── Améliorations globales ─────────────────────────────────────
  farine_tradition: {
    id: 'farine_tradition',
    name: 'Farine de tradition',
    description: '×1,5 production de tous les bâtiments',
    emoji: '🌾',
    cost: new Decimal(300),
    costResource: 'pantins_coins',
    effect: { type: 'global_multiplier', multiplier: new Decimal(1.5) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'pantins_coins', threshold: new Decimal(150) },
  },

  // ── Réductions de coût ─────────────────────────────────────────
  achat_en_gros: {
    id: 'achat_en_gros',
    name: 'Achat en gros',
    description: 'Bâtiments 15% moins chers',
    emoji: '📦',
    cost: new Decimal(500),
    costResource: 'pantins_coins',
    effect: { type: 'cost_reduction', multiplier: new Decimal(0.85) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'pantins_coins', threshold: new Decimal(250) },
  },
  negociation_fournisseurs: {
    id: 'negociation_fournisseurs',
    name: 'Négociation fournisseurs',
    description: 'Bâtiments 15% encore moins chers',
    emoji: '🤝',
    cost: new Decimal(10_000),
    costResource: 'pantins_coins',
    effect: { type: 'cost_reduction', multiplier: new Decimal(0.85) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'pantins_coins', threshold: new Decimal(5_000) },
  },

  // ── Réputation ─────────────────────────────────────────────────
  formation_mof: {
    id: 'formation_mof',
    name: 'Formation MOF',
    description: '×3 réputation générée',
    emoji: '🎓',
    cost: new Decimal(20_000),
    costResource: 'pantins_coins',
    effect: { type: 'resource_multiplier', targetResource: 'reputation', multiplier: new Decimal(3) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'reputation', threshold: new Decimal(20) },
  },
}

export const UPGRADE_ORDER: string[] = [
  'petrissage_rapide',
  'cuisson_rapide',
  'meilleur_prix',
  'beurre_aop_1',
  'croissant_dore',
  'farine_tradition',
  'achat_en_gros',
  'marketing',
  'four_turbo',
  'vitrine_refrigeree',
  'negociation_fournisseurs',
  'recette_secrete',
  'formation_mof',
]

// ─── Constantes de jeu ──────────────────────────────────────────

export const SAVE_KEY = 'croissant_idle_save'
export const AUTOSAVE_INTERVAL_MS = 30_000
export const MAX_OFFLINE_SECONDS = 8 * 60 * 60
export const PRESTIGE_THRESHOLD = new Decimal(1_000_000)
export const GAME_VERSION = 2
