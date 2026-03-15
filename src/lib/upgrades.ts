import Decimal from 'decimal.js'
import type { ResourceId, UpgradeEffect, UnlockCondition } from '@/types'

// ─── Types ──────────────────────────────────────────────────────

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

// ─── Données des améliorations ──────────────────────────────────

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
