import Decimal from 'decimal.js'
import { resourceId, buildingId, craftingRecipeId, upgradeId, PANTINS_COINS_ID } from '@/types'
import type { ProductBundle, ResourceData, BuildingData, CraftingRecipeData, UpgradeData, PipelineStageConfig } from '@/types'

// ─── Resource IDs ──────────────────────────────────────────────
const CHOCOLAT_NOIR = resourceId('chocolat_noir')
const CREME_FRAICHE = resourceId('creme_fraiche')
const PATE_BRIOCHEE = resourceId('pate_briochee')
const CHOCOLATINES = resourceId('chocolatines')

// ─── Building IDs ──────────────────────────────────────────────
const FONDOIR = buildingId('fondoir')
const BATTEUR_PRO = buildingId('batteur_pro')
const FOUR_A_SOLE = buildingId('four_a_sole')
const PATISSERIE = buildingId('patisserie')
const LABO_SAVEURS = buildingId('labo_saveurs')
const LIGNE_PRODUCTION = buildingId('ligne_production')
const RESEAU_PATISSERIES = buildingId('reseau_patisseries')
const EMPIRE_CHOCOLATINE = buildingId('empire_chocolatine')

// ─── Resources ─────────────────────────────────────────────────
const resources: Record<string, ResourceData> = {
  [CHOCOLAT_NOIR as string]: {
    id: CHOCOLAT_NOIR, name: 'Chocolat noir', emoji: '🍫',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(8), scope: 'chocolatines',
  },
  [CREME_FRAICHE as string]: {
    id: CREME_FRAICHE, name: 'Crème fraîche', emoji: '🥛',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(12), scope: 'chocolatines',
  },
  [PATE_BRIOCHEE as string]: {
    id: PATE_BRIOCHEE, name: 'Pâte briochée', emoji: '🫓',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'chocolatines',
  },
  [CHOCOLATINES as string]: {
    id: CHOCOLATINES, name: 'Chocolatines', emoji: '🤎',
    category: 'produit_fini', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'chocolatines',
  },
}

// ─── Buildings ─────────────────────────────────────────────────
const buildings: Record<string, BuildingData> = {
  [FONDOIR as string]: {
    id: FONDOIR, name: 'Fondoir', emoji: '🫕',
    description: 'Cuit la pâte briochée en chocolatines',
    baseCost: new Decimal(200), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.3),
    producedResource: CHOCOLATINES, pipelineRole: 'cuisson', scope: 'chocolatines',
  },
  [BATTEUR_PRO as string]: {
    id: BATTEUR_PRO, name: 'Batteur pro', emoji: '⚙️',
    description: 'Mélange chocolat noir et crème en pâte briochée',
    baseCost: new Decimal(400), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.4),
    producedResource: PATE_BRIOCHEE, pipelineRole: 'petrissage', scope: 'chocolatines',
  },
  [FOUR_A_SOLE as string]: {
    id: FOUR_A_SOLE, name: 'Four à sole', emoji: '🔥',
    description: 'Cuisson artisanale à haute température',
    baseCost: new Decimal(2_500), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(1.5),
    producedResource: CHOCOLATINES, pipelineRole: 'cuisson', scope: 'chocolatines',
  },
  [PATISSERIE as string]: {
    id: PATISSERIE, name: 'Pâtisserie', emoji: '🏪',
    description: 'Vend automatiquement les chocolatines',
    baseCost: new Decimal(7_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.8),
    producedResource: PANTINS_COINS_ID, pipelineRole: 'vente', scope: 'chocolatines',
  },
  [LABO_SAVEURS as string]: {
    id: LABO_SAVEURS, name: 'Labo saveurs', emoji: '🔬',
    description: 'Génère du chocolat noir et de la crème fraîche',
    baseCost: new Decimal(20_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(1.5),
    producedResource: CHOCOLAT_NOIR, pipelineRole: 'ingredients', scope: 'chocolatines',
  },
  [LIGNE_PRODUCTION as string]: {
    id: LIGNE_PRODUCTION, name: 'Ligne de production', emoji: '🏭',
    description: 'Production automatisée complète',
    baseCost: new Decimal(150_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(4),
    producedResource: CHOCOLATINES, pipelineRole: 'full_pipeline', scope: 'chocolatines',
  },
  [RESEAU_PATISSERIES as string]: {
    id: RESEAU_PATISSERIES, name: 'Réseau pâtisseries', emoji: '🗺️',
    description: 'Réseau national de pâtisseries',
    baseCost: new Decimal(750_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(8),
    producedResource: PANTINS_COINS_ID, pipelineRole: 'vente', scope: 'chocolatines',
  },
  [EMPIRE_CHOCOLATINE as string]: {
    id: EMPIRE_CHOCOLATINE, name: 'Empire chocolatine', emoji: '🌍',
    description: 'Domination mondiale de la chocolatine',
    baseCost: new Decimal(7_500_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(40),
    producedResource: CHOCOLATINES, pipelineRole: 'full_pipeline', scope: 'chocolatines',
  },
}

// ─── Pipeline config ───────────────────────────────────────────
const pipelineConfig: { stages: PipelineStageConfig[] } = {
  stages: [
    {
      role: 'petrissage',
      consumes: [
        { resource: CHOCOLAT_NOIR, ratio: new Decimal(1.2) },
        { resource: CREME_FRAICHE, ratio: new Decimal(1) },
      ],
      produces: [
        { resource: PATE_BRIOCHEE, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'cuisson',
      consumes: [
        { resource: PATE_BRIOCHEE, ratio: new Decimal(0.8) },
      ],
      produces: [
        { resource: CHOCOLATINES, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'vente',
      consumes: [
        { resource: CHOCOLATINES, ratio: new Decimal(1) },
      ],
      produces: [
        { resource: PANTINS_COINS_ID, ratio: new Decimal(1) },
      ],
      freeProduces: [
        { resource: resourceId('reputation'), ratio: new Decimal(0.15) },
      ],
    },
  ],
}

// ─── Crafting recipes ──────────────────────────────────────────
const PETRISSAGE_CHOCOLATINE = craftingRecipeId('petrissage_chocolatine')
const CUISSON_CHOCOLATINE = craftingRecipeId('cuisson_chocolatine')

const craftingRecipes: Record<string, CraftingRecipeData> = {
  [PETRISSAGE_CHOCOLATINE as string]: {
    id: PETRISSAGE_CHOCOLATINE, name: 'Pétrissage', emoji: '🤲',
    verb: 'Pétrir',
    inputs: [
      { resource: CHOCOLAT_NOIR, amount: new Decimal(4) },
      { resource: CREME_FRAICHE, amount: new Decimal(3) },
    ],
    output: { resource: PATE_BRIOCHEE, amount: new Decimal(2) },
    durationSeconds: 5,
    scope: 'chocolatines',
  },
  [CUISSON_CHOCOLATINE as string]: {
    id: CUISSON_CHOCOLATINE, name: 'Cuisson', emoji: '🔥',
    verb: 'Cuire',
    inputs: [
      { resource: PATE_BRIOCHEE, amount: new Decimal(2) },
    ],
    output: { resource: CHOCOLATINES, amount: new Decimal(3) },
    durationSeconds: 7,
    scope: 'chocolatines',
  },
}

// ─── Upgrades ──────────────────────────────────────────────────
const upgrades: Record<string, UpgradeData> = {
  choco_petrissage_rapide: {
    id: upgradeId('choco_petrissage_rapide'), name: 'Pétrissage rapide (Choco)',
    description: 'Pétrissage 2x plus rapide', emoji: '⚡',
    cost: new Decimal(3_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: PETRISSAGE_CHOCOLATINE, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PATE_BRIOCHEE, threshold: new Decimal(5) },
    scope: 'chocolatines',
  },
  choco_cuisson_rapide: {
    id: upgradeId('choco_cuisson_rapide'), name: 'Cuisson rapide (Choco)',
    description: 'Cuisson 2x plus rapide', emoji: '⚡',
    cost: new Decimal(5_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: CUISSON_CHOCOLATINE, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: CHOCOLATINES, threshold: new Decimal(10) },
    scope: 'chocolatines',
  },
  choco_meilleur_prix: {
    id: upgradeId('choco_meilleur_prix'), name: 'Label artisanal',
    description: 'x2 prix de vente des chocolatines', emoji: '💰',
    cost: new Decimal(8_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'sell_multiplier', multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(4_000) },
    scope: 'chocolatines',
  },
  choco_fondoir_boost: {
    id: upgradeId('choco_fondoir_boost'), name: 'Fondoir amélioré',
    description: 'x2 production du fondoir', emoji: '🫕',
    cost: new Decimal(10_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: FONDOIR, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: FONDOIR, threshold: new Decimal(5) },
    scope: 'chocolatines',
  },
  choco_batteur_boost: {
    id: upgradeId('choco_batteur_boost'), name: 'Batteur turbo',
    description: 'x2 production du batteur pro', emoji: '⚙️',
    cost: new Decimal(15_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: BATTEUR_PRO, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: BATTEUR_PRO, threshold: new Decimal(5) },
    scope: 'chocolatines',
  },
  choco_global: {
    id: upgradeId('choco_global'), name: 'Recette du Sud-Ouest',
    description: 'x1,5 production de tous les bâtiments', emoji: '🌾',
    cost: new Decimal(20_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'global_multiplier', multiplier: new Decimal(1.5) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(10_000) },
    scope: 'chocolatines',
  },
  choco_achat_en_gros: {
    id: upgradeId('choco_achat_en_gros'), name: 'Approvisionnement en gros',
    description: 'Bâtiments 15% moins chers', emoji: '📦',
    cost: new Decimal(30_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'cost_reduction', multiplier: new Decimal(0.85) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(15_000) },
    scope: 'chocolatines',
  },
}

// ─── Bundle ────────────────────────────────────────────────────

export const CHOCOLATINES_BUNDLE: ProductBundle = {
  definition: {
    id: 'chocolatines',
    name: 'Chocolatines',
    emoji: '🤎',
    color: 'yellow',
    unlockCondition: { resource: PANTINS_COINS_ID, amount: new Decimal(500_000) },
  },
  resources,
  buildings,
  buildingOrder: [BATTEUR_PRO, FONDOIR, FOUR_A_SOLE, PATISSERIE, LABO_SAVEURS, LIGNE_PRODUCTION, RESEAU_PATISSERIES, EMPIRE_CHOCOLATINE],
  buildingUnlockThresholds: {
    [BATTEUR_PRO as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(100) },
    [FONDOIR as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(100) },
    [FOUR_A_SOLE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(1_000) },
    [PATISSERIE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(3_000) },
    [LABO_SAVEURS as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(8_000) },
    [LIGNE_PRODUCTION as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(60_000) },
    [RESEAU_PATISSERIES as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(300_000) },
    [EMPIRE_CHOCOLATINE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(3_000_000) },
  },
  craftingRecipes,
  craftingOrder: [PETRISSAGE_CHOCOLATINE, CUISSON_CHOCOLATINE],
  upgrades,
  upgradeOrder: [
    upgradeId('choco_petrissage_rapide'),
    upgradeId('choco_cuisson_rapide'),
    upgradeId('choco_meilleur_prix'),
    upgradeId('choco_fondoir_boost'),
    upgradeId('choco_batteur_boost'),
    upgradeId('choco_global'),
    upgradeId('choco_achat_en_gros'),
  ],
  pipelineConfig,
  passiveRegen: {
    [CHOCOLAT_NOIR as string]: new Decimal(0.15),
    [CREME_FRAICHE as string]: new Decimal(0.22),
  },
  finishedProductId: CHOCOLATINES,
  baseSellRate: new Decimal(2.5),
}
