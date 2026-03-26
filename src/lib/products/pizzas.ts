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
    id: TOMATES_FRAICHES, name: 'resources.tomates_fraiches.name', emoji: 'resources.tomates_fraiches.emoji',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(8), scope: 'pizzas',
  },
  [BASILIC as string]: {
    id: BASILIC, name: 'resources.basilic.name', emoji: 'resources.basilic.emoji',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(6), scope: 'pizzas',
  },
  [FARINE_PIZZA as string]: {
    id: FARINE_PIZZA, name: 'resources.farine_pizza.name', emoji: 'resources.farine_pizza.emoji',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(10), scope: 'pizzas',
  },
  [LEVURE as string]: {
    id: LEVURE, name: 'resources.levure.name', emoji: 'resources.levure.emoji',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(8), scope: 'pizzas',
  },
  [MOZZARELLA as string]: {
    id: MOZZARELLA, name: 'resources.mozzarella.name', emoji: 'resources.mozzarella.emoji',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(6), scope: 'pizzas',
  },
  [SAUCE_TOMATE as string]: {
    id: SAUCE_TOMATE, name: 'resources.sauce_tomate.name', emoji: 'resources.sauce_tomate.emoji',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pizzas',
  },
  [PATE_A_PIZZA as string]: {
    id: PATE_A_PIZZA, name: 'resources.pate_a_pizza.name', emoji: 'resources.pate_a_pizza.emoji',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pizzas',
  },
  [PATE_ETALEE as string]: {
    id: PATE_ETALEE, name: 'resources.pate_etalee.name', emoji: 'resources.pate_etalee.emoji',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pizzas',
  },
  [PIZZA_GARNIE as string]: {
    id: PIZZA_GARNIE, name: 'resources.pizza_garnie.name', emoji: 'resources.pizza_garnie.emoji',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pizzas',
  },
  [PIZZAS as string]: {
    id: PIZZAS, name: 'shared_resources.pizzas.name', emoji: 'shared_resources.pizzas.emoji',
    category: 'produit_fini', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pizzas',
  },
}

// ─── Buildings ─────────────────────────────────────────────────
const buildings: Record<string, BuildingData> = {
  [POTAGER as string]: {
    id: POTAGER, name: 'buildings.potager.name', emoji: 'buildings.potager.emoji',
    description: 'buildings.potager.description',
    baseCost: new Decimal(1_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.25),
    producedResource: SAUCE_TOMATE, pipelineRole: 'preparation_sauce', scope: 'pizzas',
    aura: {
      effectType: 'ingredient_generation_bonus', bonusPerBuilding: new Decimal(0.05),
      description: 'buildings.potager.aura_description',
    },
  },
  [PETRIN_PIZZA as string]: {
    id: PETRIN_PIZZA, name: 'buildings.petrin_pizza.name', emoji: 'buildings.petrin_pizza.emoji',
    description: 'buildings.petrin_pizza.description',
    baseCost: new Decimal(2_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.35),
    producedResource: PATE_A_PIZZA, pipelineRole: 'petrissage', scope: 'pizzas',
    aura: {
      effectType: 'crafting_speed_bonus', bonusPerBuilding: new Decimal(0.03),
      description: 'buildings.petrin_pizza.aura_description',
    },
  },
  [PLAN_DE_TRAVAIL as string]: {
    id: PLAN_DE_TRAVAIL, name: 'buildings.plan_de_travail.name', emoji: 'buildings.plan_de_travail.emoji',
    description: 'buildings.plan_de_travail.description',
    baseCost: new Decimal(5_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.5),
    producedResource: PATE_ETALEE, pipelineRole: 'etalage', scope: 'pizzas',
    aura: {
      effectType: 'crafting_speed_bonus', bonusPerBuilding: new Decimal(0.02),
      description: 'buildings.plan_de_travail.aura_description',
    },
  },
  [TABLE_GARNITURE as string]: {
    id: TABLE_GARNITURE, name: 'buildings.table_garniture.name', emoji: 'buildings.table_garniture.emoji',
    description: 'buildings.table_garniture.description',
    baseCost: new Decimal(8_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.4),
    producedResource: PIZZA_GARNIE, pipelineRole: 'garnissage', scope: 'pizzas',
    aura: {
      effectType: 'ingredient_generation_bonus', bonusPerBuilding: new Decimal(0.03),
      targetResource: 'mozzarella', description: 'buildings.table_garniture.aura_description',
    },
  },
  [FOUR_A_BOIS as string]: {
    id: FOUR_A_BOIS, name: 'buildings.four_a_bois.name', emoji: 'buildings.four_a_bois.emoji',
    description: 'buildings.four_a_bois.description',
    baseCost: new Decimal(15_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(1.2),
    producedResource: PIZZAS, pipelineRole: 'cuisson', scope: 'pizzas',
    aura: {
      effectType: 'sell_price_bonus', bonusPerBuilding: new Decimal(0.03),
      targetProduct: 'pizzas', description: 'buildings.four_a_bois.aura_description',
    },
  },
  [PIZZERIA as string]: {
    id: PIZZERIA, name: 'buildings.pizzeria.name', emoji: 'buildings.pizzeria.emoji',
    description: 'buildings.pizzeria.description',
    baseCost: new Decimal(40_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.7),
    producedResource: PANTINS_COINS_ID, pipelineRole: 'vente', scope: 'pizzas',
    aura: {
      effectType: 'sell_price_bonus', bonusPerBuilding: new Decimal(0.01),
      description: 'buildings.pizzeria.aura_description',
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
        { resource: PANTINS_COINS_ID, ratio: new Decimal(4) },
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
    id: PREPARATION_SAUCE_PIZZA, name: 'crafting.preparation_sauce_pizza.name', emoji: 'crafting.preparation_sauce_pizza.emoji',
    verb: 'crafting.preparation_sauce_pizza.verb',
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
    id: PETRISSAGE_PIZZA, name: 'crafting.petrissage_pizza.name', emoji: 'crafting.petrissage_pizza.emoji',
    verb: 'crafting.petrissage_pizza.verb',
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
    id: ETALAGE_PIZZA, name: 'crafting.etalage_pizza.name', emoji: 'crafting.etalage_pizza.emoji',
    verb: 'crafting.etalage_pizza.verb',
    inputs: [
      { resource: PATE_A_PIZZA, amount: new Decimal(2) },
    ],
    output: { resource: PATE_ETALEE, amount: new Decimal(2) },
    durationSeconds: 3,
    scope: 'pizzas',
    linkedBuildingId: PLAN_DE_TRAVAIL,
  },
  [GARNISSAGE_PIZZA as string]: {
    id: GARNISSAGE_PIZZA, name: 'crafting.garnissage_pizza.name', emoji: 'crafting.garnissage_pizza.emoji',
    verb: 'crafting.garnissage_pizza.verb',
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
    id: CUISSON_PIZZA, name: 'crafting.cuisson_pizza.name', emoji: 'crafting.cuisson_pizza.emoji',
    verb: 'crafting.cuisson_pizza.verb',
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
    id: upgradeId('pizza_sauce_rapide'), name: 'upgrades.pizza_sauce_rapide.name',
    description: 'upgrades.pizza_sauce_rapide.description', emoji: 'upgrades.pizza_sauce_rapide.emoji',
    cost: new Decimal(80_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: PREPARATION_SAUCE_PIZZA, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: SAUCE_TOMATE, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_petrissage_rapide: {
    id: upgradeId('pizza_petrissage_rapide'), name: 'upgrades.pizza_petrissage_rapide.name',
    description: 'upgrades.pizza_petrissage_rapide.description', emoji: 'upgrades.pizza_petrissage_rapide.emoji',
    cost: new Decimal(120_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: PETRISSAGE_PIZZA, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PATE_A_PIZZA, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_etalage_rapide: {
    id: upgradeId('pizza_etalage_rapide'), name: 'upgrades.pizza_etalage_rapide.name',
    description: 'upgrades.pizza_etalage_rapide.description', emoji: 'upgrades.pizza_etalage_rapide.emoji',
    cost: new Decimal(150_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: ETALAGE_PIZZA, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PATE_ETALEE, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_garnissage_rapide: {
    id: upgradeId('pizza_garnissage_rapide'), name: 'upgrades.pizza_garnissage_rapide.name',
    description: 'upgrades.pizza_garnissage_rapide.description', emoji: 'upgrades.pizza_garnissage_rapide.emoji',
    cost: new Decimal(180_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: GARNISSAGE_PIZZA, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PIZZA_GARNIE, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_cuisson_rapide: {
    id: upgradeId('pizza_cuisson_rapide'), name: 'upgrades.pizza_cuisson_rapide.name',
    description: 'upgrades.pizza_cuisson_rapide.description', emoji: 'upgrades.pizza_cuisson_rapide.emoji',
    cost: new Decimal(200_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: CUISSON_PIZZA, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PIZZAS, threshold: new Decimal(10) },
    scope: 'pizzas',
  },
  pizza_meilleur_prix: {
    id: upgradeId('pizza_meilleur_prix'), name: 'upgrades.pizza_meilleur_prix.name',
    description: 'upgrades.pizza_meilleur_prix.description', emoji: 'upgrades.pizza_meilleur_prix.emoji',
    cost: new Decimal(400_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'sell_multiplier', multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(200_000) },
    scope: 'pizzas',
  },
  pizza_potager_boost: {
    id: upgradeId('pizza_potager_boost'), name: 'upgrades.pizza_potager_boost.name',
    description: 'upgrades.pizza_potager_boost.description', emoji: 'upgrades.pizza_potager_boost.emoji',
    cost: new Decimal(150_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: POTAGER, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: POTAGER, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_petrin_boost: {
    id: upgradeId('pizza_petrin_boost'), name: 'upgrades.pizza_petrin_boost.name',
    description: 'upgrades.pizza_petrin_boost.description', emoji: 'upgrades.pizza_petrin_boost.emoji',
    cost: new Decimal(300_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: PETRIN_PIZZA, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: PETRIN_PIZZA, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_plan_travail_boost: {
    id: upgradeId('pizza_plan_travail_boost'), name: 'upgrades.pizza_plan_travail_boost.name',
    description: 'upgrades.pizza_plan_travail_boost.description', emoji: 'upgrades.pizza_plan_travail_boost.emoji',
    cost: new Decimal(600_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: PLAN_DE_TRAVAIL, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: PLAN_DE_TRAVAIL, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_four_bois_boost: {
    id: upgradeId('pizza_four_bois_boost'), name: 'upgrades.pizza_four_bois_boost.name',
    description: 'upgrades.pizza_four_bois_boost.description', emoji: 'upgrades.pizza_four_bois_boost.emoji',
    cost: new Decimal(1_200_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: FOUR_A_BOIS, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: FOUR_A_BOIS, threshold: new Decimal(5) },
    scope: 'pizzas',
  },
  pizza_global: {
    id: upgradeId('pizza_global'), name: 'upgrades.pizza_global.name',
    description: 'upgrades.pizza_global.description', emoji: 'upgrades.pizza_global.emoji',
    cost: new Decimal(800_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'global_multiplier', multiplier: new Decimal(1.5) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(400_000) },
    scope: 'pizzas',
  },
  pizza_achat_en_gros: {
    id: upgradeId('pizza_achat_en_gros'), name: 'upgrades.pizza_achat_en_gros.name',
    description: 'upgrades.pizza_achat_en_gros.description', emoji: 'upgrades.pizza_achat_en_gros.emoji',
    cost: new Decimal(1_500_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'cost_reduction', multiplier: new Decimal(0.85) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(750_000) },
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
    id: MARAICHER_ITALIEN, name: 'suppliers.maraicher_italien.name', emoji: 'suppliers.maraicher_italien.emoji',
    description: 'suppliers.maraicher_italien.description',
    producedResource: TOMATES_FRAICHES,
    baseMaxRate: new Decimal(2), baseCostPerSecond: new Decimal(12),
    contractCost: new Decimal(50_000), scope: 'pizzas',
  },
  [FROMAGERIE_NAPOLITAINE as string]: {
    id: FROMAGERIE_NAPOLITAINE, name: 'suppliers.fromagerie_napolitaine.name', emoji: 'suppliers.fromagerie_napolitaine.emoji',
    description: 'suppliers.fromagerie_napolitaine.description',
    producedResource: MOZZARELLA,
    baseMaxRate: new Decimal(2.5), baseCostPerSecond: new Decimal(15),
    contractCost: new Decimal(80_000), scope: 'pizzas',
  },
  [MOULIN_SICILIEN as string]: {
    id: MOULIN_SICILIEN, name: 'suppliers.moulin_sicilien.name', emoji: 'suppliers.moulin_sicilien.emoji',
    description: 'suppliers.moulin_sicilien.description',
    producedResource: FARINE_PIZZA,
    baseMaxRate: new Decimal(3), baseCostPerSecond: new Decimal(18),
    contractCost: new Decimal(60_000), scope: 'pizzas',
  },
  [HERBORISTE as string]: {
    id: HERBORISTE, name: 'suppliers.herboriste.name', emoji: 'suppliers.herboriste.emoji',
    description: 'suppliers.herboriste.description',
    producedResource: BASILIC,
    baseMaxRate: new Decimal(1.5), baseCostPerSecond: new Decimal(9),
    contractCost: new Decimal(40_000), scope: 'pizzas',
  },
  [LEVURERIE as string]: {
    id: LEVURERIE, name: 'suppliers.levurerie.name', emoji: 'suppliers.levurerie.emoji',
    description: 'suppliers.levurerie.description',
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
    name: 'supplier_upgrades.maraicher_italien_rate.name', emoji: 'supplier_upgrades.maraicher_italien_rate.emoji',
    description: 'supplier_upgrades.maraicher_italien_rate.description',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(20), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_cost_1') as string]: {
    id: supplierUpgradeId('maraicher_italien_cost_1'),
    name: 'supplier_upgrades.maraicher_italien_cost.name', emoji: 'supplier_upgrades.maraicher_italien_cost.emoji',
    description: 'supplier_upgrades.maraicher_italien_cost.description',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(36), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_rate_2') as string]: {
    id: supplierUpgradeId('maraicher_italien_rate_2'),
    name: 'supplier_upgrades.maraicher_italien_rate.name', emoji: 'supplier_upgrades.maraicher_italien_rate.emoji',
    description: 'supplier_upgrades.maraicher_italien_rate.description',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(65), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_cost_2') as string]: {
    id: supplierUpgradeId('maraicher_italien_cost_2'),
    name: 'supplier_upgrades.maraicher_italien_cost.name', emoji: 'supplier_upgrades.maraicher_italien_cost.emoji',
    description: 'supplier_upgrades.maraicher_italien_cost.description',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(117), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_rate_3') as string]: {
    id: supplierUpgradeId('maraicher_italien_rate_3'),
    name: 'supplier_upgrades.maraicher_italien_rate.name', emoji: 'supplier_upgrades.maraicher_italien_rate.emoji',
    description: 'supplier_upgrades.maraicher_italien_rate.description',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(210), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_cost_3') as string]: {
    id: supplierUpgradeId('maraicher_italien_cost_3'),
    name: 'supplier_upgrades.maraicher_italien_cost.name', emoji: 'supplier_upgrades.maraicher_italien_cost.emoji',
    description: 'supplier_upgrades.maraicher_italien_cost.description',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(378), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_rate_4') as string]: {
    id: supplierUpgradeId('maraicher_italien_rate_4'),
    name: 'supplier_upgrades.maraicher_italien_rate.name', emoji: 'supplier_upgrades.maraicher_italien_rate.emoji',
    description: 'supplier_upgrades.maraicher_italien_rate.description',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(680), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_cost_4') as string]: {
    id: supplierUpgradeId('maraicher_italien_cost_4'),
    name: 'supplier_upgrades.maraicher_italien_cost.name', emoji: 'supplier_upgrades.maraicher_italien_cost.emoji',
    description: 'supplier_upgrades.maraicher_italien_cost.description',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(1224), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_rate_5') as string]: {
    id: supplierUpgradeId('maraicher_italien_rate_5'),
    name: 'supplier_upgrades.maraicher_italien_rate.name', emoji: 'supplier_upgrades.maraicher_italien_rate.emoji',
    description: 'supplier_upgrades.maraicher_italien_rate.description',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(2204), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_cost_5') as string]: {
    id: supplierUpgradeId('maraicher_italien_cost_5'),
    name: 'supplier_upgrades.maraicher_italien_cost.name', emoji: 'supplier_upgrades.maraicher_italien_cost.emoji',
    description: 'supplier_upgrades.maraicher_italien_cost.description',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(3967), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('maraicher_italien_rate_6') as string]: {
    id: supplierUpgradeId('maraicher_italien_rate_6'),
    name: 'supplier_upgrades.maraicher_italien_rate.name', emoji: 'supplier_upgrades.maraicher_italien_rate.emoji',
    description: 'supplier_upgrades.maraicher_italien_rate.description',
    targetSupplier: MARAICHER_ITALIEN,
    cost: new Decimal(7141), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },

  // ── Fromagerie napolitaine (baseCost=25, costGrowth=1.8, costResource=PIZZA_GARNIE) ──
  [supplierUpgradeId('fromagerie_napolitaine_rate_1') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_rate_1'),
    name: 'supplier_upgrades.fromagerie_napolitaine_rate.name', emoji: 'supplier_upgrades.fromagerie_napolitaine_rate.emoji',
    description: 'supplier_upgrades.fromagerie_napolitaine_rate.description',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(25), costResource: PIZZA_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_cost_1') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_cost_1'),
    name: 'supplier_upgrades.fromagerie_napolitaine_cost.name', emoji: 'supplier_upgrades.fromagerie_napolitaine_cost.emoji',
    description: 'supplier_upgrades.fromagerie_napolitaine_cost.description',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(45), costResource: PIZZA_GARNIE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_rate_2') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_rate_2'),
    name: 'supplier_upgrades.fromagerie_napolitaine_rate.name', emoji: 'supplier_upgrades.fromagerie_napolitaine_rate.emoji',
    description: 'supplier_upgrades.fromagerie_napolitaine_rate.description',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(81), costResource: PIZZA_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_cost_2') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_cost_2'),
    name: 'supplier_upgrades.fromagerie_napolitaine_cost.name', emoji: 'supplier_upgrades.fromagerie_napolitaine_cost.emoji',
    description: 'supplier_upgrades.fromagerie_napolitaine_cost.description',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(146), costResource: PIZZA_GARNIE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_rate_3') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_rate_3'),
    name: 'supplier_upgrades.fromagerie_napolitaine_rate.name', emoji: 'supplier_upgrades.fromagerie_napolitaine_rate.emoji',
    description: 'supplier_upgrades.fromagerie_napolitaine_rate.description',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(262), costResource: PIZZA_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_cost_3') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_cost_3'),
    name: 'supplier_upgrades.fromagerie_napolitaine_cost.name', emoji: 'supplier_upgrades.fromagerie_napolitaine_cost.emoji',
    description: 'supplier_upgrades.fromagerie_napolitaine_cost.description',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(472), costResource: PIZZA_GARNIE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_rate_4') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_rate_4'),
    name: 'supplier_upgrades.fromagerie_napolitaine_rate.name', emoji: 'supplier_upgrades.fromagerie_napolitaine_rate.emoji',
    description: 'supplier_upgrades.fromagerie_napolitaine_rate.description',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(850), costResource: PIZZA_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_cost_4') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_cost_4'),
    name: 'supplier_upgrades.fromagerie_napolitaine_cost.name', emoji: 'supplier_upgrades.fromagerie_napolitaine_cost.emoji',
    description: 'supplier_upgrades.fromagerie_napolitaine_cost.description',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(1531), costResource: PIZZA_GARNIE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_rate_5') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_rate_5'),
    name: 'supplier_upgrades.fromagerie_napolitaine_rate.name', emoji: 'supplier_upgrades.fromagerie_napolitaine_rate.emoji',
    description: 'supplier_upgrades.fromagerie_napolitaine_rate.description',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(2755), costResource: PIZZA_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_cost_5') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_cost_5'),
    name: 'supplier_upgrades.fromagerie_napolitaine_cost.name', emoji: 'supplier_upgrades.fromagerie_napolitaine_cost.emoji',
    description: 'supplier_upgrades.fromagerie_napolitaine_cost.description',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(4959), costResource: PIZZA_GARNIE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('fromagerie_napolitaine_rate_6') as string]: {
    id: supplierUpgradeId('fromagerie_napolitaine_rate_6'),
    name: 'supplier_upgrades.fromagerie_napolitaine_rate.name', emoji: 'supplier_upgrades.fromagerie_napolitaine_rate.emoji',
    description: 'supplier_upgrades.fromagerie_napolitaine_rate.description',
    targetSupplier: FROMAGERIE_NAPOLITAINE,
    cost: new Decimal(8926), costResource: PIZZA_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },

  // ── Moulin sicilien (baseCost=25, costGrowth=2.0, costResource=PATE_A_PIZZA) ──
  [supplierUpgradeId('moulin_sicilien_rate_1') as string]: {
    id: supplierUpgradeId('moulin_sicilien_rate_1'),
    name: 'supplier_upgrades.moulin_sicilien_rate.name', emoji: 'supplier_upgrades.moulin_sicilien_rate.emoji',
    description: 'supplier_upgrades.moulin_sicilien_rate.description',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(25), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_cost_1') as string]: {
    id: supplierUpgradeId('moulin_sicilien_cost_1'),
    name: 'supplier_upgrades.moulin_sicilien_cost.name', emoji: 'supplier_upgrades.moulin_sicilien_cost.emoji',
    description: 'supplier_upgrades.moulin_sicilien_cost.description',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(50), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_rate_2') as string]: {
    id: supplierUpgradeId('moulin_sicilien_rate_2'),
    name: 'supplier_upgrades.moulin_sicilien_rate.name', emoji: 'supplier_upgrades.moulin_sicilien_rate.emoji',
    description: 'supplier_upgrades.moulin_sicilien_rate.description',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(100), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_cost_2') as string]: {
    id: supplierUpgradeId('moulin_sicilien_cost_2'),
    name: 'supplier_upgrades.moulin_sicilien_cost.name', emoji: 'supplier_upgrades.moulin_sicilien_cost.emoji',
    description: 'supplier_upgrades.moulin_sicilien_cost.description',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(200), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_rate_3') as string]: {
    id: supplierUpgradeId('moulin_sicilien_rate_3'),
    name: 'supplier_upgrades.moulin_sicilien_rate.name', emoji: 'supplier_upgrades.moulin_sicilien_rate.emoji',
    description: 'supplier_upgrades.moulin_sicilien_rate.description',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(400), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_cost_3') as string]: {
    id: supplierUpgradeId('moulin_sicilien_cost_3'),
    name: 'supplier_upgrades.moulin_sicilien_cost.name', emoji: 'supplier_upgrades.moulin_sicilien_cost.emoji',
    description: 'supplier_upgrades.moulin_sicilien_cost.description',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(800), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_rate_4') as string]: {
    id: supplierUpgradeId('moulin_sicilien_rate_4'),
    name: 'supplier_upgrades.moulin_sicilien_rate.name', emoji: 'supplier_upgrades.moulin_sicilien_rate.emoji',
    description: 'supplier_upgrades.moulin_sicilien_rate.description',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(1600), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_cost_4') as string]: {
    id: supplierUpgradeId('moulin_sicilien_cost_4'),
    name: 'supplier_upgrades.moulin_sicilien_cost.name', emoji: 'supplier_upgrades.moulin_sicilien_cost.emoji',
    description: 'supplier_upgrades.moulin_sicilien_cost.description',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(3200), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_rate_5') as string]: {
    id: supplierUpgradeId('moulin_sicilien_rate_5'),
    name: 'supplier_upgrades.moulin_sicilien_rate.name', emoji: 'supplier_upgrades.moulin_sicilien_rate.emoji',
    description: 'supplier_upgrades.moulin_sicilien_rate.description',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(6400), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_cost_5') as string]: {
    id: supplierUpgradeId('moulin_sicilien_cost_5'),
    name: 'supplier_upgrades.moulin_sicilien_cost.name', emoji: 'supplier_upgrades.moulin_sicilien_cost.emoji',
    description: 'supplier_upgrades.moulin_sicilien_cost.description',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(12800), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('moulin_sicilien_rate_6') as string]: {
    id: supplierUpgradeId('moulin_sicilien_rate_6'),
    name: 'supplier_upgrades.moulin_sicilien_rate.name', emoji: 'supplier_upgrades.moulin_sicilien_rate.emoji',
    description: 'supplier_upgrades.moulin_sicilien_rate.description',
    targetSupplier: MOULIN_SICILIEN,
    cost: new Decimal(25600), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },

  // ── Herboriste (baseCost=10, costGrowth=2.1, costResource=SAUCE_TOMATE) ──
  [supplierUpgradeId('herboriste_rate_1') as string]: {
    id: supplierUpgradeId('herboriste_rate_1'),
    name: 'supplier_upgrades.herboriste_rate.name', emoji: 'supplier_upgrades.herboriste_rate.emoji',
    description: 'supplier_upgrades.herboriste_rate.description',
    targetSupplier: HERBORISTE,
    cost: new Decimal(10), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_cost_1') as string]: {
    id: supplierUpgradeId('herboriste_cost_1'),
    name: 'supplier_upgrades.herboriste_cost.name', emoji: 'supplier_upgrades.herboriste_cost.emoji',
    description: 'supplier_upgrades.herboriste_cost.description',
    targetSupplier: HERBORISTE,
    cost: new Decimal(21), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_rate_2') as string]: {
    id: supplierUpgradeId('herboriste_rate_2'),
    name: 'supplier_upgrades.herboriste_rate.name', emoji: 'supplier_upgrades.herboriste_rate.emoji',
    description: 'supplier_upgrades.herboriste_rate.description',
    targetSupplier: HERBORISTE,
    cost: new Decimal(44), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_cost_2') as string]: {
    id: supplierUpgradeId('herboriste_cost_2'),
    name: 'supplier_upgrades.herboriste_cost.name', emoji: 'supplier_upgrades.herboriste_cost.emoji',
    description: 'supplier_upgrades.herboriste_cost.description',
    targetSupplier: HERBORISTE,
    cost: new Decimal(92), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_rate_3') as string]: {
    id: supplierUpgradeId('herboriste_rate_3'),
    name: 'supplier_upgrades.herboriste_rate.name', emoji: 'supplier_upgrades.herboriste_rate.emoji',
    description: 'supplier_upgrades.herboriste_rate.description',
    targetSupplier: HERBORISTE,
    cost: new Decimal(194), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_cost_3') as string]: {
    id: supplierUpgradeId('herboriste_cost_3'),
    name: 'supplier_upgrades.herboriste_cost.name', emoji: 'supplier_upgrades.herboriste_cost.emoji',
    description: 'supplier_upgrades.herboriste_cost.description',
    targetSupplier: HERBORISTE,
    cost: new Decimal(407), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_rate_4') as string]: {
    id: supplierUpgradeId('herboriste_rate_4'),
    name: 'supplier_upgrades.herboriste_rate.name', emoji: 'supplier_upgrades.herboriste_rate.emoji',
    description: 'supplier_upgrades.herboriste_rate.description',
    targetSupplier: HERBORISTE,
    cost: new Decimal(855), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_cost_4') as string]: {
    id: supplierUpgradeId('herboriste_cost_4'),
    name: 'supplier_upgrades.herboriste_cost.name', emoji: 'supplier_upgrades.herboriste_cost.emoji',
    description: 'supplier_upgrades.herboriste_cost.description',
    targetSupplier: HERBORISTE,
    cost: new Decimal(1795), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_rate_5') as string]: {
    id: supplierUpgradeId('herboriste_rate_5'),
    name: 'supplier_upgrades.herboriste_rate.name', emoji: 'supplier_upgrades.herboriste_rate.emoji',
    description: 'supplier_upgrades.herboriste_rate.description',
    targetSupplier: HERBORISTE,
    cost: new Decimal(3769), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_cost_5') as string]: {
    id: supplierUpgradeId('herboriste_cost_5'),
    name: 'supplier_upgrades.herboriste_cost.name', emoji: 'supplier_upgrades.herboriste_cost.emoji',
    description: 'supplier_upgrades.herboriste_cost.description',
    targetSupplier: HERBORISTE,
    cost: new Decimal(7915), costResource: SAUCE_TOMATE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('herboriste_rate_6') as string]: {
    id: supplierUpgradeId('herboriste_rate_6'),
    name: 'supplier_upgrades.herboriste_rate.name', emoji: 'supplier_upgrades.herboriste_rate.emoji',
    description: 'supplier_upgrades.herboriste_rate.description',
    targetSupplier: HERBORISTE,
    cost: new Decimal(16621), costResource: SAUCE_TOMATE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },

  // ── Levurerie (baseCost=12, costGrowth=2.2, costResource=PATE_A_PIZZA) ──
  [supplierUpgradeId('levurerie_rate_1') as string]: {
    id: supplierUpgradeId('levurerie_rate_1'),
    name: 'supplier_upgrades.levurerie_rate.name', emoji: 'supplier_upgrades.levurerie_rate.emoji',
    description: 'supplier_upgrades.levurerie_rate.description',
    targetSupplier: LEVURERIE,
    cost: new Decimal(12), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_cost_1') as string]: {
    id: supplierUpgradeId('levurerie_cost_1'),
    name: 'supplier_upgrades.levurerie_cost.name', emoji: 'supplier_upgrades.levurerie_cost.emoji',
    description: 'supplier_upgrades.levurerie_cost.description',
    targetSupplier: LEVURERIE,
    cost: new Decimal(26), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_rate_2') as string]: {
    id: supplierUpgradeId('levurerie_rate_2'),
    name: 'supplier_upgrades.levurerie_rate.name', emoji: 'supplier_upgrades.levurerie_rate.emoji',
    description: 'supplier_upgrades.levurerie_rate.description',
    targetSupplier: LEVURERIE,
    cost: new Decimal(58), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_cost_2') as string]: {
    id: supplierUpgradeId('levurerie_cost_2'),
    name: 'supplier_upgrades.levurerie_cost.name', emoji: 'supplier_upgrades.levurerie_cost.emoji',
    description: 'supplier_upgrades.levurerie_cost.description',
    targetSupplier: LEVURERIE,
    cost: new Decimal(127), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_rate_3') as string]: {
    id: supplierUpgradeId('levurerie_rate_3'),
    name: 'supplier_upgrades.levurerie_rate.name', emoji: 'supplier_upgrades.levurerie_rate.emoji',
    description: 'supplier_upgrades.levurerie_rate.description',
    targetSupplier: LEVURERIE,
    cost: new Decimal(280), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_cost_3') as string]: {
    id: supplierUpgradeId('levurerie_cost_3'),
    name: 'supplier_upgrades.levurerie_cost.name', emoji: 'supplier_upgrades.levurerie_cost.emoji',
    description: 'supplier_upgrades.levurerie_cost.description',
    targetSupplier: LEVURERIE,
    cost: new Decimal(616), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_rate_4') as string]: {
    id: supplierUpgradeId('levurerie_rate_4'),
    name: 'supplier_upgrades.levurerie_rate.name', emoji: 'supplier_upgrades.levurerie_rate.emoji',
    description: 'supplier_upgrades.levurerie_rate.description',
    targetSupplier: LEVURERIE,
    cost: new Decimal(1355), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_cost_4') as string]: {
    id: supplierUpgradeId('levurerie_cost_4'),
    name: 'supplier_upgrades.levurerie_cost.name', emoji: 'supplier_upgrades.levurerie_cost.emoji',
    description: 'supplier_upgrades.levurerie_cost.description',
    targetSupplier: LEVURERIE,
    cost: new Decimal(2981), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_rate_5') as string]: {
    id: supplierUpgradeId('levurerie_rate_5'),
    name: 'supplier_upgrades.levurerie_rate.name', emoji: 'supplier_upgrades.levurerie_rate.emoji',
    description: 'supplier_upgrades.levurerie_rate.description',
    targetSupplier: LEVURERIE,
    cost: new Decimal(6558), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_cost_5') as string]: {
    id: supplierUpgradeId('levurerie_cost_5'),
    name: 'supplier_upgrades.levurerie_cost.name', emoji: 'supplier_upgrades.levurerie_cost.emoji',
    description: 'supplier_upgrades.levurerie_cost.description',
    targetSupplier: LEVURERIE,
    cost: new Decimal(14428), costResource: PATE_A_PIZZA,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pizzas',
  },
  [supplierUpgradeId('levurerie_rate_6') as string]: {
    id: supplierUpgradeId('levurerie_rate_6'),
    name: 'supplier_upgrades.levurerie_rate.name', emoji: 'supplier_upgrades.levurerie_rate.emoji',
    description: 'supplier_upgrades.levurerie_rate.description',
    targetSupplier: LEVURERIE,
    cost: new Decimal(31742), costResource: PATE_A_PIZZA,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
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

const milestonesPotager = generateMilestones(POTAGER, 'preparation_sauce', 'Potager', 'pizzas', SAUCE_TOMATE, 60)
const milestonesPetrinPizza = generateMilestones(PETRIN_PIZZA, 'petrissage', 'Petrin a pizza', 'pizzas', SAUCE_TOMATE, 120)
const milestonesPlanDeTravail = generateMilestones(PLAN_DE_TRAVAIL, 'etalage', 'Plan de travail', 'pizzas', SAUCE_TOMATE, 300)
const milestonesTableGarniture = generateMilestones(TABLE_GARNITURE, 'garnissage', 'Table de garniture', 'pizzas', SAUCE_TOMATE, 500)
const milestonesFourABois = generateMilestones(FOUR_A_BOIS, 'cuisson', 'Four a bois', 'pizzas', SAUCE_TOMATE, 1000)
const milestonesPizzeria = generateMilestones(PIZZERIA, 'vente', 'Pizzeria', 'pizzas', SAUCE_TOMATE, 2500)

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
    name: 'definition.name',
    emoji: 'definition.emoji',
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
