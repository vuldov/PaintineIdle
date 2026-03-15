import Decimal from 'decimal.js'
import { resourceId, buildingId, craftingRecipeId, upgradeId, PANTINS_COINS_ID } from '@/types'
import type { ProductBundle, ResourceData, BuildingData, CraftingRecipeData, UpgradeData, PipelineStageConfig } from '@/types'

// ─── Resource IDs ──────────────────────────────────────────────
const SAUCE_TOMATE = resourceId('sauce_tomate')
const MOZZARELLA = resourceId('mozzarella')
const PATE_A_PIZZA = resourceId('pate_a_pizza')
const PIZZAS = resourceId('pizzas')

// ─── Building IDs ──────────────────────────────────────────────
const POTAGER = buildingId('potager')
const PETRIN_PIZZA = buildingId('petrin_pizza')
const FOUR_A_BOIS = buildingId('four_a_bois')
const PIZZERIA = buildingId('pizzeria')
const LABO_RECETTES = buildingId('labo_recettes')
const USINE_PIZZA = buildingId('usine_pizza')
const CHAINE_PIZZERIAS = buildingId('chaine_pizzerias')
const EMPIRE_PIZZA = buildingId('empire_pizza')

// ─── Resources ─────────────────────────────────────────────────
const resources: Record<string, ResourceData> = {
  [SAUCE_TOMATE as string]: {
    id: SAUCE_TOMATE, name: 'Sauce tomate', emoji: '🍅',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(6), scope: 'pizzas',
  },
  [MOZZARELLA as string]: {
    id: MOZZARELLA, name: 'Mozzarella', emoji: '🧀',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(8), scope: 'pizzas',
  },
  [PATE_A_PIZZA as string]: {
    id: PATE_A_PIZZA, name: 'Pâte à pizza', emoji: '🫓',
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
    description: 'Cuit la pâte à pizza en pizzas',
    baseCost: new Decimal(1_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.25),
    producedResource: PIZZAS, pipelineRole: 'cuisson', scope: 'pizzas',
  },
  [PETRIN_PIZZA as string]: {
    id: PETRIN_PIZZA, name: 'Pétrin à pizza', emoji: '⚙️',
    description: 'Mélange sauce tomate et mozzarella en pâte',
    baseCost: new Decimal(2_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.35),
    producedResource: PATE_A_PIZZA, pipelineRole: 'petrissage', scope: 'pizzas',
  },
  [FOUR_A_BOIS as string]: {
    id: FOUR_A_BOIS, name: 'Four à bois', emoji: '🔥',
    description: 'Cuisson authentique au feu de bois',
    baseCost: new Decimal(12_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(1.2),
    producedResource: PIZZAS, pipelineRole: 'cuisson', scope: 'pizzas',
  },
  [PIZZERIA as string]: {
    id: PIZZERIA, name: 'Pizzeria', emoji: '🏪',
    description: 'Vend automatiquement les pizzas',
    baseCost: new Decimal(35_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.7),
    producedResource: PANTINS_COINS_ID, pipelineRole: 'vente', scope: 'pizzas',
  },
  [LABO_RECETTES as string]: {
    id: LABO_RECETTES, name: 'Labo recettes', emoji: '🔬',
    description: 'Génère de la sauce tomate et de la mozzarella',
    baseCost: new Decimal(100_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(1.2),
    producedResource: SAUCE_TOMATE, pipelineRole: 'ingredients', scope: 'pizzas',
  },
  [USINE_PIZZA as string]: {
    id: USINE_PIZZA, name: 'Usine à pizza', emoji: '🏭',
    description: 'Production industrielle complète',
    baseCost: new Decimal(750_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(3.5),
    producedResource: PIZZAS, pipelineRole: 'full_pipeline', scope: 'pizzas',
  },
  [CHAINE_PIZZERIAS as string]: {
    id: CHAINE_PIZZERIAS, name: 'Chaîne pizzerias', emoji: '🗺️',
    description: 'Réseau national de pizzerias',
    baseCost: new Decimal(4_000_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(7),
    producedResource: PANTINS_COINS_ID, pipelineRole: 'vente', scope: 'pizzas',
  },
  [EMPIRE_PIZZA as string]: {
    id: EMPIRE_PIZZA, name: 'Empire pizza', emoji: '🌍',
    description: 'Domination mondiale de la pizza',
    baseCost: new Decimal(40_000_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(35),
    producedResource: PIZZAS, pipelineRole: 'full_pipeline', scope: 'pizzas',
  },
}

// ─── Pipeline config ───────────────────────────────────────────
const pipelineConfig: { stages: PipelineStageConfig[] } = {
  stages: [
    {
      role: 'petrissage',
      consumes: [
        { resource: SAUCE_TOMATE, ratio: new Decimal(1) },
        { resource: MOZZARELLA, ratio: new Decimal(1.3) },
      ],
      produces: [
        { resource: PATE_A_PIZZA, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'cuisson',
      consumes: [
        { resource: PATE_A_PIZZA, ratio: new Decimal(0.9) },
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
      freeProduces: [
        { resource: resourceId('reputation'), ratio: new Decimal(0.2) },
      ],
    },
  ],
}

// ─── Crafting recipes ──────────────────────────────────────────
const PETRISSAGE_PIZZA = craftingRecipeId('petrissage_pizza')
const CUISSON_PIZZA = craftingRecipeId('cuisson_pizza')

const craftingRecipes: Record<string, CraftingRecipeData> = {
  [PETRISSAGE_PIZZA as string]: {
    id: PETRISSAGE_PIZZA, name: 'Pétrissage', emoji: '🤲',
    verb: 'Pétrir',
    inputs: [
      { resource: SAUCE_TOMATE, amount: new Decimal(5) },
      { resource: MOZZARELLA, amount: new Decimal(4) },
    ],
    output: { resource: PATE_A_PIZZA, amount: new Decimal(2) },
    durationSeconds: 6,
    scope: 'pizzas',
  },
  [CUISSON_PIZZA as string]: {
    id: CUISSON_PIZZA, name: 'Cuisson', emoji: '🔥',
    verb: 'Cuire',
    inputs: [
      { resource: PATE_A_PIZZA, amount: new Decimal(2) },
    ],
    output: { resource: PIZZAS, amount: new Decimal(3) },
    durationSeconds: 8,
    scope: 'pizzas',
  },
}

// ─── Upgrades ──────────────────────────────────────────────────
const upgrades: Record<string, UpgradeData> = {
  pizza_petrissage_rapide: {
    id: upgradeId('pizza_petrissage_rapide'), name: 'Pétrissage rapide (Pizza)',
    description: 'Pétrissage 2x plus rapide', emoji: '⚡',
    cost: new Decimal(50_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: PETRISSAGE_PIZZA, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PATE_A_PIZZA, threshold: new Decimal(5) },
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
  buildingOrder: [PETRIN_PIZZA, POTAGER, FOUR_A_BOIS, PIZZERIA, LABO_RECETTES, USINE_PIZZA, CHAINE_PIZZERIAS, EMPIRE_PIZZA],
  buildingUnlockThresholds: {
    [PETRIN_PIZZA as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(500) },
    [POTAGER as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(500) },
    [FOUR_A_BOIS as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(5_000) },
    [PIZZERIA as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(15_000) },
    [LABO_RECETTES as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(40_000) },
    [USINE_PIZZA as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(300_000) },
    [CHAINE_PIZZERIAS as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(1_500_000) },
    [EMPIRE_PIZZA as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(15_000_000) },
  },
  craftingRecipes,
  craftingOrder: [PETRISSAGE_PIZZA, CUISSON_PIZZA],
  upgrades,
  upgradeOrder: [
    upgradeId('pizza_petrissage_rapide'),
    upgradeId('pizza_cuisson_rapide'),
    upgradeId('pizza_meilleur_prix'),
    upgradeId('pizza_potager_boost'),
    upgradeId('pizza_petrin_boost'),
    upgradeId('pizza_global'),
    upgradeId('pizza_four_bois_boost'),
    upgradeId('pizza_achat_en_gros'),
  ],
  pipelineConfig,
  passiveRegen: {
    [SAUCE_TOMATE as string]: new Decimal(0.12),
    [MOZZARELLA as string]: new Decimal(0.18),
  },
  finishedProductId: PIZZAS,
  baseSellRate: new Decimal(5),
}
