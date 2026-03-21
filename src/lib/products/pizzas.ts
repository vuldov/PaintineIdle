import Decimal from 'decimal.js'
import { resourceId, buildingId, craftingRecipeId, upgradeId, supplierId, supplierUpgradeId, PANTINS_COINS_ID } from '@/types'
import type { ProductBundle, ResourceData, BuildingData, CraftingRecipeData, UpgradeData, PipelineStageConfig, SupplierData, SupplierUpgradeData } from '@/types'
import { generateMilestones } from '@/lib/milestones/generateMilestones'

// ─── Resource IDs ──────────────────────────────────────────────
const TOMATES_FRAICHES = resourceId('tomates_fraiches')
const BASILIC = resourceId('basilic')
const FARINE_PIZZA = resourceId('farine_pizza')
const LEVURE = resourceId('levure')
const MOZZARELLA = resourceId('mozzarella')
const SAUCE_TOMATE = resourceId('sauce_tomate')
const PATE_A_PIZZA = resourceId('pate_a_pizza')
const PATE_ETALEE = resourceId('pate_etalee')
const PIZZA_GARNIE = resourceId('pizza_garnie')
const PIZZAS = resourceId('pizzas')

// ─── Building IDs ──────────────────────────────────────────────
const POTAGER = buildingId('potager')
const PETRIN_PIZZA = buildingId('petrin_pizza')
const PLAN_DE_TRAVAIL = buildingId('plan_de_travail')
const TABLE_GARNITURE = buildingId('table_garniture')
const FOUR_A_BOIS = buildingId('four_a_bois')
const PIZZERIA = buildingId('pizzeria')

// ─── Resources ─────────────────────────────────────────────────
const resources: Record<string, ResourceData> = {
  [TOMATES_FRAICHES as string]: {
    id: TOMATES_FRAICHES, name: 'Tomates fraîches', emoji: '🍅',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(8), scope: 'pizzas',
  },
  [BASILIC as string]: {
    id: BASILIC, name: 'Basilic', emoji: '🌿',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(6), scope: 'pizzas',
  },
  [FARINE_PIZZA as string]: {
    id: FARINE_PIZZA, name: 'Farine pizza', emoji: '🌾',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(10), scope: 'pizzas',
  },
  [LEVURE as string]: {
    id: LEVURE, name: 'Levure', emoji: '🧫',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(8), scope: 'pizzas',
  },
  [MOZZARELLA as string]: {
    id: MOZZARELLA, name: 'Mozzarella', emoji: '🧀',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(6), scope: 'pizzas',
  },
  [SAUCE_TOMATE as string]: {
    id: SAUCE_TOMATE, name: 'Sauce tomate', emoji: '🫕',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pizzas',
  },
  [PATE_A_PIZZA as string]: {
    id: PATE_A_PIZZA, name: 'Pâte à pizza', emoji: '🫓',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pizzas',
  },
  [PATE_ETALEE as string]: {
    id: PATE_ETALEE, name: 'Pâte étalée', emoji: '🔵',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pizzas',
  },
  [PIZZA_GARNIE as string]: {
    id: PIZZA_GARNIE, name: 'Pizza garnie', emoji: '🍕',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pizzas',
  },
  [PIZZAS as string]: {
    id: PIZZAS, name: 'Pizzas', emoji: '🍕',
    category: 'produit_fini', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pizzas',
  },
}

// ─── Buildings ─────────────────────────────────────────────────
const buildings: Record<string, BuildingData> = {
  [POTAGER as string]: {
    id: POTAGER, name: 'Potager', emoji: '🍅',
    description: 'Prépare la sauce tomate maison avec tomates et basilic',
    baseCost: new Decimal(1_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.25),
    producedResource: SAUCE_TOMATE, pipelineRole: 'preparation_sauce', scope: 'pizzas',
    aura: {
      effectType: 'ingredient_generation_bonus', bonusPerBuilding: new Decimal(0.05),
      description: '+5% génération ingrédients globale par potager',
    },
  },
  [PETRIN_PIZZA as string]: {
    id: PETRIN_PIZZA, name: 'Pétrin à pizza', emoji: '⚙️',
    description: 'Mélange farine et levure en pâte à pizza',
    baseCost: new Decimal(2_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.35),
    producedResource: PATE_A_PIZZA, pipelineRole: 'petrissage', scope: 'pizzas',
    aura: {
      effectType: 'crafting_speed_bonus', bonusPerBuilding: new Decimal(0.03),
      description: '+3% vitesse pétrissage globale par pétrin pizza',
    },
  },
  [PLAN_DE_TRAVAIL as string]: {
    id: PLAN_DE_TRAVAIL, name: 'Plan de travail', emoji: '🪵',
    description: 'Étale la pâte à pizza à la bonne épaisseur',
    baseCost: new Decimal(5_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.5),
    producedResource: PATE_ETALEE, pipelineRole: 'etalage', scope: 'pizzas',
    aura: {
      effectType: 'crafting_speed_bonus', bonusPerBuilding: new Decimal(0.02),
      description: '+2% vitesse étalage globale par plan de travail',
    },
  },
  [TABLE_GARNITURE as string]: {
    id: TABLE_GARNITURE, name: 'Table de garniture', emoji: '🤲',
    description: 'Garni la pizza avec sauce, mozzarella et garnitures',
    baseCost: new Decimal(8_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.4),
    producedResource: PIZZA_GARNIE, pipelineRole: 'garnissage', scope: 'pizzas',
    aura: {
      effectType: 'ingredient_generation_bonus', bonusPerBuilding: new Decimal(0.03),
      targetResource: 'mozzarella', description: '+3% génération mozzarella par table de garniture',
    },
  },
  [FOUR_A_BOIS as string]: {
    id: FOUR_A_BOIS, name: 'Four à bois', emoji: '🔥',
    description: 'Cuisson authentique au feu de bois',
    baseCost: new Decimal(15_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(1.2),
    producedResource: PIZZAS, pipelineRole: 'cuisson', scope: 'pizzas',
    aura: {
      effectType: 'sell_price_bonus', bonusPerBuilding: new Decimal(0.03),
      targetProduct: 'pizzas', description: '+3% prix de vente pizzas par four à bois',
    },
  },
  [PIZZERIA as string]: {
    id: PIZZERIA, name: 'Pizzeria', emoji: '🏪',
    description: 'Vend automatiquement les pizzas',
    baseCost: new Decimal(40_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.7),
    producedResource: PANTINS_COINS_ID, pipelineRole: 'vente', scope: 'pizzas',
    aura: {
      effectType: 'sell_price_bonus', bonusPerBuilding: new Decimal(0.01),
      description: '+1% prix de vente tous produits par pizzeria',
    },
  },
}

// ─── Pipeline config ───────────────────────────────────────────
//  Préparation sauce: tomates fraîches + basilic → sauce tomate
//  Pétrissage:        farine pizza + levure → pâte à pizza
//  Étalage:           pâte à pizza → pâte étalée
//  Garnissage:        pâte étalée + sauce tomate + mozzarella → pizza garnie
//  Cuisson:           pizza garnie → pizzas
//  Vente:             pizzas → coins
const pipelineConfig: { stages: PipelineStageConfig[] } = {
  stages: [
    {
      role: 'preparation_sauce',
      consumes: [
        { resource: TOMATES_FRAICHES, ratio: new Decimal(1) },
        { resource: BASILIC, ratio: new Decimal(0.7) },
      ],
      produces: [
        { resource: SAUCE_TOMATE, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'petrissage',
      consumes: [
        { resource: FARINE_PIZZA, ratio: new Decimal(1) },
        { resource: LEVURE, ratio: new Decimal(0.6) },
      ],
      produces: [
        { resource: PATE_A_PIZZA, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'etalage',
      consumes: [
        { resource: PATE_A_PIZZA, ratio: new Decimal(0.9) },
      ],
      produces: [
        { resource: PATE_ETALEE, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'garnissage',
      consumes: [
        { resource: PATE_ETALEE, ratio: new Decimal(0.8) },
        { resource: SAUCE_TOMATE, ratio: new Decimal(0.8) },
        { resource: MOZZARELLA, ratio: new Decimal(1) },
      ],
      produces: [
        { resource: PIZZA_GARNIE, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'cuisson',
      consumes: [
        { resource: PIZZA_GARNIE, ratio: new Decimal(0.9) },
      ],
      produces: [
        { resource: PIZZAS, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'vente',
      consumes: [
        { resource: PIZZAS, ratio: new Decimal(1) },
      ],
      produces: [
        { resource: PANTINS_COINS_ID, ratio: new Decimal(1) },
      ],
    },
  ],
}

// ─── Crafting recipes ──────────────────────────────────────────
const PREPARATION_SAUCE_PIZZA = craftingRecipeId('preparation_sauce_pizza')
const PETRISSAGE_PIZZA = craftingRecipeId('petrissage_pizza')
const ETALAGE_PIZZA = craftingRecipeId('etalage_pizza')
const GARNISSAGE_PIZZA = craftingRecipeId('garnissage_pizza')
const CUISSON_PIZZA = craftingRecipeId('cuisson_pizza')

const craftingRecipes: Record<string, CraftingRecipeData> = {
  [PREPARATION_SAUCE_PIZZA as string]: {
    id: PREPARATION_SAUCE_PIZZA, name: 'Préparer la sauce', emoji: '🍅',
    verb: 'Préparer',
    inputs: [
      { resource: TOMATES_FRAICHES, amount: new Decimal(3) },
      { resource: BASILIC, amount: new Decimal(2) },
    ],
    output: { resource: SAUCE_TOMATE, amount: new Decimal(2) },
    durationSeconds: 4,
    scope: 'pizzas',
    linkedBuildingId: POTAGER,
  },
  [PETRISSAGE_PIZZA as string]: {
    id: PETRISSAGE_PIZZA, name: 'Pétrissage', emoji: '🤲',
    verb: 'Pétrir',
    inputs: [
      { resource: FARINE_PIZZA, amount: new Decimal(3) },
      { resource: LEVURE, amount: new Decimal(2) },
    ],
    output: { resource: PATE_A_PIZZA, amount: new Decimal(2) },
    durationSeconds: 5,
    scope: 'pizzas',
    linkedBuildingId: PETRIN_PIZZA,
  },
  [ETALAGE_PIZZA as string]: {
    id: ETALAGE_PIZZA, name: 'Étalage', emoji: '🪵',
    verb: 'Étaler',
    inputs: [
      { resource: PATE_A_PIZZA, amount: new Decimal(2) },
    ],
    output: { resource: PATE_ETALEE, amount: new Decimal(2) },
    durationSeconds: 3,
    scope: 'pizzas',
    linkedBuildingId: PLAN_DE_TRAVAIL,
  },
  [GARNISSAGE_PIZZA as string]: {
    id: GARNISSAGE_PIZZA, name: 'Garnissage', emoji: '🧀',
    verb: 'Garnir',
    inputs: [
      { resource: PATE_ETALEE, amount: new Decimal(2) },
      { resource: SAUCE_TOMATE, amount: new Decimal(2) },
      { resource: MOZZARELLA, amount: new Decimal(3) },
    ],
    output: { resource: PIZZA_GARNIE, amount: new Decimal(2) },
    durationSeconds: 5,
    scope: 'pizzas',
    linkedBuildingId: TABLE_GARNITURE,
  },
  [CUISSON_PIZZA as string]: {
    id: CUISSON_PIZZA, name: 'Cuisson', emoji: '🔥',
    verb: 'Cuire',
    inputs: [
      { resource: PIZZA_GARNIE, amount: new Decimal(2) },
    ],
    output: { resource: PIZZAS, amount: new Decimal(3) },
    durationSeconds: 8,
    scope: 'pizzas',
    linkedBuildingId: FOUR_A_BOIS,
  },
}

// ─── Upgrades ──────────────────────────────────────────────────
const upgrades: Record<string, UpgradeData> = {
  pizza_sauce_rapide: {
    id: upgradeId('pizza_sauce_rapide'), name: 'Sauce express',
    description: 'Préparation sauce 2x plus rapide', emoji: '⚡',
    cost: new Decimal(30_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: PREPARATION_SAUCE_PIZZA, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: SAUCE_TOMATE, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_petrissage_rapide: {
    id: upgradeId('pizza_petrissage_rapide'), name: 'Pétrissage rapide (Pizza)',
    description: 'Pétrissage 2x plus rapide', emoji: '⚡',
    cost: new Decimal(50_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: PETRISSAGE_PIZZA, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PATE_A_PIZZA, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_etalage_rapide: {
    id: upgradeId('pizza_etalage_rapide'), name: 'Étalage rapide',
    description: 'Étalage 2x plus rapide', emoji: '⚡',
    cost: new Decimal(60_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: ETALAGE_PIZZA, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PATE_ETALEE, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_garnissage_rapide: {
    id: upgradeId('pizza_garnissage_rapide'), name: 'Garnissage rapide (Pizza)',
    description: 'Garnissage 2x plus rapide', emoji: '⚡',
    cost: new Decimal(70_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: GARNISSAGE_PIZZA, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PIZZA_GARNIE, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_cuisson_rapide: {
    id: upgradeId('pizza_cuisson_rapide'), name: 'Cuisson rapide (Pizza)',
    description: 'Cuisson 2x plus rapide', emoji: '⚡',
    cost: new Decimal(80_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: CUISSON_PIZZA, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PIZZAS, threshold: new Decimal(10) },
    scope: 'pizzas',
  },
  pizza_meilleur_prix: {
    id: upgradeId('pizza_meilleur_prix'), name: 'Livraison premium',
    description: 'x2 prix de vente des pizzas', emoji: '💰',
    cost: new Decimal(150_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'sell_multiplier', multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(80_000) },
    scope: 'pizzas',
  },
  pizza_potager_boost: {
    id: upgradeId('pizza_potager_boost'), name: 'Potager amélioré',
    description: 'x2 production du potager', emoji: '🍅',
    cost: new Decimal(50_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: POTAGER, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: POTAGER, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_petrin_boost: {
    id: upgradeId('pizza_petrin_boost'), name: 'Pétrin renforcé',
    description: 'x2 production du pétrin à pizza', emoji: '⚙️',
    cost: new Decimal(100_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: PETRIN_PIZZA, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: PETRIN_PIZZA, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_plan_travail_boost: {
    id: upgradeId('pizza_plan_travail_boost'), name: 'Plan de travail en marbre',
    description: 'x2 production du plan de travail', emoji: '🪵',
    cost: new Decimal(200_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: PLAN_DE_TRAVAIL, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: PLAN_DE_TRAVAIL, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_four_bois_boost: {
    id: upgradeId('pizza_four_bois_boost'), name: 'Bois de chêne',
    description: 'x2 production du four à bois', emoji: '🔥',
    cost: new Decimal(500_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: FOUR_A_BOIS, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: FOUR_A_BOIS, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_global: {
    id: upgradeId('pizza_global'), name: 'Recette napolitaine',
    description: 'x1,5 production de tous les bâtiments', emoji: '🇮🇹',
    cost: new Decimal(300_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'global_multiplier', multiplier: new Decimal(1.5) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(150_000) },
    scope: 'pizzas',
  },
  pizza_achat_en_gros: {
    id: upgradeId('pizza_achat_en_gros'), name: 'Fournisseur italien',
    description: 'Bâtiments 15% moins chers', emoji: '📦',
    cost: new Decimal(500_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'cost_reduction', multiplier: new Decimal(0.85) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(250_000) },
    scope: 'pizzas',
  },
}

// ─── Suppliers (1 per ingredient) ────────────────────────────
const MARAICHER_ITALIEN = supplierId('maraicher_italien')
const FROMAGERIE_NAPOLITAINE = supplierId('fromagerie_napolitaine')
const MOULIN_SICILIEN = supplierId('moulin_sicilien')
const HERBORISTE = supplierId('herboriste')
const LEVURERIE = supplierId('levurerie')

const suppliers: Record<string, SupplierData> = {
  [MARAICHER_ITALIEN as string]: {
    id: MARAICHER_ITALIEN, name: 'Maraicher italien', emoji: '🍅',
    description: 'Tomates San Marzano fraiches du Vesuve',
    producedResource: TOMATES_FRAICHES,
    baseMaxRate: new Decimal(2), baseCostPerSecond: new Decimal(12),
    contractCost: new Decimal(50_000), scope: 'pizzas',
  },
  [FROMAGERIE_NAPOLITAINE as string]: {
    id: FROMAGERIE_NAPOLITAINE, name: 'Fromagerie napolitaine', emoji: '🧀',
    description: 'Mozzarella di bufala fraiche du jour',
    producedResource: MOZZARELLA,
    baseMaxRate: new Decimal(2.5), baseCostPerSecond: new Decimal(15),
    contractCost: new Decimal(80_000), scope: 'pizzas',
  },
  [MOULIN_SICILIEN as string]: {
    id: MOULIN_SICILIEN, name: 'Moulin sicilien', emoji: '🌾',
    description: 'Farine Tipo 00 moulue a la meule de pierre',
    producedResource: FARINE_PIZZA,
    baseMaxRate: new Decimal(3), baseCostPerSecond: new Decimal(18),
    contractCost: new Decimal(60_000), scope: 'pizzas',
  },
  [HERBORISTE as string]: {
    id: HERBORISTE, name: 'Herboriste', emoji: '🌿',
    description: 'Basilic frais cultive en serre',
    producedResource: BASILIC,
    baseMaxRate: new Decimal(1.5), baseCostPerSecond: new Decimal(9),
    contractCost: new Decimal(40_000), scope: 'pizzas',
  },
  [LEVURERIE as string]: {
    id: LEVURERIE, name: 'Levurerie', emoji: '🧫',
    description: 'Levure de boulanger fraiche livree quotidiennement',
    producedResource: LEVURE,
    baseMaxRate: new Decimal(2), baseCostPerSecond: new Decimal(12),
    contractCost: new Decimal(40_000), scope: 'pizzas',
  },
}

// ─── Supplier upgrades (inline) ──────────────────────────────
const supplierUpgrades: Record<string, SupplierUpgradeData> = {
  // ── Maraicher italien (baseCost=20, costGrowth=1.8, costResource=SAUCE_TOMATE) ──
  [supplierUpgradeId('maraicher_italien_rate_1') as string]: {
    id: supplierUpgradeId('maraicher_italien_rate_1'),
    name: 'Serres du Vesuve', emoji: '🍅',
    description: 'x3 debit max - Maraicher italien',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(20), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_cost_1') as string]: {
    id: supplierUpgradeId('maraicher_italien_cost_1'),
    name: 'Contrat maraicher', emoji: '🍅',
    description: 'x0,8 cout - Maraicher italien',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(36), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_rate_2') as string]: {
    id: supplierUpgradeId('maraicher_italien_rate_2'),
    name: 'Serres du Vesuve II', emoji: '🍅',
    description: 'x3 debit max - Maraicher italien',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(65), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_cost_2') as string]: {
    id: supplierUpgradeId('maraicher_italien_cost_2'),
    name: 'Contrat maraicher II', emoji: '🍅',
    description: 'x0,8 cout - Maraicher italien',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(117), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_rate_3') as string]: {
    id: supplierUpgradeId('maraicher_italien_rate_3'),
    name: 'Serres du Vesuve III', emoji: '🍅',
    description: 'x3 debit max - Maraicher italien',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(210), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_cost_3') as string]: {
    id: supplierUpgradeId('maraicher_italien_cost_3'),
    name: 'Contrat maraicher III', emoji: '🍅',
    description: 'x0,8 cout - Maraicher italien',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(378), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_rate_4') as string]: {
    id: supplierUpgradeId('maraicher_italien_rate_4'),
    name: 'Serres du Vesuve IV', emoji: '🍅',
    description: 'x3 debit max - Maraicher italien',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(680), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_cost_4') as string]: {
    id: supplierUpgradeId('maraicher_italien_cost_4'),
    name: 'Contrat maraicher IV', emoji: '🍅',
    description: 'x0,8 cout - Maraicher italien',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(1224), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_rate_5') as string]: {
    id: supplierUpgradeId('maraicher_italien_rate_5'),
    name: 'Serres du Vesuve V', emoji: '🍅',
    description: 'x3 debit max - Maraicher italien',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(2204), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_cost_5') as string]: {
    id: supplierUpgradeId('maraicher_italien_cost_5'),
    name: 'Contrat maraicher V', emoji: '🍅',
    description: 'x0,8 cout - Maraicher italien',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(3967), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_rate_6') as string]: {
    id: supplierUpgradeId('maraicher_italien_rate_6'),
    name: 'Serres du Vesuve VI', emoji: '🍅',
    description: 'Debit max fixe a 1 000/s - Maraicher italien',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(7141), costResource: SAUCE_TOMATE,
    effectType: 'set_max_rate', effectValue: new Decimal(1000),
    scope: 'pizzas',
  },

  // ── Fromagerie napolitaine (baseCost=25, costGrowth=1.8, costResource=PIZZA_GARNIE) ──
  [supplierUpgradeId('fromagerie_napolitaine_rate_1') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_rate_1'),
    name: 'Bufflonnes selectionnees', emoji: '🧀',
    description: 'x3 debit max - Fromagerie napolitaine',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(25), costResource: PIZZA_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_cost_1') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_cost_1'),
    name: 'Contrat fromagerie', emoji: '🧀',
    description: 'x0,8 cout - Fromagerie napolitaine',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(45), costResource: PIZZA_GARNIE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_rate_2') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_rate_2'),
    name: 'Bufflonnes selectionnees II', emoji: '🧀',
    description: 'x3 debit max - Fromagerie napolitaine',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(81), costResource: PIZZA_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_cost_2') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_cost_2'),
    name: 'Contrat fromagerie II', emoji: '🧀',
    description: 'x0,8 cout - Fromagerie napolitaine',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(146), costResource: PIZZA_GARNIE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_rate_3') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_rate_3'),
    name: 'Bufflonnes selectionnees III', emoji: '🧀',
    description: 'x3 debit max - Fromagerie napolitaine',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(262), costResource: PIZZA_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_cost_3') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_cost_3'),
    name: 'Contrat fromagerie III', emoji: '🧀',
    description: 'x0,8 cout - Fromagerie napolitaine',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(472), costResource: PIZZA_GARNIE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_rate_4') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_rate_4'),
    name: 'Bufflonnes selectionnees IV', emoji: '🧀',
    description: 'x3 debit max - Fromagerie napolitaine',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(850), costResource: PIZZA_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_cost_4') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_cost_4'),
    name: 'Contrat fromagerie IV', emoji: '🧀',
    description: 'x0,8 cout - Fromagerie napolitaine',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(1531), costResource: PIZZA_GARNIE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_rate_5') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_rate_5'),
    name: 'Bufflonnes selectionnees V', emoji: '🧀',
    description: 'x3 debit max - Fromagerie napolitaine',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(2755), costResource: PIZZA_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_cost_5') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_cost_5'),
    name: 'Contrat fromagerie V', emoji: '🧀',
    description: 'x0,8 cout - Fromagerie napolitaine',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(4959), costResource: PIZZA_GARNIE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_rate_6') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_rate_6'),
    name: 'Bufflonnes selectionnees VI', emoji: '🧀',
    description: 'Debit max fixe a 1 000/s - Fromagerie napolitaine',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(8926), costResource: PIZZA_GARNIE,
    effectType: 'set_max_rate', effectValue: new Decimal(1000),
    scope: 'pizzas',
  },

  // ── Moulin sicilien (baseCost=20, costGrowth=1.8, costResource=PATE_A_PIZZA) ──
  [supplierUpgradeId('moulin_sicilien_rate_1') as string]: {
    id: supplierUpgradeId('moulin_sicilien_rate_1'),
    name: 'Ble ancien sicilien', emoji: '🌾',
    description: 'x3 debit max - Moulin sicilien',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(20), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_cost_1') as string]: {
    id: supplierUpgradeId('moulin_sicilien_cost_1'),
    name: 'Contrat moulin', emoji: '🌾',
    description: 'x0,8 cout - Moulin sicilien',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(36), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_rate_2') as string]: {
    id: supplierUpgradeId('moulin_sicilien_rate_2'),
    name: 'Ble ancien sicilien II', emoji: '🌾',
    description: 'x3 debit max - Moulin sicilien',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(65), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_cost_2') as string]: {
    id: supplierUpgradeId('moulin_sicilien_cost_2'),
    name: 'Contrat moulin II', emoji: '🌾',
    description: 'x0,8 cout - Moulin sicilien',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(117), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_rate_3') as string]: {
    id: supplierUpgradeId('moulin_sicilien_rate_3'),
    name: 'Ble ancien sicilien III', emoji: '🌾',
    description: 'x3 debit max - Moulin sicilien',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(210), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_cost_3') as string]: {
    id: supplierUpgradeId('moulin_sicilien_cost_3'),
    name: 'Contrat moulin III', emoji: '🌾',
    description: 'x0,8 cout - Moulin sicilien',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(378), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_rate_4') as string]: {
    id: supplierUpgradeId('moulin_sicilien_rate_4'),
    name: 'Ble ancien sicilien IV', emoji: '🌾',
    description: 'x3 debit max - Moulin sicilien',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(680), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_cost_4') as string]: {
    id: supplierUpgradeId('moulin_sicilien_cost_4'),
    name: 'Contrat moulin IV', emoji: '🌾',
    description: 'x0,8 cout - Moulin sicilien',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(1224), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_rate_5') as string]: {
    id: supplierUpgradeId('moulin_sicilien_rate_5'),
    name: 'Ble ancien sicilien V', emoji: '🌾',
    description: 'x3 debit max - Moulin sicilien',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(2204), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_cost_5') as string]: {
    id: supplierUpgradeId('moulin_sicilien_cost_5'),
    name: 'Contrat moulin V', emoji: '🌾',
    description: 'x0,8 cout - Moulin sicilien',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(3967), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_rate_6') as string]: {
    id: supplierUpgradeId('moulin_sicilien_rate_6'),
    name: 'Ble ancien sicilien VI', emoji: '🌾',
    description: 'Debit max fixe a 1 000/s - Moulin sicilien',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(7141), costResource: PATE_A_PIZZA,
    effectType: 'set_max_rate', effectValue: new Decimal(1000),
    scope: 'pizzas',
  },

  // ── Herboriste (baseCost=15, costGrowth=1.8, costResource=SAUCE_TOMATE) ──
  [supplierUpgradeId('herboriste_rate_1') as string]: {
    id: supplierUpgradeId('herboriste_rate_1'),
    name: 'Serre hydroponique', emoji: '🌿',
    description: 'x3 debit max - Herboriste',
    targetSupplier: HERBORISTE,
    cost: new Decimal(15), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_cost_1') as string]: {
    id: supplierUpgradeId('herboriste_cost_1'),
    name: 'Contrat herboriste', emoji: '🌿',
    description: 'x0,8 cout - Herboriste',
    targetSupplier: HERBORISTE,
    cost: new Decimal(27), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_rate_2') as string]: {
    id: supplierUpgradeId('herboriste_rate_2'),
    name: 'Serre hydroponique II', emoji: '🌿',
    description: 'x3 debit max - Herboriste',
    targetSupplier: HERBORISTE,
    cost: new Decimal(49), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_cost_2') as string]: {
    id: supplierUpgradeId('herboriste_cost_2'),
    name: 'Contrat herboriste II', emoji: '🌿',
    description: 'x0,8 cout - Herboriste',
    targetSupplier: HERBORISTE,
    cost: new Decimal(87), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_rate_3') as string]: {
    id: supplierUpgradeId('herboriste_rate_3'),
    name: 'Serre hydroponique III', emoji: '🌿',
    description: 'x3 debit max - Herboriste',
    targetSupplier: HERBORISTE,
    cost: new Decimal(157), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_cost_3') as string]: {
    id: supplierUpgradeId('herboriste_cost_3'),
    name: 'Contrat herboriste III', emoji: '🌿',
    description: 'x0,8 cout - Herboriste',
    targetSupplier: HERBORISTE,
    cost: new Decimal(283), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_rate_4') as string]: {
    id: supplierUpgradeId('herboriste_rate_4'),
    name: 'Serre hydroponique IV', emoji: '🌿',
    description: 'x3 debit max - Herboriste',
    targetSupplier: HERBORISTE,
    cost: new Decimal(510), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_cost_4') as string]: {
    id: supplierUpgradeId('herboriste_cost_4'),
    name: 'Contrat herboriste IV', emoji: '🌿',
    description: 'x0,8 cout - Herboriste',
    targetSupplier: HERBORISTE,
    cost: new Decimal(918), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_rate_5') as string]: {
    id: supplierUpgradeId('herboriste_rate_5'),
    name: 'Serre hydroponique V', emoji: '🌿',
    description: 'x3 debit max - Herboriste',
    targetSupplier: HERBORISTE,
    cost: new Decimal(1653), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_cost_5') as string]: {
    id: supplierUpgradeId('herboriste_cost_5'),
    name: 'Contrat herboriste V', emoji: '🌿',
    description: 'x0,8 cout - Herboriste',
    targetSupplier: HERBORISTE,
    cost: new Decimal(2975), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_rate_6') as string]: {
    id: supplierUpgradeId('herboriste_rate_6'),
    name: 'Serre hydroponique VI', emoji: '🌿',
    description: 'Debit max fixe a 1 000/s - Herboriste',
    targetSupplier: HERBORISTE,
    cost: new Decimal(5356), costResource: SAUCE_TOMATE,
    effectType: 'set_max_rate', effectValue: new Decimal(1000),
    scope: 'pizzas',
  },

  // ── Levurerie (baseCost=15, costGrowth=1.8, costResource=PATE_A_PIZZA) ──
  [supplierUpgradeId('levurerie_rate_1') as string]: {
    id: supplierUpgradeId('levurerie_rate_1'),
    name: 'Culture optimisee', emoji: '🧫',
    description: 'x3 debit max - Levurerie',
    targetSupplier: LEVURERIE,
    cost: new Decimal(15), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_cost_1') as string]: {
    id: supplierUpgradeId('levurerie_cost_1'),
    name: 'Contrat levurerie', emoji: '🧫',
    description: 'x0,8 cout - Levurerie',
    targetSupplier: LEVURERIE,
    cost: new Decimal(27), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_rate_2') as string]: {
    id: supplierUpgradeId('levurerie_rate_2'),
    name: 'Culture optimisee II', emoji: '🧫',
    description: 'x3 debit max - Levurerie',
    targetSupplier: LEVURERIE,
    cost: new Decimal(49), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_cost_2') as string]: {
    id: supplierUpgradeId('levurerie_cost_2'),
    name: 'Contrat levurerie II', emoji: '🧫',
    description: 'x0,8 cout - Levurerie',
    targetSupplier: LEVURERIE,
    cost: new Decimal(87), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_rate_3') as string]: {
    id: supplierUpgradeId('levurerie_rate_3'),
    name: 'Culture optimisee III', emoji: '🧫',
    description: 'x3 debit max - Levurerie',
    targetSupplier: LEVURERIE,
    cost: new Decimal(157), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_cost_3') as string]: {
    id: supplierUpgradeId('levurerie_cost_3'),
    name: 'Contrat levurerie III', emoji: '🧫',
    description: 'x0,8 cout - Levurerie',
    targetSupplier: LEVURERIE,
    cost: new Decimal(283), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_rate_4') as string]: {
    id: supplierUpgradeId('levurerie_rate_4'),
    name: 'Culture optimisee IV', emoji: '🧫',
    description: 'x3 debit max - Levurerie',
    targetSupplier: LEVURERIE,
    cost: new Decimal(510), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_cost_4') as string]: {
    id: supplierUpgradeId('levurerie_cost_4'),
    name: 'Contrat levurerie IV', emoji: '🧫',
    description: 'x0,8 cout - Levurerie',
    targetSupplier: LEVURERIE,
    cost: new Decimal(918), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_rate_5') as string]: {
    id: supplierUpgradeId('levurerie_rate_5'),
    name: 'Culture optimisee V', emoji: '🧫',
    description: 'x3 debit max - Levurerie',
    targetSupplier: LEVURERIE,
    cost: new Decimal(1653), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_cost_5') as string]: {
    id: supplierUpgradeId('levurerie_cost_5'),
    name: 'Contrat levurerie V', emoji: '🧫',
    description: 'x0,8 cout - Levurerie',
    targetSupplier: LEVURERIE,
    cost: new Decimal(2975), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_rate_6') as string]: {
    id: supplierUpgradeId('levurerie_rate_6'),
    name: 'Culture optimisee VI', emoji: '🧫',
    description: 'Debit max fixe a 1 000/s - Levurerie',
    targetSupplier: LEVURERIE,
    cost: new Decimal(5356), costResource: PATE_A_PIZZA,
    effectType: 'set_max_rate', effectValue: new Decimal(1000),
    scope: 'pizzas',
  },
}

const supplierUpgradeOrder = [
  // Maraicher italien
  supplierUpgradeId('maraicher_italien_rate_1'),
  supplierUpgradeId('maraicher_italien_cost_1'),
  supplierUpgradeId('maraicher_italien_rate_2'),
  supplierUpgradeId('maraicher_italien_cost_2'),
  supplierUpgradeId('maraicher_italien_rate_3'),
  supplierUpgradeId('maraicher_italien_cost_3'),
  supplierUpgradeId('maraicher_italien_rate_4'),
  supplierUpgradeId('maraicher_italien_cost_4'),
  supplierUpgradeId('maraicher_italien_rate_5'),
  supplierUpgradeId('maraicher_italien_cost_5'),
  supplierUpgradeId('maraicher_italien_rate_6'),
  // Fromagerie napolitaine
  supplierUpgradeId('fromagerie_napolitaine_rate_1'),
  supplierUpgradeId('fromagerie_napolitaine_cost_1'),
  supplierUpgradeId('fromagerie_napolitaine_rate_2'),
  supplierUpgradeId('fromagerie_napolitaine_cost_2'),
  supplierUpgradeId('fromagerie_napolitaine_rate_3'),
  supplierUpgradeId('fromagerie_napolitaine_cost_3'),
  supplierUpgradeId('fromagerie_napolitaine_rate_4'),
  supplierUpgradeId('fromagerie_napolitaine_cost_4'),
  supplierUpgradeId('fromagerie_napolitaine_rate_5'),
  supplierUpgradeId('fromagerie_napolitaine_cost_5'),
  supplierUpgradeId('fromagerie_napolitaine_rate_6'),
  // Moulin sicilien
  supplierUpgradeId('moulin_sicilien_rate_1'),
  supplierUpgradeId('moulin_sicilien_cost_1'),
  supplierUpgradeId('moulin_sicilien_rate_2'),
  supplierUpgradeId('moulin_sicilien_cost_2'),
  supplierUpgradeId('moulin_sicilien_rate_3'),
  supplierUpgradeId('moulin_sicilien_cost_3'),
  supplierUpgradeId('moulin_sicilien_rate_4'),
  supplierUpgradeId('moulin_sicilien_cost_4'),
  supplierUpgradeId('moulin_sicilien_rate_5'),
  supplierUpgradeId('moulin_sicilien_cost_5'),
  supplierUpgradeId('moulin_sicilien_rate_6'),
  // Herboriste
  supplierUpgradeId('herboriste_rate_1'),
  supplierUpgradeId('herboriste_cost_1'),
  supplierUpgradeId('herboriste_rate_2'),
  supplierUpgradeId('herboriste_cost_2'),
  supplierUpgradeId('herboriste_rate_3'),
  supplierUpgradeId('herboriste_cost_3'),
  supplierUpgradeId('herboriste_rate_4'),
  supplierUpgradeId('herboriste_cost_4'),
  supplierUpgradeId('herboriste_rate_5'),
  supplierUpgradeId('herboriste_cost_5'),
  supplierUpgradeId('herboriste_rate_6'),
  // Levurerie
  supplierUpgradeId('levurerie_rate_1'),
  supplierUpgradeId('levurerie_cost_1'),
  supplierUpgradeId('levurerie_rate_2'),
  supplierUpgradeId('levurerie_cost_2'),
  supplierUpgradeId('levurerie_rate_3'),
  supplierUpgradeId('levurerie_cost_3'),
  supplierUpgradeId('levurerie_rate_4'),
  supplierUpgradeId('levurerie_cost_4'),
  supplierUpgradeId('levurerie_rate_5'),
  supplierUpgradeId('levurerie_cost_5'),
  supplierUpgradeId('levurerie_rate_6'),
]

// ─── Milestones → Upgrades ─────────────────────────────────────

const milestonesPotager = generateMilestones(POTAGER, 'preparation_sauce', 'Potager', 'pizzas', SAUCE_TOMATE)
const milestonesPetrinPizza = generateMilestones(PETRIN_PIZZA, 'petrissage', 'Petrin a pizza', 'pizzas', SAUCE_TOMATE)
const milestonesPlanDeTravail = generateMilestones(PLAN_DE_TRAVAIL, 'etalage', 'Plan de travail', 'pizzas', SAUCE_TOMATE)
const milestonesTableGarniture = generateMilestones(TABLE_GARNITURE, 'garnissage', 'Table de garniture', 'pizzas', SAUCE_TOMATE)
const milestonesFourABois = generateMilestones(FOUR_A_BOIS, 'cuisson', 'Four a bois', 'pizzas', SAUCE_TOMATE)
const milestonesPizzeria = generateMilestones(PIZZERIA, 'vente', 'Pizzeria', 'pizzas', SAUCE_TOMATE)

const allPizzaMilestoneUpgrades: Record<string, UpgradeData> = {
  ...milestonesPotager.upgrades,
  ...milestonesPetrinPizza.upgrades,
  ...milestonesPlanDeTravail.upgrades,
  ...milestonesTableGarniture.upgrades,
  ...milestonesFourABois.upgrades,
  ...milestonesPizzeria.upgrades,
}

// ─── Bundle ────────────────────────────────────────────────────

export const PIZZAS_BUNDLE: ProductBundle = {
  definition: {
    id: 'pizzas',
    name: 'Pizzas',
    emoji: '🍕',
    color: 'red',
    unlockCondition: { resource: PANTINS_COINS_ID, amount: new Decimal(10_000_000) },
  },
  resources,
  buildings,
  buildingOrder: [POTAGER, PETRIN_PIZZA, PLAN_DE_TRAVAIL, TABLE_GARNITURE, FOUR_A_BOIS, PIZZERIA],
  buildingUnlockThresholds: {
    [POTAGER as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(500) },
    [PETRIN_PIZZA as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(500) },
    [PLAN_DE_TRAVAIL as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(2_000) },
    [TABLE_GARNITURE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(3_500) },
    [FOUR_A_BOIS as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(6_000) },
    [PIZZERIA as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(15_000) },
  },
  craftingRecipes,
  craftingOrder: [PREPARATION_SAUCE_PIZZA, PETRISSAGE_PIZZA, ETALAGE_PIZZA, GARNISSAGE_PIZZA, CUISSON_PIZZA],
  upgrades: { ...upgrades, ...allPizzaMilestoneUpgrades },
  upgradeOrder: [
    upgradeId('pizza_sauce_rapide'),
    upgradeId('pizza_petrissage_rapide'),
    upgradeId('pizza_etalage_rapide'),
    upgradeId('pizza_garnissage_rapide'),
    upgradeId('pizza_cuisson_rapide'),
    upgradeId('pizza_meilleur_prix'),
    upgradeId('pizza_potager_boost'),
    upgradeId('pizza_petrin_boost'),
    upgradeId('pizza_plan_travail_boost'),
    upgradeId('pizza_four_bois_boost'),
    upgradeId('pizza_global'),
    upgradeId('pizza_achat_en_gros'),
    ...milestonesPotager.upgradeOrder.map(id => upgradeId(id)),
    ...milestonesPetrinPizza.upgradeOrder.map(id => upgradeId(id)),
    ...milestonesPlanDeTravail.upgradeOrder.map(id => upgradeId(id)),
    ...milestonesTableGarniture.upgradeOrder.map(id => upgradeId(id)),
    ...milestonesFourABois.upgradeOrder.map(id => upgradeId(id)),
    ...milestonesPizzeria.upgradeOrder.map(id => upgradeId(id)),
  ],
  suppliers,
  supplierOrder: [MARAICHER_ITALIEN, FROMAGERIE_NAPOLITAINE, MOULIN_SICILIEN, HERBORISTE, LEVURERIE],
  supplierUpgrades,
  supplierUpgradeOrder,
  pipelineConfig,
  passiveRegen: {
    [TOMATES_FRAICHES as string]: new Decimal(0.12),
    [BASILIC as string]: new Decimal(0.10),
    [FARINE_PIZZA as string]: new Decimal(0.15),
    [LEVURE as string]: new Decimal(0.12),
    [MOZZARELLA as string]: new Decimal(0.18),
  },
  finishedProductId: PIZZAS,
  baseSellRate: new Decimal(50),
  milestones: [
    ...milestonesPotager.milestones,
    ...milestonesPetrinPizza.milestones,
    ...milestonesPlanDeTravail.milestones,
    ...milestonesTableGarniture.milestones,
    ...milestonesFourABois.milestones,
    ...milestonesPizzeria.milestones,
  ],
}
