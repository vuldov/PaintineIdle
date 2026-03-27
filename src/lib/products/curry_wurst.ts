import Decimal from 'decimal.js'
import { resourceId, buildingId, craftingRecipeId, upgradeId, supplierId, supplierUpgradeId, PANTINS_COINS_ID } from '@/types'
import type { ProductBundle, ResourceData, BuildingData, CraftingRecipeData, UpgradeData, PipelineStageConfig, SupplierData, SupplierUpgradeData } from '@/types'
import { generateMilestones } from '@/lib/milestones/generateMilestones'

// ─── Resource IDs ──────────────────────────────────────────────
const SAUCISSE_VEGE = resourceId('saucisse_vege')
const KETCHUP = resourceId('ketchup')
const EPICES = resourceId('epices')
const FRITES = resourceId('frites')
const GEWURZ_KETCHUP = resourceId('gewurz_ketchup')
const SAUCISSE_SAUCEE = resourceId('saucisse_saucee')
const WURST_GARNIE = resourceId('wurst_garnie')
const CURRY_WURST = resourceId('curry_wurst')

// ─── Building IDs ──────────────────────────────────────────────
const MELANGEUR_EPICES = buildingId('melangeur_epices')
const SAUCIER = buildingId('saucier')
const GARNISSEUSE = buildingId('garnisseuse')
const GRILL_VEGETAL = buildingId('grill_vegetal')
const IMBISS = buildingId('imbiss')

// ─── Resources ─────────────────────────────────────────────────
const resources: Record<string, ResourceData> = {
  [SAUCISSE_VEGE as string]: {
    id: SAUCISSE_VEGE, name: 'resources.saucisse_vege.name', emoji: 'resources.saucisse_vege.emoji',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(8), scope: 'curry_wurst',
  },
  [KETCHUP as string]: {
    id: KETCHUP, name: 'resources.ketchup.name', emoji: 'resources.ketchup.emoji',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(12), scope: 'curry_wurst',
  },
  [EPICES as string]: {
    id: EPICES, name: 'resources.epices.name', emoji: 'resources.epices.emoji',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(10), scope: 'curry_wurst',
  },
  [FRITES as string]: {
    id: FRITES, name: 'resources.frites.name', emoji: 'resources.frites.emoji',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(6), scope: 'curry_wurst',
  },
  [GEWURZ_KETCHUP as string]: {
    id: GEWURZ_KETCHUP, name: 'resources.gewurz_ketchup.name', emoji: 'resources.gewurz_ketchup.emoji',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'curry_wurst',
  },
  [SAUCISSE_SAUCEE as string]: {
    id: SAUCISSE_SAUCEE, name: 'resources.saucisse_saucee.name', emoji: 'resources.saucisse_saucee.emoji',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'curry_wurst',
  },
  [WURST_GARNIE as string]: {
    id: WURST_GARNIE, name: 'resources.wurst_garnie.name', emoji: 'resources.wurst_garnie.emoji',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'curry_wurst',
  },
  [CURRY_WURST as string]: {
    id: CURRY_WURST, name: 'shared_resources.curry_wurst.name', emoji: 'shared_resources.curry_wurst.emoji',
    category: 'produit_fini', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'curry_wurst',
  },
}

// ─── Buildings ─────────────────────────────────────────────────
const buildings: Record<string, BuildingData> = {
  [MELANGEUR_EPICES as string]: {
    id: MELANGEUR_EPICES, name: 'buildings.melangeur_epices.name', emoji: 'buildings.melangeur_epices.emoji',
    description: 'buildings.melangeur_epices.description',
    baseCost: new Decimal(10_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.4),
    producedResource: GEWURZ_KETCHUP, pipelineRole: 'petrissage', scope: 'curry_wurst',
    aura: {
      effectType: 'crafting_speed_bonus', bonusPerBuilding: new Decimal(0.02),
      description: 'buildings.melangeur_epices.aura_description',
    },
  },
  [SAUCIER as string]: {
    id: SAUCIER, name: 'buildings.saucier.name', emoji: 'buildings.saucier.emoji',
    description: 'buildings.saucier.description',
    baseCost: new Decimal(12_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.3),
    producedResource: SAUCISSE_SAUCEE, pipelineRole: 'garnissage', scope: 'curry_wurst',
    aura: {
      effectType: 'ingredient_generation_bonus', bonusPerBuilding: new Decimal(0.05),
      targetResource: 'saucisse_vege', description: 'buildings.saucier.aura_description',
    },
  },
  [GARNISSEUSE as string]: {
    id: GARNISSEUSE, name: 'buildings.garnisseuse.name', emoji: 'buildings.garnisseuse.emoji',
    description: 'buildings.garnisseuse.description',
    baseCost: new Decimal(20_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.6),
    producedResource: WURST_GARNIE, pipelineRole: 'dorure', scope: 'curry_wurst',
    aura: {
      effectType: 'ingredient_generation_bonus', bonusPerBuilding: new Decimal(0.04),
      targetResource: 'frites', description: 'buildings.garnisseuse.aura_description',
    },
  },
  [GRILL_VEGETAL as string]: {
    id: GRILL_VEGETAL, name: 'buildings.grill_vegetal.name', emoji: 'buildings.grill_vegetal.emoji',
    description: 'buildings.grill_vegetal.description',
    baseCost: new Decimal(30_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(1.5),
    producedResource: CURRY_WURST, pipelineRole: 'cuisson', scope: 'curry_wurst',
    aura: {
      effectType: 'sell_price_bonus', bonusPerBuilding: new Decimal(0.02),
      targetProduct: 'curry_wurst', description: 'buildings.grill_vegetal.aura_description',
    },
  },
  [IMBISS as string]: {
    id: IMBISS, name: 'buildings.imbiss.name', emoji: 'buildings.imbiss.emoji',
    description: 'buildings.imbiss.description',
    baseCost: new Decimal(50_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.8),
    producedResource: PANTINS_COINS_ID, pipelineRole: 'vente', scope: 'curry_wurst',
    aura: {
      effectType: 'sell_price_bonus', bonusPerBuilding: new Decimal(0.01),
      description: 'buildings.imbiss.aura_description',
    },
  },
}

// ─── Pipeline config ───────────────────────────────────────────
//  Assaisonnement: ketchup + épices → gewürz ketchup
//  Saucer la saucisse: gewürz ketchup + saucisse végé → saucisse saucée
//  Garniture: saucisse saucée + frites → wurst garnie
//  Cuisson: wurst garnie → curry wurst végé
//  Vente: curry wurst végé → coins
const pipelineConfig: { stages: PipelineStageConfig[] } = {
  stages: [
    {
      role: 'petrissage',
      consumes: [
        { resource: KETCHUP, ratio: new Decimal(1) },
        { resource: EPICES, ratio: new Decimal(0.8) },
      ],
      produces: [
        { resource: GEWURZ_KETCHUP, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'garnissage',
      consumes: [
        { resource: GEWURZ_KETCHUP, ratio: new Decimal(0.8) },
        { resource: SAUCISSE_VEGE, ratio: new Decimal(1.2) },
      ],
      produces: [
        { resource: SAUCISSE_SAUCEE, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'dorure',
      consumes: [
        { resource: SAUCISSE_SAUCEE, ratio: new Decimal(0.8) },
        { resource: FRITES, ratio: new Decimal(0.5) },
      ],
      produces: [
        { resource: WURST_GARNIE, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'cuisson',
      consumes: [
        { resource: WURST_GARNIE, ratio: new Decimal(0.8) },
      ],
      produces: [
        { resource: CURRY_WURST, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'vente',
      consumes: [
        { resource: CURRY_WURST, ratio: new Decimal(1) },
      ],
      produces: [
        { resource: PANTINS_COINS_ID, ratio: new Decimal(2.5) },
      ],
    },
  ],
}

// ─── Crafting recipes ──────────────────────────────────────────
const ASSAISONNEMENT_CURRY = craftingRecipeId('assaisonnement_curry')
const SAUCAGE_CURRY = craftingRecipeId('saucage_curry')
const GARNITURE_CURRY = craftingRecipeId('garniture_curry')
const CUISSON_CURRY = craftingRecipeId('cuisson_curry')

const craftingRecipes: Record<string, CraftingRecipeData> = {
  [ASSAISONNEMENT_CURRY as string]: {
    id: ASSAISONNEMENT_CURRY, name: 'crafting.assaisonnement_curry.name', emoji: 'crafting.assaisonnement_curry.emoji',
    verb: 'crafting.assaisonnement_curry.verb',
    inputs: [
      { resource: KETCHUP, amount: new Decimal(3) },
      { resource: EPICES, amount: new Decimal(2) },
    ],
    output: { resource: GEWURZ_KETCHUP, amount: new Decimal(2) },
    durationSeconds: 5,
    scope: 'curry_wurst',
    linkedBuildingId: MELANGEUR_EPICES,
  },
  [SAUCAGE_CURRY as string]: {
    id: SAUCAGE_CURRY, name: 'crafting.saucage_curry.name', emoji: 'crafting.saucage_curry.emoji',
    verb: 'crafting.saucage_curry.verb',
    inputs: [
      { resource: GEWURZ_KETCHUP, amount: new Decimal(2) },
      { resource: SAUCISSE_VEGE, amount: new Decimal(3) },
    ],
    output: { resource: SAUCISSE_SAUCEE, amount: new Decimal(2) },
    durationSeconds: 4,
    scope: 'curry_wurst',
    linkedBuildingId: SAUCIER,
  },
  [GARNITURE_CURRY as string]: {
    id: GARNITURE_CURRY, name: 'crafting.garniture_curry.name', emoji: 'crafting.garniture_curry.emoji',
    verb: 'crafting.garniture_curry.verb',
    inputs: [
      { resource: SAUCISSE_SAUCEE, amount: new Decimal(2) },
      { resource: FRITES, amount: new Decimal(1) },
    ],
    output: { resource: WURST_GARNIE, amount: new Decimal(2) },
    durationSeconds: 3,
    scope: 'curry_wurst',
    linkedBuildingId: GARNISSEUSE,
  },
  [CUISSON_CURRY as string]: {
    id: CUISSON_CURRY, name: 'crafting.cuisson_curry.name', emoji: 'crafting.cuisson_curry.emoji',
    verb: 'crafting.cuisson_curry.verb',
    inputs: [
      { resource: WURST_GARNIE, amount: new Decimal(2) },
    ],
    output: { resource: CURRY_WURST, amount: new Decimal(3) },
    durationSeconds: 7,
    scope: 'curry_wurst',
    linkedBuildingId: GRILL_VEGETAL,
  },
}

// ─── Upgrades ──────────────────────────────────────────────────
const upgrades: Record<string, UpgradeData> = {
  wurst_assaisonnement_rapide: {
    id: upgradeId('wurst_assaisonnement_rapide'), name: 'upgrades.wurst_assaisonnement_rapide.name',
    description: 'upgrades.wurst_assaisonnement_rapide.description', emoji: 'upgrades.wurst_assaisonnement_rapide.emoji',
    cost: new Decimal(6_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: ASSAISONNEMENT_CURRY, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: GEWURZ_KETCHUP, threshold: new Decimal(5) },
    scope: 'curry_wurst',
  },
  wurst_saucage_rapide: {
    id: upgradeId('wurst_saucage_rapide'), name: 'upgrades.wurst_saucage_rapide.name',
    description: 'upgrades.wurst_saucage_rapide.description', emoji: 'upgrades.wurst_saucage_rapide.emoji',
    cost: new Decimal(9_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: SAUCAGE_CURRY, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: SAUCISSE_SAUCEE, threshold: new Decimal(5) },
    scope: 'curry_wurst',
  },
  wurst_garniture_rapide: {
    id: upgradeId('wurst_garniture_rapide'), name: 'upgrades.wurst_garniture_rapide.name',
    description: 'upgrades.wurst_garniture_rapide.description', emoji: 'upgrades.wurst_garniture_rapide.emoji',
    cost: new Decimal(11_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: GARNITURE_CURRY, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: WURST_GARNIE, threshold: new Decimal(5) },
    scope: 'curry_wurst',
  },
  wurst_cuisson_rapide: {
    id: upgradeId('wurst_cuisson_rapide'), name: 'upgrades.wurst_cuisson_rapide.name',
    description: 'upgrades.wurst_cuisson_rapide.description', emoji: 'upgrades.wurst_cuisson_rapide.emoji',
    cost: new Decimal(13_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: CUISSON_CURRY, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: CURRY_WURST, threshold: new Decimal(10) },
    scope: 'curry_wurst',
  },
  wurst_meilleur_prix: {
    id: upgradeId('wurst_meilleur_prix'), name: 'upgrades.wurst_meilleur_prix.name',
    description: 'upgrades.wurst_meilleur_prix.description', emoji: 'upgrades.wurst_meilleur_prix.emoji',
    cost: new Decimal(20_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'sell_multiplier', multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(10_000) },
    scope: 'curry_wurst',
  },
  wurst_saucier_boost: {
    id: upgradeId('wurst_saucier_boost'), name: 'upgrades.wurst_saucier_boost.name',
    description: 'upgrades.wurst_saucier_boost.description', emoji: 'upgrades.wurst_saucier_boost.emoji',
    cost: new Decimal(25_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: SAUCIER, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: SAUCIER, threshold: new Decimal(5) },
    scope: 'curry_wurst',
  },
  wurst_melangeur_boost: {
    id: upgradeId('wurst_melangeur_boost'), name: 'upgrades.wurst_melangeur_boost.name',
    description: 'upgrades.wurst_melangeur_boost.description', emoji: 'upgrades.wurst_melangeur_boost.emoji',
    cost: new Decimal(35_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: MELANGEUR_EPICES, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: MELANGEUR_EPICES, threshold: new Decimal(5) },
    scope: 'curry_wurst',
  },
  wurst_garnisseuse_boost: {
    id: upgradeId('wurst_garnisseuse_boost'), name: 'upgrades.wurst_garnisseuse_boost.name',
    description: 'upgrades.wurst_garnisseuse_boost.description', emoji: 'upgrades.wurst_garnisseuse_boost.emoji',
    cost: new Decimal(28_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: GARNISSEUSE, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: GARNISSEUSE, threshold: new Decimal(5) },
    scope: 'curry_wurst',
  },
  wurst_global: {
    id: upgradeId('wurst_global'), name: 'upgrades.wurst_global.name',
    description: 'upgrades.wurst_global.description', emoji: 'upgrades.wurst_global.emoji',
    cost: new Decimal(50_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'global_multiplier', multiplier: new Decimal(1.5) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(25_000) },
    scope: 'curry_wurst',
  },
  wurst_achat_en_gros: {
    id: upgradeId('wurst_achat_en_gros'), name: 'upgrades.wurst_achat_en_gros.name',
    description: 'upgrades.wurst_achat_en_gros.description', emoji: 'upgrades.wurst_achat_en_gros.emoji',
    cost: new Decimal(80_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'cost_reduction', multiplier: new Decimal(0.85) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(40_000) },
    scope: 'curry_wurst',
  },
}

// ─── Suppliers (1 per ingredient) ────────────────────────────
const TOFU_MEISTER = supplierId('tofu_meister')
const FERME_TOMATES = supplierId('ferme_tomates')
const MARCHE_EPICES = supplierId('marche_epices')
const FRITERIE = supplierId('friterie')

const suppliers: Record<string, SupplierData> = {
  [TOFU_MEISTER as string]: {
    id: TOFU_MEISTER, name: 'suppliers.tofu_meister.name', emoji: 'suppliers.tofu_meister.emoji',
    description: 'suppliers.tofu_meister.description',
    producedResource: SAUCISSE_VEGE,
    baseMaxRate: new Decimal(2), baseCostPerSecond: new Decimal(4.5),
    contractCost: new Decimal(5_000), scope: 'curry_wurst',
  },
  [FERME_TOMATES as string]: {
    id: FERME_TOMATES, name: 'suppliers.ferme_tomates.name', emoji: 'suppliers.ferme_tomates.emoji',
    description: 'suppliers.ferme_tomates.description',
    producedResource: KETCHUP,
    baseMaxRate: new Decimal(3), baseCostPerSecond: new Decimal(6.5),
    contractCost: new Decimal(4_000), scope: 'curry_wurst',
  },
  [MARCHE_EPICES as string]: {
    id: MARCHE_EPICES, name: 'suppliers.marche_epices.name', emoji: 'suppliers.marche_epices.emoji',
    description: 'suppliers.marche_epices.description',
    producedResource: EPICES,
    baseMaxRate: new Decimal(2.5), baseCostPerSecond: new Decimal(5.5),
    contractCost: new Decimal(4_500), scope: 'curry_wurst',
  },
  [FRITERIE as string]: {
    id: FRITERIE, name: 'suppliers.friterie.name', emoji: 'suppliers.friterie.emoji',
    description: 'suppliers.friterie.description',
    producedResource: FRITES,
    baseMaxRate: new Decimal(1.5), baseCostPerSecond: new Decimal(3.5),
    contractCost: new Decimal(3_500), scope: 'curry_wurst',
  },
}

// ─── Supplier upgrades (inline) ──────────────────────────────
const supplierUpgrades: Record<string, SupplierUpgradeData> = {
  // ── Tofu-Meister (baseCost=10, costGrowth=1.8, costResource=SAUCISSE_SAUCEE) ──
  [supplierUpgradeId('tofu_meister_rate_1') as string]: {
    id: supplierUpgradeId('tofu_meister_rate_1'),
    name: 'supplier_upgrades.tofu_meister_rate.name', emoji: 'supplier_upgrades.tofu_meister_rate.emoji',
    description: 'supplier_upgrades.tofu_meister_rate.description',
    targetSupplier: TOFU_MEISTER,
    cost: new Decimal(10), costResource: SAUCISSE_SAUCEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('tofu_meister_cost_1') as string]: {
    id: supplierUpgradeId('tofu_meister_cost_1'),
    name: 'supplier_upgrades.tofu_meister_cost.name', emoji: 'supplier_upgrades.tofu_meister_cost.emoji',
    description: 'supplier_upgrades.tofu_meister_cost.description',
    targetSupplier: TOFU_MEISTER,
    cost: new Decimal(18), costResource: SAUCISSE_SAUCEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('tofu_meister_rate_2') as string]: {
    id: supplierUpgradeId('tofu_meister_rate_2'),
    name: 'supplier_upgrades.tofu_meister_rate.name', emoji: 'supplier_upgrades.tofu_meister_rate.emoji',
    description: 'supplier_upgrades.tofu_meister_rate.description',
    targetSupplier: TOFU_MEISTER,
    cost: new Decimal(32), costResource: SAUCISSE_SAUCEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('tofu_meister_cost_2') as string]: {
    id: supplierUpgradeId('tofu_meister_cost_2'),
    name: 'supplier_upgrades.tofu_meister_cost.name', emoji: 'supplier_upgrades.tofu_meister_cost.emoji',
    description: 'supplier_upgrades.tofu_meister_cost.description',
    targetSupplier: TOFU_MEISTER,
    cost: new Decimal(58), costResource: SAUCISSE_SAUCEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('tofu_meister_rate_3') as string]: {
    id: supplierUpgradeId('tofu_meister_rate_3'),
    name: 'supplier_upgrades.tofu_meister_rate.name', emoji: 'supplier_upgrades.tofu_meister_rate.emoji',
    description: 'supplier_upgrades.tofu_meister_rate.description',
    targetSupplier: TOFU_MEISTER,
    cost: new Decimal(105), costResource: SAUCISSE_SAUCEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('tofu_meister_cost_3') as string]: {
    id: supplierUpgradeId('tofu_meister_cost_3'),
    name: 'supplier_upgrades.tofu_meister_cost.name', emoji: 'supplier_upgrades.tofu_meister_cost.emoji',
    description: 'supplier_upgrades.tofu_meister_cost.description',
    targetSupplier: TOFU_MEISTER,
    cost: new Decimal(189), costResource: SAUCISSE_SAUCEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('tofu_meister_rate_4') as string]: {
    id: supplierUpgradeId('tofu_meister_rate_4'),
    name: 'supplier_upgrades.tofu_meister_rate.name', emoji: 'supplier_upgrades.tofu_meister_rate.emoji',
    description: 'supplier_upgrades.tofu_meister_rate.description',
    targetSupplier: TOFU_MEISTER,
    cost: new Decimal(340), costResource: SAUCISSE_SAUCEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('tofu_meister_cost_4') as string]: {
    id: supplierUpgradeId('tofu_meister_cost_4'),
    name: 'supplier_upgrades.tofu_meister_cost.name', emoji: 'supplier_upgrades.tofu_meister_cost.emoji',
    description: 'supplier_upgrades.tofu_meister_cost.description',
    targetSupplier: TOFU_MEISTER,
    cost: new Decimal(612), costResource: SAUCISSE_SAUCEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('tofu_meister_rate_5') as string]: {
    id: supplierUpgradeId('tofu_meister_rate_5'),
    name: 'supplier_upgrades.tofu_meister_rate.name', emoji: 'supplier_upgrades.tofu_meister_rate.emoji',
    description: 'supplier_upgrades.tofu_meister_rate.description',
    targetSupplier: TOFU_MEISTER,
    cost: new Decimal(1102), costResource: SAUCISSE_SAUCEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('tofu_meister_cost_5') as string]: {
    id: supplierUpgradeId('tofu_meister_cost_5'),
    name: 'supplier_upgrades.tofu_meister_cost.name', emoji: 'supplier_upgrades.tofu_meister_cost.emoji',
    description: 'supplier_upgrades.tofu_meister_cost.description',
    targetSupplier: TOFU_MEISTER,
    cost: new Decimal(1984), costResource: SAUCISSE_SAUCEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('tofu_meister_rate_6') as string]: {
    id: supplierUpgradeId('tofu_meister_rate_6'),
    name: 'supplier_upgrades.tofu_meister_rate.name', emoji: 'supplier_upgrades.tofu_meister_rate.emoji',
    description: 'supplier_upgrades.tofu_meister_rate.description',
    targetSupplier: TOFU_MEISTER,
    cost: new Decimal(3570), costResource: SAUCISSE_SAUCEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },

  // ── Ferme de tomates (baseCost=15, costGrowth=2.0, costResource=GEWURZ_KETCHUP) ──
  [supplierUpgradeId('ferme_tomates_rate_1') as string]: {
    id: supplierUpgradeId('ferme_tomates_rate_1'),
    name: 'supplier_upgrades.ferme_tomates_rate.name', emoji: 'supplier_upgrades.ferme_tomates_rate.emoji',
    description: 'supplier_upgrades.ferme_tomates_rate.description',
    targetSupplier: FERME_TOMATES,
    cost: new Decimal(15), costResource: GEWURZ_KETCHUP,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('ferme_tomates_cost_1') as string]: {
    id: supplierUpgradeId('ferme_tomates_cost_1'),
    name: 'supplier_upgrades.ferme_tomates_cost.name', emoji: 'supplier_upgrades.ferme_tomates_cost.emoji',
    description: 'supplier_upgrades.ferme_tomates_cost.description',
    targetSupplier: FERME_TOMATES,
    cost: new Decimal(30), costResource: GEWURZ_KETCHUP,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('ferme_tomates_rate_2') as string]: {
    id: supplierUpgradeId('ferme_tomates_rate_2'),
    name: 'supplier_upgrades.ferme_tomates_rate.name', emoji: 'supplier_upgrades.ferme_tomates_rate.emoji',
    description: 'supplier_upgrades.ferme_tomates_rate.description',
    targetSupplier: FERME_TOMATES,
    cost: new Decimal(60), costResource: GEWURZ_KETCHUP,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('ferme_tomates_cost_2') as string]: {
    id: supplierUpgradeId('ferme_tomates_cost_2'),
    name: 'supplier_upgrades.ferme_tomates_cost.name', emoji: 'supplier_upgrades.ferme_tomates_cost.emoji',
    description: 'supplier_upgrades.ferme_tomates_cost.description',
    targetSupplier: FERME_TOMATES,
    cost: new Decimal(120), costResource: GEWURZ_KETCHUP,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('ferme_tomates_rate_3') as string]: {
    id: supplierUpgradeId('ferme_tomates_rate_3'),
    name: 'supplier_upgrades.ferme_tomates_rate.name', emoji: 'supplier_upgrades.ferme_tomates_rate.emoji',
    description: 'supplier_upgrades.ferme_tomates_rate.description',
    targetSupplier: FERME_TOMATES,
    cost: new Decimal(240), costResource: GEWURZ_KETCHUP,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('ferme_tomates_cost_3') as string]: {
    id: supplierUpgradeId('ferme_tomates_cost_3'),
    name: 'supplier_upgrades.ferme_tomates_cost.name', emoji: 'supplier_upgrades.ferme_tomates_cost.emoji',
    description: 'supplier_upgrades.ferme_tomates_cost.description',
    targetSupplier: FERME_TOMATES,
    cost: new Decimal(480), costResource: GEWURZ_KETCHUP,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('ferme_tomates_rate_4') as string]: {
    id: supplierUpgradeId('ferme_tomates_rate_4'),
    name: 'supplier_upgrades.ferme_tomates_rate.name', emoji: 'supplier_upgrades.ferme_tomates_rate.emoji',
    description: 'supplier_upgrades.ferme_tomates_rate.description',
    targetSupplier: FERME_TOMATES,
    cost: new Decimal(960), costResource: GEWURZ_KETCHUP,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('ferme_tomates_cost_4') as string]: {
    id: supplierUpgradeId('ferme_tomates_cost_4'),
    name: 'supplier_upgrades.ferme_tomates_cost.name', emoji: 'supplier_upgrades.ferme_tomates_cost.emoji',
    description: 'supplier_upgrades.ferme_tomates_cost.description',
    targetSupplier: FERME_TOMATES,
    cost: new Decimal(1920), costResource: GEWURZ_KETCHUP,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('ferme_tomates_rate_5') as string]: {
    id: supplierUpgradeId('ferme_tomates_rate_5'),
    name: 'supplier_upgrades.ferme_tomates_rate.name', emoji: 'supplier_upgrades.ferme_tomates_rate.emoji',
    description: 'supplier_upgrades.ferme_tomates_rate.description',
    targetSupplier: FERME_TOMATES,
    cost: new Decimal(3840), costResource: GEWURZ_KETCHUP,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('ferme_tomates_cost_5') as string]: {
    id: supplierUpgradeId('ferme_tomates_cost_5'),
    name: 'supplier_upgrades.ferme_tomates_cost.name', emoji: 'supplier_upgrades.ferme_tomates_cost.emoji',
    description: 'supplier_upgrades.ferme_tomates_cost.description',
    targetSupplier: FERME_TOMATES,
    cost: new Decimal(7680), costResource: GEWURZ_KETCHUP,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('ferme_tomates_rate_6') as string]: {
    id: supplierUpgradeId('ferme_tomates_rate_6'),
    name: 'supplier_upgrades.ferme_tomates_rate.name', emoji: 'supplier_upgrades.ferme_tomates_rate.emoji',
    description: 'supplier_upgrades.ferme_tomates_rate.description',
    targetSupplier: FERME_TOMATES,
    cost: new Decimal(15360), costResource: GEWURZ_KETCHUP,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },

  // ── Marché aux épices (baseCost=18, costGrowth=1.6, costResource=GEWURZ_KETCHUP) ──
  [supplierUpgradeId('marche_epices_rate_1') as string]: {
    id: supplierUpgradeId('marche_epices_rate_1'),
    name: 'supplier_upgrades.marche_epices_rate.name', emoji: 'supplier_upgrades.marche_epices_rate.emoji',
    description: 'supplier_upgrades.marche_epices_rate.description',
    targetSupplier: MARCHE_EPICES,
    cost: new Decimal(18), costResource: GEWURZ_KETCHUP,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('marche_epices_cost_1') as string]: {
    id: supplierUpgradeId('marche_epices_cost_1'),
    name: 'supplier_upgrades.marche_epices_cost.name', emoji: 'supplier_upgrades.marche_epices_cost.emoji',
    description: 'supplier_upgrades.marche_epices_cost.description',
    targetSupplier: MARCHE_EPICES,
    cost: new Decimal(29), costResource: GEWURZ_KETCHUP,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('marche_epices_rate_2') as string]: {
    id: supplierUpgradeId('marche_epices_rate_2'),
    name: 'supplier_upgrades.marche_epices_rate.name', emoji: 'supplier_upgrades.marche_epices_rate.emoji',
    description: 'supplier_upgrades.marche_epices_rate.description',
    targetSupplier: MARCHE_EPICES,
    cost: new Decimal(46), costResource: GEWURZ_KETCHUP,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('marche_epices_cost_2') as string]: {
    id: supplierUpgradeId('marche_epices_cost_2'),
    name: 'supplier_upgrades.marche_epices_cost.name', emoji: 'supplier_upgrades.marche_epices_cost.emoji',
    description: 'supplier_upgrades.marche_epices_cost.description',
    targetSupplier: MARCHE_EPICES,
    cost: new Decimal(74), costResource: GEWURZ_KETCHUP,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('marche_epices_rate_3') as string]: {
    id: supplierUpgradeId('marche_epices_rate_3'),
    name: 'supplier_upgrades.marche_epices_rate.name', emoji: 'supplier_upgrades.marche_epices_rate.emoji',
    description: 'supplier_upgrades.marche_epices_rate.description',
    targetSupplier: MARCHE_EPICES,
    cost: new Decimal(118), costResource: GEWURZ_KETCHUP,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('marche_epices_cost_3') as string]: {
    id: supplierUpgradeId('marche_epices_cost_3'),
    name: 'supplier_upgrades.marche_epices_cost.name', emoji: 'supplier_upgrades.marche_epices_cost.emoji',
    description: 'supplier_upgrades.marche_epices_cost.description',
    targetSupplier: MARCHE_EPICES,
    cost: new Decimal(189), costResource: GEWURZ_KETCHUP,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('marche_epices_rate_4') as string]: {
    id: supplierUpgradeId('marche_epices_rate_4'),
    name: 'supplier_upgrades.marche_epices_rate.name', emoji: 'supplier_upgrades.marche_epices_rate.emoji',
    description: 'supplier_upgrades.marche_epices_rate.description',
    targetSupplier: MARCHE_EPICES,
    cost: new Decimal(302), costResource: GEWURZ_KETCHUP,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('marche_epices_cost_4') as string]: {
    id: supplierUpgradeId('marche_epices_cost_4'),
    name: 'supplier_upgrades.marche_epices_cost.name', emoji: 'supplier_upgrades.marche_epices_cost.emoji',
    description: 'supplier_upgrades.marche_epices_cost.description',
    targetSupplier: MARCHE_EPICES,
    cost: new Decimal(483), costResource: GEWURZ_KETCHUP,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('marche_epices_rate_5') as string]: {
    id: supplierUpgradeId('marche_epices_rate_5'),
    name: 'supplier_upgrades.marche_epices_rate.name', emoji: 'supplier_upgrades.marche_epices_rate.emoji',
    description: 'supplier_upgrades.marche_epices_rate.description',
    targetSupplier: MARCHE_EPICES,
    cost: new Decimal(773), costResource: GEWURZ_KETCHUP,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('marche_epices_cost_5') as string]: {
    id: supplierUpgradeId('marche_epices_cost_5'),
    name: 'supplier_upgrades.marche_epices_cost.name', emoji: 'supplier_upgrades.marche_epices_cost.emoji',
    description: 'supplier_upgrades.marche_epices_cost.description',
    targetSupplier: MARCHE_EPICES,
    cost: new Decimal(1237), costResource: GEWURZ_KETCHUP,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('marche_epices_rate_6') as string]: {
    id: supplierUpgradeId('marche_epices_rate_6'),
    name: 'supplier_upgrades.marche_epices_rate.name', emoji: 'supplier_upgrades.marche_epices_rate.emoji',
    description: 'supplier_upgrades.marche_epices_rate.description',
    targetSupplier: MARCHE_EPICES,
    cost: new Decimal(1979), costResource: GEWURZ_KETCHUP,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },

  // ── Friterie (baseCost=6, costGrowth=2.2, costResource=WURST_GARNIE) ──
  [supplierUpgradeId('friterie_rate_1') as string]: {
    id: supplierUpgradeId('friterie_rate_1'),
    name: 'supplier_upgrades.friterie_rate.name', emoji: 'supplier_upgrades.friterie_rate.emoji',
    description: 'supplier_upgrades.friterie_rate.description',
    targetSupplier: FRITERIE,
    cost: new Decimal(6), costResource: WURST_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('friterie_cost_1') as string]: {
    id: supplierUpgradeId('friterie_cost_1'),
    name: 'supplier_upgrades.friterie_cost.name', emoji: 'supplier_upgrades.friterie_cost.emoji',
    description: 'supplier_upgrades.friterie_cost.description',
    targetSupplier: FRITERIE,
    cost: new Decimal(13), costResource: WURST_GARNIE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('friterie_rate_2') as string]: {
    id: supplierUpgradeId('friterie_rate_2'),
    name: 'supplier_upgrades.friterie_rate.name', emoji: 'supplier_upgrades.friterie_rate.emoji',
    description: 'supplier_upgrades.friterie_rate.description',
    targetSupplier: FRITERIE,
    cost: new Decimal(29), costResource: WURST_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('friterie_cost_2') as string]: {
    id: supplierUpgradeId('friterie_cost_2'),
    name: 'supplier_upgrades.friterie_cost.name', emoji: 'supplier_upgrades.friterie_cost.emoji',
    description: 'supplier_upgrades.friterie_cost.description',
    targetSupplier: FRITERIE,
    cost: new Decimal(64), costResource: WURST_GARNIE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('friterie_rate_3') as string]: {
    id: supplierUpgradeId('friterie_rate_3'),
    name: 'supplier_upgrades.friterie_rate.name', emoji: 'supplier_upgrades.friterie_rate.emoji',
    description: 'supplier_upgrades.friterie_rate.description',
    targetSupplier: FRITERIE,
    cost: new Decimal(140), costResource: WURST_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('friterie_cost_3') as string]: {
    id: supplierUpgradeId('friterie_cost_3'),
    name: 'supplier_upgrades.friterie_cost.name', emoji: 'supplier_upgrades.friterie_cost.emoji',
    description: 'supplier_upgrades.friterie_cost.description',
    targetSupplier: FRITERIE,
    cost: new Decimal(308), costResource: WURST_GARNIE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('friterie_rate_4') as string]: {
    id: supplierUpgradeId('friterie_rate_4'),
    name: 'supplier_upgrades.friterie_rate.name', emoji: 'supplier_upgrades.friterie_rate.emoji',
    description: 'supplier_upgrades.friterie_rate.description',
    targetSupplier: FRITERIE,
    cost: new Decimal(678), costResource: WURST_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('friterie_cost_4') as string]: {
    id: supplierUpgradeId('friterie_cost_4'),
    name: 'supplier_upgrades.friterie_cost.name', emoji: 'supplier_upgrades.friterie_cost.emoji',
    description: 'supplier_upgrades.friterie_cost.description',
    targetSupplier: FRITERIE,
    cost: new Decimal(1491), costResource: WURST_GARNIE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('friterie_rate_5') as string]: {
    id: supplierUpgradeId('friterie_rate_5'),
    name: 'supplier_upgrades.friterie_rate.name', emoji: 'supplier_upgrades.friterie_rate.emoji',
    description: 'supplier_upgrades.friterie_rate.description',
    targetSupplier: FRITERIE,
    cost: new Decimal(3281), costResource: WURST_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('friterie_cost_5') as string]: {
    id: supplierUpgradeId('friterie_cost_5'),
    name: 'supplier_upgrades.friterie_cost.name', emoji: 'supplier_upgrades.friterie_cost.emoji',
    description: 'supplier_upgrades.friterie_cost.description',
    targetSupplier: FRITERIE,
    cost: new Decimal(7218), costResource: WURST_GARNIE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'curry_wurst',
  },
  [supplierUpgradeId('friterie_rate_6') as string]: {
    id: supplierUpgradeId('friterie_rate_6'),
    name: 'supplier_upgrades.friterie_rate.name', emoji: 'supplier_upgrades.friterie_rate.emoji',
    description: 'supplier_upgrades.friterie_rate.description',
    targetSupplier: FRITERIE,
    cost: new Decimal(15879), costResource: WURST_GARNIE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'curry_wurst',
  },
}

const supplierUpgradeOrder = [
  // Tofu-Meister
  supplierUpgradeId('tofu_meister_rate_1'),
  supplierUpgradeId('tofu_meister_cost_1'),
  supplierUpgradeId('tofu_meister_rate_2'),
  supplierUpgradeId('tofu_meister_cost_2'),
  supplierUpgradeId('tofu_meister_rate_3'),
  supplierUpgradeId('tofu_meister_cost_3'),
  supplierUpgradeId('tofu_meister_rate_4'),
  supplierUpgradeId('tofu_meister_cost_4'),
  supplierUpgradeId('tofu_meister_rate_5'),
  supplierUpgradeId('tofu_meister_cost_5'),
  supplierUpgradeId('tofu_meister_rate_6'),
  // Ferme de tomates
  supplierUpgradeId('ferme_tomates_rate_1'),
  supplierUpgradeId('ferme_tomates_cost_1'),
  supplierUpgradeId('ferme_tomates_rate_2'),
  supplierUpgradeId('ferme_tomates_cost_2'),
  supplierUpgradeId('ferme_tomates_rate_3'),
  supplierUpgradeId('ferme_tomates_cost_3'),
  supplierUpgradeId('ferme_tomates_rate_4'),
  supplierUpgradeId('ferme_tomates_cost_4'),
  supplierUpgradeId('ferme_tomates_rate_5'),
  supplierUpgradeId('ferme_tomates_cost_5'),
  supplierUpgradeId('ferme_tomates_rate_6'),
  // Marché aux épices
  supplierUpgradeId('marche_epices_rate_1'),
  supplierUpgradeId('marche_epices_cost_1'),
  supplierUpgradeId('marche_epices_rate_2'),
  supplierUpgradeId('marche_epices_cost_2'),
  supplierUpgradeId('marche_epices_rate_3'),
  supplierUpgradeId('marche_epices_cost_3'),
  supplierUpgradeId('marche_epices_rate_4'),
  supplierUpgradeId('marche_epices_cost_4'),
  supplierUpgradeId('marche_epices_rate_5'),
  supplierUpgradeId('marche_epices_cost_5'),
  supplierUpgradeId('marche_epices_rate_6'),
  // Friterie
  supplierUpgradeId('friterie_rate_1'),
  supplierUpgradeId('friterie_cost_1'),
  supplierUpgradeId('friterie_rate_2'),
  supplierUpgradeId('friterie_cost_2'),
  supplierUpgradeId('friterie_rate_3'),
  supplierUpgradeId('friterie_cost_3'),
  supplierUpgradeId('friterie_rate_4'),
  supplierUpgradeId('friterie_cost_4'),
  supplierUpgradeId('friterie_rate_5'),
  supplierUpgradeId('friterie_cost_5'),
  supplierUpgradeId('friterie_rate_6'),
]

// ─── Milestones → Upgrades ─────────────────────────────────────
const milestonesMelangeur = generateMilestones(MELANGEUR_EPICES, 'petrissage', 'Melangeur d\'epices', 'curry_wurst', GEWURZ_KETCHUP, 15)
const milestonesSaucier = generateMilestones(SAUCIER, 'garnissage', 'Saucier', 'curry_wurst', GEWURZ_KETCHUP, 25)
const milestonesGarnisseuse = generateMilestones(GARNISSEUSE, 'dorure', 'Garnisseuse', 'curry_wurst', GEWURZ_KETCHUP, 150)
const milestonesGrill = generateMilestones(GRILL_VEGETAL, 'cuisson', 'Grill vegetal', 'curry_wurst', GEWURZ_KETCHUP, 300)
const milestonesImbiss = generateMilestones(IMBISS, 'vente', 'Imbiss', 'curry_wurst', GEWURZ_KETCHUP, 600)

const allWurstMilestoneUpgrades: Record<string, UpgradeData> = {
  ...milestonesMelangeur.upgrades,
  ...milestonesSaucier.upgrades,
  ...milestonesGarnisseuse.upgrades,
  ...milestonesGrill.upgrades,
  ...milestonesImbiss.upgrades,
}

// ─── Bundle ────────────────────────────────────────────────────

export const CURRY_WURST_BUNDLE: ProductBundle = {
  definition: {
    id: 'curry_wurst',
    name: 'definition.name',
    emoji: 'definition.emoji',
    color: 'yellow',
    unlockCondition: { resource: PANTINS_COINS_ID, amount: new Decimal(500_000) },
  },
  resources,
  buildings,
  buildingOrder: [MELANGEUR_EPICES, SAUCIER, GARNISSEUSE, GRILL_VEGETAL, IMBISS],
  buildingUnlockThresholds: {
    [MELANGEUR_EPICES as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(100) },
    [SAUCIER as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(100) },
    [GARNISSEUSE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(1_000) },
    [GRILL_VEGETAL as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(2_000) },
    [IMBISS as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(4_000) },
  },
  craftingRecipes,
  craftingOrder: [ASSAISONNEMENT_CURRY, SAUCAGE_CURRY, GARNITURE_CURRY, CUISSON_CURRY],
  upgrades: { ...upgrades, ...allWurstMilestoneUpgrades },
  upgradeOrder: [
    upgradeId('wurst_assaisonnement_rapide'),
    upgradeId('wurst_saucage_rapide'),
    upgradeId('wurst_garniture_rapide'),
    upgradeId('wurst_cuisson_rapide'),
    upgradeId('wurst_meilleur_prix'),
    upgradeId('wurst_saucier_boost'),
    upgradeId('wurst_melangeur_boost'),
    upgradeId('wurst_garnisseuse_boost'),
    upgradeId('wurst_global'),
    upgradeId('wurst_achat_en_gros'),
    ...milestonesMelangeur.upgradeOrder.map(id => upgradeId(id)),
    ...milestonesSaucier.upgradeOrder.map(id => upgradeId(id)),
    ...milestonesGarnisseuse.upgradeOrder.map(id => upgradeId(id)),
    ...milestonesGrill.upgradeOrder.map(id => upgradeId(id)),
    ...milestonesImbiss.upgradeOrder.map(id => upgradeId(id)),
  ],
  suppliers,
  supplierOrder: [TOFU_MEISTER, FERME_TOMATES, MARCHE_EPICES, FRITERIE],
  supplierUpgrades,
  supplierUpgradeOrder,
  pipelineConfig,
  passiveRegen: {
    [SAUCISSE_VEGE as string]: new Decimal(0.15),
    [KETCHUP as string]: new Decimal(0.22),
    [EPICES as string]: new Decimal(0.18),
    [FRITES as string]: new Decimal(0.10),
  },
  finishedProductId: CURRY_WURST,
  baseSellRate: new Decimal(15),
  milestones: [
    ...milestonesMelangeur.milestones,
    ...milestonesSaucier.milestones,
    ...milestonesGarnisseuse.milestones,
    ...milestonesGrill.milestones,
    ...milestonesImbiss.milestones,
  ],
}
