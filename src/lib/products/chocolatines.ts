import Decimal from 'decimal.js'
import { resourceId, buildingId, craftingRecipeId, upgradeId, supplierId, supplierUpgradeId, PANTINS_COINS_ID } from '@/types'
import type { ProductBundle, ResourceData, BuildingData, CraftingRecipeData, UpgradeData, PipelineStageConfig, SupplierData, SupplierUpgradeData } from '@/types'

// ─── Resource IDs ──────────────────────────────────────────────
const CHOCOLAT_NOIR = resourceId('chocolat_noir')
const CREME_FRAICHE = resourceId('creme_fraiche')
const SUCRE_VANILLE = resourceId('sucre_vanille')
const OEUF_DORE = resourceId('oeuf_dore')
const PATE_BRIOCHEE = resourceId('pate_briochee')
const PATON_CHOCOLATINE = resourceId('paton_chocolatine')
const CHOCOLATINE_DOREE = resourceId('chocolatine_doree')
const CHOCOLATINES = resourceId('chocolatines')

// ─── Building IDs ──────────────────────────────────────────────
const FONDOIR = buildingId('fondoir')
const BATTEUR_PRO = buildingId('batteur_pro')
const GARNISSEUR_CHOCO = buildingId('garnisseur_choco')
const DOREUSE = buildingId('doreuse')
const FOUR_A_SOLE = buildingId('four_a_sole')
const PATISSERIE = buildingId('patisserie')

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
  [SUCRE_VANILLE as string]: {
    id: SUCRE_VANILLE, name: 'Sucre vanillé', emoji: '🍬',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(10), scope: 'chocolatines',
  },
  [OEUF_DORE as string]: {
    id: OEUF_DORE, name: 'Oeuf doré', emoji: '🥚',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(6), scope: 'chocolatines',
  },
  [PATE_BRIOCHEE as string]: {
    id: PATE_BRIOCHEE, name: 'Pâte briochée', emoji: '🫓',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'chocolatines',
  },
  [PATON_CHOCOLATINE as string]: {
    id: PATON_CHOCOLATINE, name: 'Pâton chocolatine', emoji: '🟫',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'chocolatines',
  },
  [CHOCOLATINE_DOREE as string]: {
    id: CHOCOLATINE_DOREE, name: 'Chocolatine dorée', emoji: '✨',
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
  [BATTEUR_PRO as string]: {
    id: BATTEUR_PRO, name: 'Batteur pro', emoji: '⚙️',
    description: 'Mélange crème fraîche et sucre vanillé en pâte briochée',
    baseCost: new Decimal(200), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.4),
    producedResource: PATE_BRIOCHEE, pipelineRole: 'petrissage', scope: 'chocolatines',
    aura: {
      effectType: 'crafting_speed_bonus', bonusPerBuilding: new Decimal(0.02),
      description: '+2% vitesse pétrissage globale par batteur pro',
    },
  },
  [FONDOIR as string]: {
    id: FONDOIR, name: 'Fondoir', emoji: '🫕',
    description: 'Fait fondre le chocolat noir dans la pâte briochée',
    baseCost: new Decimal(400), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.3),
    producedResource: PATON_CHOCOLATINE, pipelineRole: 'garnissage', scope: 'chocolatines',
    aura: {
      effectType: 'ingredient_generation_bonus', bonusPerBuilding: new Decimal(0.05),
      targetResource: 'chocolat_noir', description: '+5% génération chocolat noir par fondoir',
    },
  },
  [GARNISSEUR_CHOCO as string]: {
    id: GARNISSEUR_CHOCO, name: 'Garnisseur choco', emoji: '🤲',
    description: 'Garnissage professionnel à haute cadence',
    baseCost: new Decimal(1_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.8),
    producedResource: PATON_CHOCOLATINE, pipelineRole: 'garnissage', scope: 'chocolatines',
    aura: {
      effectType: 'ingredient_generation_bonus', bonusPerBuilding: new Decimal(0.03),
      targetResource: 'sucre_vanille', description: '+3% génération sucre vanillé par garnisseur choco',
    },
  },
  [DOREUSE as string]: {
    id: DOREUSE, name: 'Doreuse', emoji: '🌟',
    description: 'Applique la dorure à l\'oeuf sur les pâtons',
    baseCost: new Decimal(2_500), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.6),
    producedResource: CHOCOLATINE_DOREE, pipelineRole: 'dorure', scope: 'chocolatines',
    aura: {
      effectType: 'ingredient_generation_bonus', bonusPerBuilding: new Decimal(0.04),
      targetResource: 'oeuf_dore', description: '+4% génération oeuf doré par doreuse',
    },
  },
  [FOUR_A_SOLE as string]: {
    id: FOUR_A_SOLE, name: 'Four à sole', emoji: '🔥',
    description: 'Cuisson artisanale à haute température',
    baseCost: new Decimal(5_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(1.5),
    producedResource: CHOCOLATINES, pipelineRole: 'cuisson', scope: 'chocolatines',
    aura: {
      effectType: 'sell_price_bonus', bonusPerBuilding: new Decimal(0.02),
      targetProduct: 'chocolatines', description: '+2% prix de vente chocolatines par four à sole',
    },
  },
  [PATISSERIE as string]: {
    id: PATISSERIE, name: 'Pâtisserie', emoji: '🏪',
    description: 'Vend automatiquement les chocolatines',
    baseCost: new Decimal(10_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.8),
    producedResource: PANTINS_COINS_ID, pipelineRole: 'vente', scope: 'chocolatines',
    aura: {
      effectType: 'sell_price_bonus', bonusPerBuilding: new Decimal(0.01),
      description: '+1% prix de vente tous produits par pâtisserie',
    },
  },
[LIGNE_PRODUCTION as string]: {
    id: LIGNE_PRODUCTION, name: 'Ligne de production', emoji: '🏭',
    description: 'Production automatisée complète',
    baseCost: new Decimal(150_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(4),
    producedResource: CHOCOLATINES, pipelineRole: 'full_pipeline', scope: 'chocolatines',
    aura: {
      effectType: 'cross_product_bonus', bonusPerBuilding: new Decimal(0.02),
      crossProductTarget: 'pains_au_chocolat', description: '+2% production pains au chocolat par ligne de production',
    },
  },
  [RESEAU_PATISSERIES as string]: {
    id: RESEAU_PATISSERIES, name: 'Réseau pâtisseries', emoji: '🗺️',
    description: 'Réseau national de pâtisseries',
    baseCost: new Decimal(750_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(8),
    producedResource: PANTINS_COINS_ID, pipelineRole: 'vente', scope: 'chocolatines',
    aura: {
      effectType: 'sell_price_bonus', bonusPerBuilding: new Decimal(0.01),
      targetProduct: 'chocolatines', description: '+1% prix de vente chocolatines par réseau pâtisseries',
    },
  },
  [EMPIRE_CHOCOLATINE as string]: {
    id: EMPIRE_CHOCOLATINE, name: 'Empire chocolatine', emoji: '🌍',
    description: 'Domination mondiale de la chocolatine',
    baseCost: new Decimal(7_500_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(40),
    producedResource: CHOCOLATINES, pipelineRole: 'full_pipeline', scope: 'chocolatines',
    aura: {
      effectType: 'global_production_bonus', bonusPerBuilding: new Decimal(0.005),
      description: '+0,5% production globale par empire chocolatine',
    },
  },
}

// ─── Pipeline config ───────────────────────────────────────────
//  Pétrissage: crème fraîche + sucre vanillé → pâte briochée
//  Garnissage: pâte briochée + chocolat noir → pâton chocolatine
//  Dorure:     pâton chocolatine + oeuf doré → chocolatine dorée
//  Cuisson:    chocolatine dorée → chocolatines
//  Vente:      chocolatines → coins
const pipelineConfig: { stages: PipelineStageConfig[] } = {
  stages: [
    {
      role: 'petrissage',
      consumes: [
        { resource: CREME_FRAICHE, ratio: new Decimal(1) },
        { resource: SUCRE_VANILLE, ratio: new Decimal(0.8) },
      ],
      produces: [
        { resource: PATE_BRIOCHEE, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'garnissage',
      consumes: [
        { resource: PATE_BRIOCHEE, ratio: new Decimal(0.8) },
        { resource: CHOCOLAT_NOIR, ratio: new Decimal(1.2) },
      ],
      produces: [
        { resource: PATON_CHOCOLATINE, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'dorure',
      consumes: [
        { resource: PATON_CHOCOLATINE, ratio: new Decimal(0.8) },
        { resource: OEUF_DORE, ratio: new Decimal(0.5) },
      ],
      produces: [
        { resource: CHOCOLATINE_DOREE, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'cuisson',
      consumes: [
        { resource: CHOCOLATINE_DOREE, ratio: new Decimal(0.8) },
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
    },
  ],
}

// ─── Crafting recipes ──────────────────────────────────────────
const PETRISSAGE_CHOCOLATINE = craftingRecipeId('petrissage_chocolatine')
const GARNISSAGE_CHOCOLATINE = craftingRecipeId('garnissage_chocolatine')
const DORURE_CHOCOLATINE = craftingRecipeId('dorure_chocolatine')
const CUISSON_CHOCOLATINE = craftingRecipeId('cuisson_chocolatine')

const craftingRecipes: Record<string, CraftingRecipeData> = {
  [PETRISSAGE_CHOCOLATINE as string]: {
    id: PETRISSAGE_CHOCOLATINE, name: 'Pétrissage', emoji: '🤲',
    verb: 'Pétrir',
    inputs: [
      { resource: CREME_FRAICHE, amount: new Decimal(3) },
      { resource: SUCRE_VANILLE, amount: new Decimal(2) },
    ],
    output: { resource: PATE_BRIOCHEE, amount: new Decimal(2) },
    durationSeconds: 5,
    scope: 'chocolatines',
  },
  [GARNISSAGE_CHOCOLATINE as string]: {
    id: GARNISSAGE_CHOCOLATINE, name: 'Garnissage', emoji: '🍫',
    verb: 'Garnir',
    inputs: [
      { resource: PATE_BRIOCHEE, amount: new Decimal(2) },
      { resource: CHOCOLAT_NOIR, amount: new Decimal(3) },
    ],
    output: { resource: PATON_CHOCOLATINE, amount: new Decimal(2) },
    durationSeconds: 4,
    scope: 'chocolatines',
  },
  [DORURE_CHOCOLATINE as string]: {
    id: DORURE_CHOCOLATINE, name: 'Dorure', emoji: '🌟',
    verb: 'Dorer',
    inputs: [
      { resource: PATON_CHOCOLATINE, amount: new Decimal(2) },
      { resource: OEUF_DORE, amount: new Decimal(1) },
    ],
    output: { resource: CHOCOLATINE_DOREE, amount: new Decimal(2) },
    durationSeconds: 3,
    scope: 'chocolatines',
  },
  [CUISSON_CHOCOLATINE as string]: {
    id: CUISSON_CHOCOLATINE, name: 'Cuisson', emoji: '🔥',
    verb: 'Cuire',
    inputs: [
      { resource: CHOCOLATINE_DOREE, amount: new Decimal(2) },
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
  choco_garnissage_rapide: {
    id: upgradeId('choco_garnissage_rapide'), name: 'Garnissage rapide (Choco)',
    description: 'Garnissage 2x plus rapide', emoji: '⚡',
    cost: new Decimal(4_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: GARNISSAGE_CHOCOLATINE, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PATON_CHOCOLATINE, threshold: new Decimal(5) },
    scope: 'chocolatines',
  },
  choco_dorure_rapide: {
    id: upgradeId('choco_dorure_rapide'), name: 'Dorure rapide (Choco)',
    description: 'Dorure 2x plus rapide', emoji: '⚡',
    cost: new Decimal(4_500), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: DORURE_CHOCOLATINE, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: CHOCOLATINE_DOREE, threshold: new Decimal(5) },
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
  choco_doreuse_boost: {
    id: upgradeId('choco_doreuse_boost'), name: 'Doreuse automatique',
    description: 'x2 production de la doreuse', emoji: '🌟',
    cost: new Decimal(12_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: DOREUSE, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: DOREUSE, threshold: new Decimal(5) },
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

// ─── Suppliers (1 per ingredient) ────────────────────────────
const MAITRE_CHOCOLATIER = supplierId('maitre_chocolatier')
const FERME_LAITIERE = supplierId('ferme_laitiere')
const PLANTATION_VANILLE = supplierId('plantation_vanille')
const ELEVAGE_POULES = supplierId('elevage_poules')

const suppliers: Record<string, SupplierData> = {
  [MAITRE_CHOCOLATIER as string]: {
    id: MAITRE_CHOCOLATIER, name: 'Maitre chocolatier', emoji: '🍫',
    description: 'Chocolat noir grand cru d\'un artisan renomme',
    producedResource: CHOCOLAT_NOIR,
    baseMaxRate: new Decimal(2), baseCostPerSecond: new Decimal(50),
    contractCost: new Decimal(5_000), scope: 'chocolatines',
  },
  [FERME_LAITIERE as string]: {
    id: FERME_LAITIERE, name: 'Ferme laitiere', emoji: '🥛',
    description: 'Creme fraiche bio directement de la ferme',
    producedResource: CREME_FRAICHE,
    baseMaxRate: new Decimal(3), baseCostPerSecond: new Decimal(40),
    contractCost: new Decimal(4_000), scope: 'chocolatines',
  },
  [PLANTATION_VANILLE as string]: {
    id: PLANTATION_VANILLE, name: 'Plantation vanille', emoji: '🌱',
    description: 'Sucre vanille de Madagascar, qualite exceptionnelle',
    producedResource: SUCRE_VANILLE,
    baseMaxRate: new Decimal(2.5), baseCostPerSecond: new Decimal(45),
    contractCost: new Decimal(4_500), scope: 'chocolatines',
  },
  [ELEVAGE_POULES as string]: {
    id: ELEVAGE_POULES, name: 'Elevage de poules', emoji: '🥚',
    description: 'Oeufs frais de plein air pour la dorure',
    producedResource: OEUF_DORE,
    baseMaxRate: new Decimal(1.5), baseCostPerSecond: new Decimal(35),
    contractCost: new Decimal(3_500), scope: 'chocolatines',
  },
}

// ─── Supplier upgrades (inline) ──────────────────────────────
const supplierUpgrades: Record<string, SupplierUpgradeData> = {
  // ── Maitre chocolatier (baseCost=10, costGrowth=1.8, costResource=PATON_CHOCOLATINE) ──
  [supplierUpgradeId('maitre_chocolatier_rate_1') as string]: {
    id: supplierUpgradeId('maitre_chocolatier_rate_1'),
    name: 'Plantation cacao', emoji: '🍫',
    description: 'x3 debit max - Maitre chocolatier',
    targetSupplier: MAITRE_CHOCOLATIER,
    cost: new Decimal(10), costResource: PATON_CHOCOLATINE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('maitre_chocolatier_cost_1') as string]: {
    id: supplierUpgradeId('maitre_chocolatier_cost_1'),
    name: 'Contrat chocolatier', emoji: '🍫',
    description: 'x0,8 cout - Maitre chocolatier',
    targetSupplier: MAITRE_CHOCOLATIER,
    cost: new Decimal(18), costResource: PATON_CHOCOLATINE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('maitre_chocolatier_rate_2') as string]: {
    id: supplierUpgradeId('maitre_chocolatier_rate_2'),
    name: 'Plantation cacao II', emoji: '🍫',
    description: 'x3 debit max - Maitre chocolatier',
    targetSupplier: MAITRE_CHOCOLATIER,
    cost: new Decimal(32), costResource: PATON_CHOCOLATINE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('maitre_chocolatier_cost_2') as string]: {
    id: supplierUpgradeId('maitre_chocolatier_cost_2'),
    name: 'Contrat chocolatier II', emoji: '🍫',
    description: 'x0,8 cout - Maitre chocolatier',
    targetSupplier: MAITRE_CHOCOLATIER,
    cost: new Decimal(58), costResource: PATON_CHOCOLATINE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('maitre_chocolatier_rate_3') as string]: {
    id: supplierUpgradeId('maitre_chocolatier_rate_3'),
    name: 'Plantation cacao III', emoji: '🍫',
    description: 'x3 debit max - Maitre chocolatier',
    targetSupplier: MAITRE_CHOCOLATIER,
    cost: new Decimal(105), costResource: PATON_CHOCOLATINE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('maitre_chocolatier_cost_3') as string]: {
    id: supplierUpgradeId('maitre_chocolatier_cost_3'),
    name: 'Contrat chocolatier III', emoji: '🍫',
    description: 'x0,8 cout - Maitre chocolatier',
    targetSupplier: MAITRE_CHOCOLATIER,
    cost: new Decimal(189), costResource: PATON_CHOCOLATINE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('maitre_chocolatier_rate_4') as string]: {
    id: supplierUpgradeId('maitre_chocolatier_rate_4'),
    name: 'Plantation cacao IV', emoji: '🍫',
    description: 'x3 debit max - Maitre chocolatier',
    targetSupplier: MAITRE_CHOCOLATIER,
    cost: new Decimal(340), costResource: PATON_CHOCOLATINE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('maitre_chocolatier_cost_4') as string]: {
    id: supplierUpgradeId('maitre_chocolatier_cost_4'),
    name: 'Contrat chocolatier IV', emoji: '🍫',
    description: 'x0,8 cout - Maitre chocolatier',
    targetSupplier: MAITRE_CHOCOLATIER,
    cost: new Decimal(612), costResource: PATON_CHOCOLATINE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('maitre_chocolatier_rate_5') as string]: {
    id: supplierUpgradeId('maitre_chocolatier_rate_5'),
    name: 'Plantation cacao V', emoji: '🍫',
    description: 'x3 debit max - Maitre chocolatier',
    targetSupplier: MAITRE_CHOCOLATIER,
    cost: new Decimal(1102), costResource: PATON_CHOCOLATINE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('maitre_chocolatier_cost_5') as string]: {
    id: supplierUpgradeId('maitre_chocolatier_cost_5'),
    name: 'Contrat chocolatier V', emoji: '🍫',
    description: 'x0,8 cout - Maitre chocolatier',
    targetSupplier: MAITRE_CHOCOLATIER,
    cost: new Decimal(1984), costResource: PATON_CHOCOLATINE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('maitre_chocolatier_rate_6') as string]: {
    id: supplierUpgradeId('maitre_chocolatier_rate_6'),
    name: 'Plantation cacao VI', emoji: '🍫',
    description: 'Debit max fixe a 1 000/s - Maitre chocolatier',
    targetSupplier: MAITRE_CHOCOLATIER,
    cost: new Decimal(3570), costResource: PATON_CHOCOLATINE,
    effectType: 'set_max_rate', effectValue: new Decimal(1000),
    scope: 'chocolatines',
  },

  // ── Ferme laitiere (baseCost=12, costGrowth=1.8, costResource=PATE_BRIOCHEE) ──
  [supplierUpgradeId('ferme_laitiere_rate_1') as string]: {
    id: supplierUpgradeId('ferme_laitiere_rate_1'),
    name: 'Paturages bio', emoji: '🥛',
    description: 'x3 debit max - Ferme laitiere',
    targetSupplier: FERME_LAITIERE,
    cost: new Decimal(12), costResource: PATE_BRIOCHEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('ferme_laitiere_cost_1') as string]: {
    id: supplierUpgradeId('ferme_laitiere_cost_1'),
    name: 'Contrat laitier', emoji: '🥛',
    description: 'x0,8 cout - Ferme laitiere',
    targetSupplier: FERME_LAITIERE,
    cost: new Decimal(22), costResource: PATE_BRIOCHEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('ferme_laitiere_rate_2') as string]: {
    id: supplierUpgradeId('ferme_laitiere_rate_2'),
    name: 'Paturages bio II', emoji: '🥛',
    description: 'x3 debit max - Ferme laitiere',
    targetSupplier: FERME_LAITIERE,
    cost: new Decimal(39), costResource: PATE_BRIOCHEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('ferme_laitiere_cost_2') as string]: {
    id: supplierUpgradeId('ferme_laitiere_cost_2'),
    name: 'Contrat laitier II', emoji: '🥛',
    description: 'x0,8 cout - Ferme laitiere',
    targetSupplier: FERME_LAITIERE,
    cost: new Decimal(70), costResource: PATE_BRIOCHEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('ferme_laitiere_rate_3') as string]: {
    id: supplierUpgradeId('ferme_laitiere_rate_3'),
    name: 'Paturages bio III', emoji: '🥛',
    description: 'x3 debit max - Ferme laitiere',
    targetSupplier: FERME_LAITIERE,
    cost: new Decimal(126), costResource: PATE_BRIOCHEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('ferme_laitiere_cost_3') as string]: {
    id: supplierUpgradeId('ferme_laitiere_cost_3'),
    name: 'Contrat laitier III', emoji: '🥛',
    description: 'x0,8 cout - Ferme laitiere',
    targetSupplier: FERME_LAITIERE,
    cost: new Decimal(227), costResource: PATE_BRIOCHEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('ferme_laitiere_rate_4') as string]: {
    id: supplierUpgradeId('ferme_laitiere_rate_4'),
    name: 'Paturages bio IV', emoji: '🥛',
    description: 'x3 debit max - Ferme laitiere',
    targetSupplier: FERME_LAITIERE,
    cost: new Decimal(408), costResource: PATE_BRIOCHEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('ferme_laitiere_cost_4') as string]: {
    id: supplierUpgradeId('ferme_laitiere_cost_4'),
    name: 'Contrat laitier IV', emoji: '🥛',
    description: 'x0,8 cout - Ferme laitiere',
    targetSupplier: FERME_LAITIERE,
    cost: new Decimal(735), costResource: PATE_BRIOCHEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('ferme_laitiere_rate_5') as string]: {
    id: supplierUpgradeId('ferme_laitiere_rate_5'),
    name: 'Paturages bio V', emoji: '🥛',
    description: 'x3 debit max - Ferme laitiere',
    targetSupplier: FERME_LAITIERE,
    cost: new Decimal(1322), costResource: PATE_BRIOCHEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('ferme_laitiere_cost_5') as string]: {
    id: supplierUpgradeId('ferme_laitiere_cost_5'),
    name: 'Contrat laitier V', emoji: '🥛',
    description: 'x0,8 cout - Ferme laitiere',
    targetSupplier: FERME_LAITIERE,
    cost: new Decimal(2380), costResource: PATE_BRIOCHEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('ferme_laitiere_rate_6') as string]: {
    id: supplierUpgradeId('ferme_laitiere_rate_6'),
    name: 'Paturages bio VI', emoji: '🥛',
    description: 'Debit max fixe a 1 000/s - Ferme laitiere',
    targetSupplier: FERME_LAITIERE,
    cost: new Decimal(4285), costResource: PATE_BRIOCHEE,
    effectType: 'set_max_rate', effectValue: new Decimal(1000),
    scope: 'chocolatines',
  },

  // ── Plantation vanille (baseCost=12, costGrowth=1.8, costResource=PATE_BRIOCHEE) ──
  [supplierUpgradeId('plantation_vanille_rate_1') as string]: {
    id: supplierUpgradeId('plantation_vanille_rate_1'),
    name: 'Vanille bourbon', emoji: '🌱',
    description: 'x3 debit max - Plantation vanille',
    targetSupplier: PLANTATION_VANILLE,
    cost: new Decimal(12), costResource: PATE_BRIOCHEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('plantation_vanille_cost_1') as string]: {
    id: supplierUpgradeId('plantation_vanille_cost_1'),
    name: 'Contrat vanille', emoji: '🌱',
    description: 'x0,8 cout - Plantation vanille',
    targetSupplier: PLANTATION_VANILLE,
    cost: new Decimal(22), costResource: PATE_BRIOCHEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('plantation_vanille_rate_2') as string]: {
    id: supplierUpgradeId('plantation_vanille_rate_2'),
    name: 'Vanille bourbon II', emoji: '🌱',
    description: 'x3 debit max - Plantation vanille',
    targetSupplier: PLANTATION_VANILLE,
    cost: new Decimal(39), costResource: PATE_BRIOCHEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('plantation_vanille_cost_2') as string]: {
    id: supplierUpgradeId('plantation_vanille_cost_2'),
    name: 'Contrat vanille II', emoji: '🌱',
    description: 'x0,8 cout - Plantation vanille',
    targetSupplier: PLANTATION_VANILLE,
    cost: new Decimal(70), costResource: PATE_BRIOCHEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('plantation_vanille_rate_3') as string]: {
    id: supplierUpgradeId('plantation_vanille_rate_3'),
    name: 'Vanille bourbon III', emoji: '🌱',
    description: 'x3 debit max - Plantation vanille',
    targetSupplier: PLANTATION_VANILLE,
    cost: new Decimal(126), costResource: PATE_BRIOCHEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('plantation_vanille_cost_3') as string]: {
    id: supplierUpgradeId('plantation_vanille_cost_3'),
    name: 'Contrat vanille III', emoji: '🌱',
    description: 'x0,8 cout - Plantation vanille',
    targetSupplier: PLANTATION_VANILLE,
    cost: new Decimal(227), costResource: PATE_BRIOCHEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('plantation_vanille_rate_4') as string]: {
    id: supplierUpgradeId('plantation_vanille_rate_4'),
    name: 'Vanille bourbon IV', emoji: '🌱',
    description: 'x3 debit max - Plantation vanille',
    targetSupplier: PLANTATION_VANILLE,
    cost: new Decimal(408), costResource: PATE_BRIOCHEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('plantation_vanille_cost_4') as string]: {
    id: supplierUpgradeId('plantation_vanille_cost_4'),
    name: 'Contrat vanille IV', emoji: '🌱',
    description: 'x0,8 cout - Plantation vanille',
    targetSupplier: PLANTATION_VANILLE,
    cost: new Decimal(735), costResource: PATE_BRIOCHEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('plantation_vanille_rate_5') as string]: {
    id: supplierUpgradeId('plantation_vanille_rate_5'),
    name: 'Vanille bourbon V', emoji: '🌱',
    description: 'x3 debit max - Plantation vanille',
    targetSupplier: PLANTATION_VANILLE,
    cost: new Decimal(1322), costResource: PATE_BRIOCHEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('plantation_vanille_cost_5') as string]: {
    id: supplierUpgradeId('plantation_vanille_cost_5'),
    name: 'Contrat vanille V', emoji: '🌱',
    description: 'x0,8 cout - Plantation vanille',
    targetSupplier: PLANTATION_VANILLE,
    cost: new Decimal(2380), costResource: PATE_BRIOCHEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('plantation_vanille_rate_6') as string]: {
    id: supplierUpgradeId('plantation_vanille_rate_6'),
    name: 'Vanille bourbon VI', emoji: '🌱',
    description: 'Debit max fixe a 1 000/s - Plantation vanille',
    targetSupplier: PLANTATION_VANILLE,
    cost: new Decimal(4285), costResource: PATE_BRIOCHEE,
    effectType: 'set_max_rate', effectValue: new Decimal(1000),
    scope: 'chocolatines',
  },

  // ── Elevage de poules (baseCost=8, costGrowth=1.8, costResource=CHOCOLATINE_DOREE) ──
  [supplierUpgradeId('elevage_poules_rate_1') as string]: {
    id: supplierUpgradeId('elevage_poules_rate_1'),
    name: 'Poules selectionnees', emoji: '🥚',
    description: 'x3 debit max - Elevage de poules',
    targetSupplier: ELEVAGE_POULES,
    cost: new Decimal(8), costResource: CHOCOLATINE_DOREE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('elevage_poules_cost_1') as string]: {
    id: supplierUpgradeId('elevage_poules_cost_1'),
    name: 'Contrat elevage', emoji: '🥚',
    description: 'x0,8 cout - Elevage de poules',
    targetSupplier: ELEVAGE_POULES,
    cost: new Decimal(14), costResource: CHOCOLATINE_DOREE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('elevage_poules_rate_2') as string]: {
    id: supplierUpgradeId('elevage_poules_rate_2'),
    name: 'Poules selectionnees II', emoji: '🥚',
    description: 'x3 debit max - Elevage de poules',
    targetSupplier: ELEVAGE_POULES,
    cost: new Decimal(26), costResource: CHOCOLATINE_DOREE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('elevage_poules_cost_2') as string]: {
    id: supplierUpgradeId('elevage_poules_cost_2'),
    name: 'Contrat elevage II', emoji: '🥚',
    description: 'x0,8 cout - Elevage de poules',
    targetSupplier: ELEVAGE_POULES,
    cost: new Decimal(47), costResource: CHOCOLATINE_DOREE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('elevage_poules_rate_3') as string]: {
    id: supplierUpgradeId('elevage_poules_rate_3'),
    name: 'Poules selectionnees III', emoji: '🥚',
    description: 'x3 debit max - Elevage de poules',
    targetSupplier: ELEVAGE_POULES,
    cost: new Decimal(84), costResource: CHOCOLATINE_DOREE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('elevage_poules_cost_3') as string]: {
    id: supplierUpgradeId('elevage_poules_cost_3'),
    name: 'Contrat elevage III', emoji: '🥚',
    description: 'x0,8 cout - Elevage de poules',
    targetSupplier: ELEVAGE_POULES,
    cost: new Decimal(151), costResource: CHOCOLATINE_DOREE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('elevage_poules_rate_4') as string]: {
    id: supplierUpgradeId('elevage_poules_rate_4'),
    name: 'Poules selectionnees IV', emoji: '🥚',
    description: 'x3 debit max - Elevage de poules',
    targetSupplier: ELEVAGE_POULES,
    cost: new Decimal(272), costResource: CHOCOLATINE_DOREE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('elevage_poules_cost_4') as string]: {
    id: supplierUpgradeId('elevage_poules_cost_4'),
    name: 'Contrat elevage IV', emoji: '🥚',
    description: 'x0,8 cout - Elevage de poules',
    targetSupplier: ELEVAGE_POULES,
    cost: new Decimal(490), costResource: CHOCOLATINE_DOREE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('elevage_poules_rate_5') as string]: {
    id: supplierUpgradeId('elevage_poules_rate_5'),
    name: 'Poules selectionnees V', emoji: '🥚',
    description: 'x3 debit max - Elevage de poules',
    targetSupplier: ELEVAGE_POULES,
    cost: new Decimal(882), costResource: CHOCOLATINE_DOREE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('elevage_poules_cost_5') as string]: {
    id: supplierUpgradeId('elevage_poules_cost_5'),
    name: 'Contrat elevage V', emoji: '🥚',
    description: 'x0,8 cout - Elevage de poules',
    targetSupplier: ELEVAGE_POULES,
    cost: new Decimal(1587), costResource: CHOCOLATINE_DOREE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'chocolatines',
  },
  [supplierUpgradeId('elevage_poules_rate_6') as string]: {
    id: supplierUpgradeId('elevage_poules_rate_6'),
    name: 'Poules selectionnees VI', emoji: '🥚',
    description: 'Debit max fixe a 1 000/s - Elevage de poules',
    targetSupplier: ELEVAGE_POULES,
    cost: new Decimal(2856), costResource: CHOCOLATINE_DOREE,
    effectType: 'set_max_rate', effectValue: new Decimal(1000),
    scope: 'chocolatines',
  },
}

const supplierUpgradeOrder = [
  // Maitre chocolatier
  supplierUpgradeId('maitre_chocolatier_rate_1'),
  supplierUpgradeId('maitre_chocolatier_cost_1'),
  supplierUpgradeId('maitre_chocolatier_rate_2'),
  supplierUpgradeId('maitre_chocolatier_cost_2'),
  supplierUpgradeId('maitre_chocolatier_rate_3'),
  supplierUpgradeId('maitre_chocolatier_cost_3'),
  supplierUpgradeId('maitre_chocolatier_rate_4'),
  supplierUpgradeId('maitre_chocolatier_cost_4'),
  supplierUpgradeId('maitre_chocolatier_rate_5'),
  supplierUpgradeId('maitre_chocolatier_cost_5'),
  supplierUpgradeId('maitre_chocolatier_rate_6'),
  // Ferme laitiere
  supplierUpgradeId('ferme_laitiere_rate_1'),
  supplierUpgradeId('ferme_laitiere_cost_1'),
  supplierUpgradeId('ferme_laitiere_rate_2'),
  supplierUpgradeId('ferme_laitiere_cost_2'),
  supplierUpgradeId('ferme_laitiere_rate_3'),
  supplierUpgradeId('ferme_laitiere_cost_3'),
  supplierUpgradeId('ferme_laitiere_rate_4'),
  supplierUpgradeId('ferme_laitiere_cost_4'),
  supplierUpgradeId('ferme_laitiere_rate_5'),
  supplierUpgradeId('ferme_laitiere_cost_5'),
  supplierUpgradeId('ferme_laitiere_rate_6'),
  // Plantation vanille
  supplierUpgradeId('plantation_vanille_rate_1'),
  supplierUpgradeId('plantation_vanille_cost_1'),
  supplierUpgradeId('plantation_vanille_rate_2'),
  supplierUpgradeId('plantation_vanille_cost_2'),
  supplierUpgradeId('plantation_vanille_rate_3'),
  supplierUpgradeId('plantation_vanille_cost_3'),
  supplierUpgradeId('plantation_vanille_rate_4'),
  supplierUpgradeId('plantation_vanille_cost_4'),
  supplierUpgradeId('plantation_vanille_rate_5'),
  supplierUpgradeId('plantation_vanille_cost_5'),
  supplierUpgradeId('plantation_vanille_rate_6'),
  // Elevage de poules
  supplierUpgradeId('elevage_poules_rate_1'),
  supplierUpgradeId('elevage_poules_cost_1'),
  supplierUpgradeId('elevage_poules_rate_2'),
  supplierUpgradeId('elevage_poules_cost_2'),
  supplierUpgradeId('elevage_poules_rate_3'),
  supplierUpgradeId('elevage_poules_cost_3'),
  supplierUpgradeId('elevage_poules_rate_4'),
  supplierUpgradeId('elevage_poules_cost_4'),
  supplierUpgradeId('elevage_poules_rate_5'),
  supplierUpgradeId('elevage_poules_cost_5'),
  supplierUpgradeId('elevage_poules_rate_6'),
]

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
  buildingOrder: [BATTEUR_PRO, FONDOIR, GARNISSEUR_CHOCO, DOREUSE, FOUR_A_SOLE, PATISSERIE, LIGNE_PRODUCTION, RESEAU_PATISSERIES, EMPIRE_CHOCOLATINE],
  buildingUnlockThresholds: {
    [BATTEUR_PRO as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(100) },
    [FONDOIR as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(100) },
    [GARNISSEUR_CHOCO as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(400) },
    [DOREUSE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(1_000) },
    [FOUR_A_SOLE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(2_000) },
    [PATISSERIE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(4_000) },
[LIGNE_PRODUCTION as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(60_000) },
    [RESEAU_PATISSERIES as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(300_000) },
    [EMPIRE_CHOCOLATINE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(3_000_000) },
  },
  craftingRecipes,
  craftingOrder: [PETRISSAGE_CHOCOLATINE, GARNISSAGE_CHOCOLATINE, DORURE_CHOCOLATINE, CUISSON_CHOCOLATINE],
  upgrades,
  upgradeOrder: [
    upgradeId('choco_petrissage_rapide'),
    upgradeId('choco_garnissage_rapide'),
    upgradeId('choco_dorure_rapide'),
    upgradeId('choco_cuisson_rapide'),
    upgradeId('choco_meilleur_prix'),
    upgradeId('choco_fondoir_boost'),
    upgradeId('choco_batteur_boost'),
    upgradeId('choco_doreuse_boost'),
    upgradeId('choco_global'),
    upgradeId('choco_achat_en_gros'),
  ],
  suppliers,
  supplierOrder: [MAITRE_CHOCOLATIER, FERME_LAITIERE, PLANTATION_VANILLE, ELEVAGE_POULES],
  supplierUpgrades,
  supplierUpgradeOrder,
  pipelineConfig,
  passiveRegen: {
    [CHOCOLAT_NOIR as string]: new Decimal(0.15),
    [CREME_FRAICHE as string]: new Decimal(0.22),
    [SUCRE_VANILLE as string]: new Decimal(0.18),
    [OEUF_DORE as string]: new Decimal(0.10),
  },
  finishedProductId: CHOCOLATINES,
  baseSellRate: new Decimal(15),
}
