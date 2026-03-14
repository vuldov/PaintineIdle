import Decimal from 'decimal.js'
import type { BuildingId, ResourceId, UpgradeEffect, UnlockCondition } from '@/types'

// ─── Données de base des bâtiments ──────────────────────────────

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
}

export const BUILDINGS_DATA: Record<BuildingId, BuildingData> = {
  fournil: {
    id: 'fournil',
    name: 'Fournil',
    emoji: '🏠',
    description: 'Boulanger artisanal, produit des croissants à la main',
    baseCost: new Decimal(10),
    costResource: 'croissants',
    costMultiplier: 1.15,
    baseProduction: new Decimal(1),
    producedResource: 'croissants',
  },
  petrin: {
    id: 'petrin',
    name: 'Pétrin mécanique',
    emoji: '⚙️',
    description: 'Automatise le pétrissage de la pâte — produit aussi de la farine',
    baseCost: new Decimal(75),
    costResource: 'croissants',
    costMultiplier: 1.15,
    baseProduction: new Decimal(5),
    producedResource: 'croissants',
  },
  four_pro: {
    id: 'four_pro',
    name: 'Four professionnel',
    emoji: '🔥',
    description: 'Cuit plus vite, améliore la qualité — consomme du beurre',
    baseCost: new Decimal(500),
    costResource: 'croissants',
    costMultiplier: 1.15,
    baseProduction: new Decimal(20),
    producedResource: 'croissants',
  },
  boutique: {
    id: 'boutique',
    name: 'Boutique',
    emoji: '🏪',
    description: 'Vend les croissants, génère de la réputation',
    baseCost: new Decimal(5_000),
    costResource: 'croissants',
    costMultiplier: 1.15,
    baseProduction: new Decimal(80),
    producedResource: 'croissants',
  },
  laboratoire: {
    id: 'laboratoire',
    name: 'Laboratoire pâtissier',
    emoji: '🔬',
    description: 'Recherche de nouvelles recettes',
    baseCost: new Decimal(50_000),
    costResource: 'croissants',
    costMultiplier: 1.15,
    baseProduction: new Decimal(400),
    producedResource: 'croissants',
  },
  usine: {
    id: 'usine',
    name: 'Usine viennoiserie',
    emoji: '🏭',
    description: 'Production industrielle à grande échelle',
    baseCost: new Decimal(500_000),
    costResource: 'croissants',
    costMultiplier: 1.15,
    baseProduction: new Decimal(2_500),
    producedResource: 'croissants',
  },
  franchise: {
    id: 'franchise',
    name: 'Franchise nationale',
    emoji: '🗺️',
    description: 'Réseau de boutiques dans toute la France',
    baseCost: new Decimal(10_000_000),
    costResource: 'croissants',
    costMultiplier: 1.15,
    baseProduction: new Decimal(15_000),
    producedResource: 'croissants',
  },
  empire: {
    id: 'empire',
    name: 'Empire mondial',
    emoji: '🌍',
    description: 'Domination mondiale de la viennoiserie',
    baseCost: new Decimal(250_000_000),
    costResource: 'croissants',
    costMultiplier: 1.15,
    baseProduction: new Decimal(100_000),
    producedResource: 'croissants',
  },
}

// ─── Production secondaire des bâtiments ─────────────────────────
// Certains bâtiments produisent aussi des ressources secondaires

export interface SecondaryProduction {
  resource: ResourceId
  perBuilding: Decimal
}

export const SECONDARY_PRODUCTION: Partial<Record<BuildingId, SecondaryProduction[]>> = {
  petrin: [
    { resource: 'farine', perBuilding: new Decimal(0.3) },
  ],
  four_pro: [
    { resource: 'beurre', perBuilding: new Decimal(0.5) },
  ],
  boutique: [
    { resource: 'reputation', perBuilding: new Decimal(0.2) },
  ],
  laboratoire: [
    { resource: 'beurre', perBuilding: new Decimal(1) },
    { resource: 'farine', perBuilding: new Decimal(1) },
  ],
  franchise: [
    { resource: 'reputation', perBuilding: new Decimal(5) },
  ],
  empire: [
    { resource: 'reputation', perBuilding: new Decimal(50) },
  ],
}

// ─── Seuils de déblocage des ressources ──────────────────────────

export const RESOURCE_UNLOCK_THRESHOLDS: Partial<Record<ResourceId, { resource: ResourceId; amount: Decimal }>> = {
  beurre:     { resource: 'croissants', amount: new Decimal(50) },
  farine:     { resource: 'croissants', amount: new Decimal(50) },
  reputation: { resource: 'croissants', amount: new Decimal(2_000) },
  etoiles:    { resource: 'croissants', amount: new Decimal(1_000_000) },
}

// ─── Données de base des ressources ─────────────────────────────

export type ResourceCategory = 'produit_fini' | 'ingredient' | 'meta'

export interface ResourceData {
  id: ResourceId
  name: string
  emoji: string
  category: ResourceCategory
  initiallyUnlocked: boolean
}

export const RESOURCES_DATA: Record<ResourceId, ResourceData> = {
  croissants: {
    id: 'croissants',
    name: 'Croissants',
    emoji: '🥐',
    category: 'produit_fini',
    initiallyUnlocked: true,
  },
  beurre: {
    id: 'beurre',
    name: 'Beurre',
    emoji: '🧈',
    category: 'ingredient',
    initiallyUnlocked: false,
  },
  farine: {
    id: 'farine',
    name: 'Farine',
    emoji: '🌾',
    category: 'ingredient',
    initiallyUnlocked: false,
  },
  reputation: {
    id: 'reputation',
    name: 'Réputation',
    emoji: '⭐',
    category: 'meta',
    initiallyUnlocked: false,
  },
  etoiles: {
    id: 'etoiles',
    name: 'Étoiles Michelin',
    emoji: '⭐',
    category: 'meta',
    initiallyUnlocked: false,
  },
}

// ─── Ordre de déblocage des bâtiments ───────────────────────────

export const BUILDING_ORDER: BuildingId[] = [
  'fournil',
  'petrin',
  'four_pro',
  'boutique',
  'laboratoire',
  'usine',
  'franchise',
  'empire',
]

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
  // ── Améliorations de clic ──────────────────────────────────────
  meilleur_rouleau: {
    id: 'meilleur_rouleau',
    name: 'Meilleur rouleau',
    description: '×2 croissants par clic',
    emoji: '🪵',
    cost: new Decimal(50),
    costResource: 'croissants',
    effect: { type: 'click_multiplier', multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'croissants', threshold: new Decimal(25) },
  },
  technique_feuilletage: {
    id: 'technique_feuilletage',
    name: 'Technique de feuilletage',
    description: '×3 croissants par clic',
    emoji: '🤌',
    cost: new Decimal(500),
    costResource: 'croissants',
    effect: { type: 'click_multiplier', multiplier: new Decimal(3) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'croissants', threshold: new Decimal(200) },
  },
  mains_en_or: {
    id: 'mains_en_or',
    name: 'Mains en or',
    description: '×5 croissants par clic',
    emoji: '✋',
    cost: new Decimal(10_000),
    costResource: 'croissants',
    effect: { type: 'click_multiplier', multiplier: new Decimal(5) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'croissants', threshold: new Decimal(5_000) },
  },

  // ── Améliorations de bâtiments ─────────────────────────────────
  beurre_aop_1: {
    id: 'beurre_aop_1',
    name: 'Beurre AOP Charentes',
    description: '×2 production du fournil',
    emoji: '🧈',
    cost: new Decimal(100),
    costResource: 'croissants',
    effect: { type: 'building_multiplier', targetBuilding: 'fournil', multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: 'fournil', threshold: new Decimal(5) },
  },
  levure_fraiche: {
    id: 'levure_fraiche',
    name: 'Levure fraîche',
    description: '×2 production du pétrin',
    emoji: '🫧',
    cost: new Decimal(750),
    costResource: 'croissants',
    effect: { type: 'building_multiplier', targetBuilding: 'petrin', multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: 'petrin', threshold: new Decimal(5) },
  },
  croissant_dore: {
    id: 'croissant_dore',
    name: 'Croissant bien doré',
    description: '×2 production du four pro',
    emoji: '✨',
    cost: new Decimal(5_000),
    costResource: 'croissants',
    effect: { type: 'building_multiplier', targetBuilding: 'four_pro', multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: 'four_pro', threshold: new Decimal(5) },
  },
  vitrine_refrigeree: {
    id: 'vitrine_refrigeree',
    name: 'Vitrine réfrigérée',
    description: '×2 production de la boutique',
    emoji: '🧊',
    cost: new Decimal(50_000),
    costResource: 'croissants',
    effect: { type: 'building_multiplier', targetBuilding: 'boutique', multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: 'boutique', threshold: new Decimal(5) },
  },
  recette_secrete: {
    id: 'recette_secrete',
    name: 'Recette secrète',
    description: '×3 production du laboratoire',
    emoji: '📜',
    cost: new Decimal(500_000),
    costResource: 'croissants',
    effect: { type: 'building_multiplier', targetBuilding: 'laboratoire', multiplier: new Decimal(3) },
    unlockCondition: { type: 'building_count', buildingId: 'laboratoire', threshold: new Decimal(5) },
  },
  chaine_montage: {
    id: 'chaine_montage',
    name: 'Chaîne de montage',
    description: '×2 production de l\'usine',
    emoji: '🔧',
    cost: new Decimal(5_000_000),
    costResource: 'croissants',
    effect: { type: 'building_multiplier', targetBuilding: 'usine', multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: 'usine', threshold: new Decimal(5) },
  },

  // ── Améliorations globales ─────────────────────────────────────
  farine_tradition: {
    id: 'farine_tradition',
    name: 'Farine de tradition',
    description: '×1,5 production de tous les bâtiments',
    emoji: '🌾',
    cost: new Decimal(200),
    costResource: 'farine',
    effect: { type: 'global_multiplier', multiplier: new Decimal(1.5) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'farine', threshold: new Decimal(100) },
  },
  beurre_aop_2: {
    id: 'beurre_aop_2',
    name: 'Beurre AOP premium',
    description: '×1,5 production de tous les bâtiments',
    emoji: '🧈',
    cost: new Decimal(200),
    costResource: 'beurre',
    effect: { type: 'global_multiplier', multiplier: new Decimal(1.5) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'beurre', threshold: new Decimal(100) },
  },
  formation_mof: {
    id: 'formation_mof',
    name: 'Formation MOF',
    description: '×3 réputation générée',
    emoji: '🎓',
    cost: new Decimal(10_000),
    costResource: 'croissants',
    effect: { type: 'resource_multiplier', targetResource: 'reputation', multiplier: new Decimal(3) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'reputation', threshold: new Decimal(20) },
  },

  // ── Réductions de coût ─────────────────────────────────────────
  achat_en_gros: {
    id: 'achat_en_gros',
    name: 'Achat en gros',
    description: 'Bâtiments 10% moins chers',
    emoji: '📦',
    cost: new Decimal(2_000),
    costResource: 'croissants',
    effect: { type: 'cost_reduction', multiplier: new Decimal(0.9) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'croissants', threshold: new Decimal(1_000) },
  },
  negociation_fournisseurs: {
    id: 'negociation_fournisseurs',
    name: 'Négociation fournisseurs',
    description: 'Bâtiments 15% moins chers',
    emoji: '🤝',
    cost: new Decimal(50_000),
    costResource: 'croissants',
    effect: { type: 'cost_reduction', multiplier: new Decimal(0.85) },
    unlockCondition: { type: 'resource_threshold', resourceId: 'croissants', threshold: new Decimal(20_000) },
  },
}

export const UPGRADE_ORDER: string[] = [
  'meilleur_rouleau',
  'beurre_aop_1',
  'technique_feuilletage',
  'levure_fraiche',
  'farine_tradition',
  'beurre_aop_2',
  'croissant_dore',
  'achat_en_gros',
  'vitrine_refrigeree',
  'formation_mof',
  'mains_en_or',
  'recette_secrete',
  'negociation_fournisseurs',
  'chaine_montage',
]

// ─── Constantes de jeu ──────────────────────────────────────────

export const BASE_CLICK_POWER = new Decimal(3)
export const SAVE_KEY = 'croissant_idle_save'
export const AUTOSAVE_INTERVAL_MS = 30_000
export const MAX_OFFLINE_SECONDS = 8 * 60 * 60 // 8 heures
export const PRESTIGE_THRESHOLD = new Decimal(1_000_000)
export const GAME_VERSION = 1
