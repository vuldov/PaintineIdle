import Decimal from 'decimal.js'
import { resourceId, buildingId, craftingRecipeId, upgradeId, supplierId, supplierUpgradeId, PANTINS_COINS_ID } from '@/types'
import type { ProductBundle, ResourceData, BuildingData, CraftingRecipeData, UpgradeData, PipelineStageConfig, SupplierData, SupplierUpgradeData } from '@/types'

// ─── Resource IDs ──────────────────────────────────────────────
const BEURRE = resourceId('beurre')
const FARINE = resourceId('farine')
const PATE_FEUILLETEE = resourceId('pate_feuilletee')
const CROISSANTS = resourceId('croissants')

// ─── Building IDs ──────────────────────────────────────────────
const FOURNIL = buildingId('fournil')
const PETRIN = buildingId('petrin')
const FOUR_PRO = buildingId('four_pro')
const BOUTIQUE = buildingId('boutique')

const USINE = buildingId('usine')
const FRANCHISE = buildingId('franchise')
const EMPIRE = buildingId('empire')

// ─── Resources ─────────────────────────────────────────────────
const resources: Record<string, ResourceData> = {
  [BEURRE as string]: {
    id: BEURRE, name: 'Beurre', emoji: '🧈',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(10), scope: 'croissants',
  },
  [FARINE as string]: {
    id: FARINE, name: 'Farine', emoji: '🌾',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(20), scope: 'croissants',
  },
  [PATE_FEUILLETEE as string]: {
    id: PATE_FEUILLETEE, name: 'Pâte feuilletée', emoji: '🫓',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'croissants',
  },
  [CROISSANTS as string]: {
    id: CROISSANTS, name: 'Croissants', emoji: '🥐',
    category: 'produit_fini', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'croissants',
  },
}

// ─── Buildings ─────────────────────────────────────────────────
const buildings: Record<string, BuildingData> = {
  [FOURNIL as string]: {
    id: FOURNIL, name: 'Fournil', emoji: '🏠',
    description: 'Cuit automatiquement la pâte en croissants',
    baseCost: new Decimal(15), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.4),
    producedResource: CROISSANTS, pipelineRole: 'cuisson', scope: 'croissants',
    aura: {
      effectType: 'production_bonus', bonusPerBuilding: new Decimal(0.01),
      targetProduct: 'croissants', description: '+1% production croissants par fournil',
    },
  },
  [PETRIN as string]: {
    id: PETRIN, name: 'Pétrin mécanique', emoji: '⚙️',
    description: 'Pétrit automatiquement le beurre et la farine en pâte',
    baseCost: new Decimal(30), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.5),
    producedResource: PATE_FEUILLETEE, pipelineRole: 'petrissage', scope: 'croissants',
    aura: {
      effectType: 'crafting_speed_bonus', bonusPerBuilding: new Decimal(0.02),
      targetRecipe: 'petrissage_croissant', description: '+2% vitesse pétrissage croissant par pétrin',
    },
  },
  [FOUR_PRO as string]: {
    id: FOUR_PRO, name: 'Four professionnel', emoji: '🔥',
    description: 'Cuisson rapide et de qualité supérieure',
    baseCost: new Decimal(200), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(2),
    producedResource: CROISSANTS, pipelineRole: 'cuisson', scope: 'croissants',
    aura: {
      effectType: 'crafting_speed_bonus', bonusPerBuilding: new Decimal(0.03),
      targetRecipe: 'cuisson_croissant', description: '+3% vitesse cuisson croissant par four pro',
    },
  },
  [BOUTIQUE as string]: {
    id: BOUTIQUE, name: 'Boutique', emoji: '🏪',
    description: 'Vend automatiquement les croissants',
    baseCost: new Decimal(500), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(1),
    producedResource: PANTINS_COINS_ID, pipelineRole: 'vente', scope: 'croissants',
    aura: {
      effectType: 'sell_price_bonus', bonusPerBuilding: new Decimal(0.05),
      targetProduct: 'croissants', description: '+5% prix de vente croissants par boutique',
    },
  },
[USINE as string]: {
    id: USINE, name: 'Usine viennoiserie', emoji: '🏭',
    description: 'Production industrielle : pétrit, cuit et vend',
    baseCost: new Decimal(10_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(5),
    producedResource: CROISSANTS, pipelineRole: 'full_pipeline', scope: 'croissants',
    aura: {
      effectType: 'global_production_bonus', bonusPerBuilding: new Decimal(0.01),
      description: '+1% production globale par usine',
    },
  },
  [FRANCHISE as string]: {
    id: FRANCHISE, name: 'Franchise nationale', emoji: '🗺️',
    description: 'Réseau de vente dans toute la France',
    baseCost: new Decimal(50_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(10),
    producedResource: PANTINS_COINS_ID, pipelineRole: 'vente', scope: 'croissants',
    aura: {
      effectType: 'sell_price_bonus', bonusPerBuilding: new Decimal(0.01),
      description: '+1% prix de vente tous produits par franchise',
    },
  },
  [EMPIRE as string]: {
    id: EMPIRE, name: 'Empire mondial', emoji: '🌍',
    description: 'Domination mondiale de la viennoiserie',
    baseCost: new Decimal(500_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(50),
    producedResource: CROISSANTS, pipelineRole: 'full_pipeline', scope: 'croissants',
    aura: {
      effectType: 'all_speed_bonus', bonusPerBuilding: new Decimal(0.005),
      description: '+0,5% vitesse globale par empire mondial',
    },
  },
}

// ─── Pipeline config (data-driven) ────────────────────────────
const pipelineConfig: { stages: PipelineStageConfig[] } = {
  stages: [
    {
      role: 'petrissage',
      consumes: [
        { resource: BEURRE, ratio: new Decimal(1) },
        { resource: FARINE, ratio: new Decimal(1.5) },
      ],
      produces: [
        { resource: PATE_FEUILLETEE, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'cuisson',
      consumes: [
        { resource: PATE_FEUILLETEE, ratio: new Decimal(0.7) },
      ],
      produces: [
        { resource: CROISSANTS, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'vente',
      consumes: [
        { resource: CROISSANTS, ratio: new Decimal(1) },
      ],
      produces: [
        { resource: PANTINS_COINS_ID, ratio: new Decimal(1) },
      ],
    },
  ],
}

// ─── Crafting recipes ──────────────────────────────────────────
const PETRISSAGE_CROISSANT = craftingRecipeId('petrissage_croissant')
const CUISSON_CROISSANT = craftingRecipeId('cuisson_croissant')

const craftingRecipes: Record<string, CraftingRecipeData> = {
  [PETRISSAGE_CROISSANT as string]: {
    id: PETRISSAGE_CROISSANT, name: 'Pétrissage', emoji: '🤲',
    verb: 'Pétrir',
    inputs: [
      { resource: BEURRE, amount: new Decimal(2) },
      { resource: FARINE, amount: new Decimal(3) },
    ],
    output: { resource: PATE_FEUILLETEE, amount: new Decimal(2) },
    durationSeconds: 3,
    scope: 'croissants',
  },
  [CUISSON_CROISSANT as string]: {
    id: CUISSON_CROISSANT, name: 'Cuisson', emoji: '🔥',
    verb: 'Cuire',
    inputs: [
      { resource: PATE_FEUILLETEE, amount: new Decimal(2) },
    ],
    output: { resource: CROISSANTS, amount: new Decimal(3) },
    durationSeconds: 5,
    scope: 'croissants',
  },
}

// ─── Upgrades ──────────────────────────────────────────────────
const upgrades: Record<string, UpgradeData> = {
  petrissage_rapide: {
    id: upgradeId('petrissage_rapide'), name: 'Pétrissage rapide',
    description: 'Pétrissage 2x plus rapide', emoji: '⚡',
    cost: new Decimal(20), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: PETRISSAGE_CROISSANT, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PATE_FEUILLETEE, threshold: new Decimal(5) },
    scope: 'croissants',
  },
  cuisson_rapide: {
    id: upgradeId('cuisson_rapide'), name: 'Cuisson rapide',
    description: 'Cuisson 2x plus rapide', emoji: '⚡',
    cost: new Decimal(30), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: CUISSON_CROISSANT, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: CROISSANTS, threshold: new Decimal(10) },
    scope: 'croissants',
  },
  meilleur_prix: {
    id: upgradeId('meilleur_prix'), name: 'Meilleur prix',
    description: 'x2 paintines coins par croissant vendu', emoji: '💰',
    cost: new Decimal(50), costResource: PANTINS_COINS_ID,
    effect: { type: 'sell_multiplier', multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(30) },
    scope: 'croissants',
  },
  beurre_aop_1: {
    id: upgradeId('beurre_aop_1'), name: 'Beurre AOP Charentes',
    description: 'x2 production des pétrins', emoji: '🧈',
    cost: new Decimal(100), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: PETRIN, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: PETRIN, threshold: new Decimal(5) },
    scope: 'croissants',
  },
  croissant_dore: {
    id: upgradeId('croissant_dore'), name: 'Croissant bien doré',
    description: 'x2 production des fournils', emoji: '✨',
    cost: new Decimal(150), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: FOURNIL, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: FOURNIL, threshold: new Decimal(5) },
    scope: 'croissants',
  },
  farine_tradition: {
    id: upgradeId('farine_tradition'), name: 'Farine de tradition',
    description: 'x1,5 production de tous les bâtiments', emoji: '🌾',
    cost: new Decimal(300), costResource: PANTINS_COINS_ID,
    effect: { type: 'global_multiplier', multiplier: new Decimal(1.5) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(150) },
    scope: 'croissants',
  },
  achat_en_gros: {
    id: upgradeId('achat_en_gros'), name: 'Achat en gros',
    description: 'Bâtiments 15% moins chers', emoji: '📦',
    cost: new Decimal(500), costResource: PANTINS_COINS_ID,
    effect: { type: 'cost_reduction', multiplier: new Decimal(0.85) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(250) },
    scope: 'croissants',
  },
  marketing: {
    id: upgradeId('marketing'), name: 'Marketing',
    description: 'x3 paintines coins par croissant vendu', emoji: '📢',
    cost: new Decimal(2_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'sell_multiplier', multiplier: new Decimal(3) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(1_000) },
    scope: 'croissants',
  },
  four_turbo: {
    id: upgradeId('four_turbo'), name: 'Four turbo',
    description: 'x2 production du four pro', emoji: '🔥',
    cost: new Decimal(2_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: FOUR_PRO, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: FOUR_PRO, threshold: new Decimal(5) },
    scope: 'croissants',
  },
  vitrine_refrigeree: {
    id: upgradeId('vitrine_refrigeree'), name: 'Vitrine réfrigérée',
    description: 'x2 ventes de la boutique', emoji: '🧊',
    cost: new Decimal(5_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: BOUTIQUE, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: BOUTIQUE, threshold: new Decimal(5) },
    scope: 'croissants',
  },
  negociation_fournisseurs: {
    id: upgradeId('negociation_fournisseurs'), name: 'Négociation fournisseurs',
    description: 'Bâtiments 15% encore moins chers', emoji: '🤝',
    cost: new Decimal(10_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'cost_reduction', multiplier: new Decimal(0.85) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(5_000) },
    scope: 'croissants',
  },
}

// ─── Suppliers (1 per ingredient) ────────────────────────────
const BEURRIER_ARTISANAL = supplierId('beurrier_artisanal')
const MOULIN_A_FARINE = supplierId('moulin_a_farine')

const suppliers: Record<string, SupplierData> = {
  [BEURRIER_ARTISANAL as string]: {
    id: BEURRIER_ARTISANAL, name: 'Beurrier artisanal', emoji: '🧈',
    description: 'Petit producteur local de beurre frais',
    producedResource: BEURRE,
    baseMaxRate: new Decimal(2), baseCostPerSecond: new Decimal(0.5),
    contractCost: new Decimal(50), scope: 'croissants',
  },
  [MOULIN_A_FARINE as string]: {
    id: MOULIN_A_FARINE, name: 'Moulin a farine', emoji: '🌾',
    description: 'Moulin traditionnel produisant de la farine de qualite',
    producedResource: FARINE,
    baseMaxRate: new Decimal(3), baseCostPerSecond: new Decimal(0.8),
    contractCost: new Decimal(80), scope: 'croissants',
  },
}

// ─── Supplier upgrades ───────────────────────────────────────
const BEURRE_PREMIUM = supplierUpgradeId('beurre_premium')
const MOULIN_AMELIORE = supplierUpgradeId('moulin_ameliore')
const CONTRAT_BEURRE_NEGO = supplierUpgradeId('contrat_beurre_nego')
const CONTRAT_FARINE_NEGO = supplierUpgradeId('contrat_farine_nego')

const supplierUpgrades: Record<string, SupplierUpgradeData> = {
  [BEURRE_PREMIUM as string]: {
    id: BEURRE_PREMIUM, name: 'Beurre premium', emoji: '🧈',
    description: 'x1,5 debit max du beurrier',
    targetSupplier: BEURRIER_ARTISANAL,
    cost: new Decimal(10), costResource: PATE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(1.5),
    scope: 'croissants',
  },
  [MOULIN_AMELIORE as string]: {
    id: MOULIN_AMELIORE, name: 'Moulin ameliore', emoji: '🌾',
    description: 'x1,5 debit max du moulin',
    targetSupplier: MOULIN_A_FARINE,
    cost: new Decimal(10), costResource: PATE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(1.5),
    scope: 'croissants',
  },
  [CONTRAT_BEURRE_NEGO as string]: {
    id: CONTRAT_BEURRE_NEGO, name: 'Negociation beurre', emoji: '🤝',
    description: '-20% cout du beurrier',
    targetSupplier: BEURRIER_ARTISANAL,
    cost: new Decimal(15), costResource: PATE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'croissants',
  },
  [CONTRAT_FARINE_NEGO as string]: {
    id: CONTRAT_FARINE_NEGO, name: 'Negociation farine', emoji: '🤝',
    description: '-20% cout du moulin',
    targetSupplier: MOULIN_A_FARINE,
    cost: new Decimal(15), costResource: PATE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'croissants',
  },
}

// ─── Bundle ────────────────────────────────────────────────────

export const CROISSANTS_BUNDLE: ProductBundle = {
  definition: {
    id: 'croissants',
    name: 'Croissants',
    emoji: '🥐',
    color: 'amber',
    unlockCondition: null, // unlocked from start
  },
  resources,
  buildings,
  buildingOrder: [PETRIN, FOURNIL, FOUR_PRO, BOUTIQUE, USINE, FRANCHISE, EMPIRE],
  buildingUnlockThresholds: {
    [PETRIN as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(5) },
    [FOURNIL as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(5) },
    [FOUR_PRO as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(80) },
    [BOUTIQUE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(200) },
[USINE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(4_000) },
    [FRANCHISE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(20_000) },
    [EMPIRE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(200_000) },
  },
  craftingRecipes,
  craftingOrder: [PETRISSAGE_CROISSANT, CUISSON_CROISSANT],
  upgrades,
  upgradeOrder: [
    upgradeId('petrissage_rapide'),
    upgradeId('cuisson_rapide'),
    upgradeId('meilleur_prix'),
    upgradeId('beurre_aop_1'),
    upgradeId('croissant_dore'),
    upgradeId('farine_tradition'),
    upgradeId('achat_en_gros'),
    upgradeId('marketing'),
    upgradeId('four_turbo'),
    upgradeId('vitrine_refrigeree'),
    upgradeId('negociation_fournisseurs'),
],
  suppliers,
  supplierOrder: [BEURRIER_ARTISANAL, MOULIN_A_FARINE],
  supplierUpgrades,
  supplierUpgradeOrder: [BEURRE_PREMIUM, MOULIN_AMELIORE, CONTRAT_BEURRE_NEGO, CONTRAT_FARINE_NEGO],
  pipelineConfig,
  passiveRegen: {
    [BEURRE as string]: new Decimal(0.2),
    [FARINE as string]: new Decimal(0.3),
  },
  finishedProductId: CROISSANTS,
  baseSellRate: new Decimal(1),
}
