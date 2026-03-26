import Decimal from 'decimal.js'
import { resourceId, buildingId, craftingRecipeId, upgradeId, supplierId, supplierUpgradeId, PANTINS_COINS_ID } from '@/types'
import type { ProductBundle, ResourceData, BuildingData, CraftingRecipeData, UpgradeData, PipelineStageConfig, SupplierData, SupplierUpgradeData } from '@/types'
import { generateMilestones } from '@/lib/milestones/generateMilestones'

// ─── Resource IDs ──────────────────────────────────────────────
const BEURRE_DOUX = resourceId('beurre_doux')
const FARINE_QUALITE = resourceId('farine_qualite')
const CHOCOLAT_PATISSIER = resourceId('chocolat_patissier')
const PATE_LEVEE_FEUILLETEE = resourceId('pate_levee_feuilletee')
const PATON_CHOCOLAT = resourceId('paton_chocolat')
const PAINS_AU_CHOCOLAT = resourceId('pains_au_chocolat')

// ─── Building IDs ──────────────────────────────────────────────
const MALAXEUR = buildingId('malaxeur')
const GARNISSEUR = buildingId('garnisseur')
const FOUR_VENTILE = buildingId('four_ventile')
const CHOCOLATERIE = buildingId('chocolaterie')

// ─── Resources ─────────────────────────────────────────────────
const resources: Record<string, ResourceData> = {
  [BEURRE_DOUX as string]: {
    id: BEURRE_DOUX, name: 'resources.beurre_doux.name', emoji: 'resources.beurre_doux.emoji',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(10), scope: 'pains_au_chocolat',
  },
  [FARINE_QUALITE as string]: {
    id: FARINE_QUALITE, name: 'resources.farine_qualite.name', emoji: 'resources.farine_qualite.emoji',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(15), scope: 'pains_au_chocolat',
  },
  [CHOCOLAT_PATISSIER as string]: {
    id: CHOCOLAT_PATISSIER, name: 'resources.chocolat_patissier.name', emoji: 'resources.chocolat_patissier.emoji',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(5), scope: 'pains_au_chocolat',
  },
  [PATE_LEVEE_FEUILLETEE as string]: {
    id: PATE_LEVEE_FEUILLETEE, name: 'resources.pate_levee_feuilletee.name', emoji: 'resources.pate_levee_feuilletee.emoji',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pains_au_chocolat',
  },
  [PATON_CHOCOLAT as string]: {
    id: PATON_CHOCOLAT, name: 'resources.paton_chocolat.name', emoji: 'resources.paton_chocolat.emoji',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pains_au_chocolat',
  },
  [PAINS_AU_CHOCOLAT as string]: {
    id: PAINS_AU_CHOCOLAT, name: 'shared_resources.pains_au_chocolat.name', emoji: 'shared_resources.pains_au_chocolat.emoji',
    category: 'produit_fini', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pains_au_chocolat',
  },
}

// ─── Buildings ─────────────────────────────────────────────────
const buildings: Record<string, BuildingData> = {
  [MALAXEUR as string]: {
    id: MALAXEUR, name: 'buildings.malaxeur.name', emoji: 'buildings.malaxeur.emoji',
    description: 'buildings.malaxeur.description',
    baseCost: new Decimal(50), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.45),
    producedResource: PATE_LEVEE_FEUILLETEE, pipelineRole: 'petrissage', scope: 'pains_au_chocolat',
    aura: {
      effectType: 'cross_product_bonus', bonusPerBuilding: new Decimal(0.02),
      crossProductTarget: 'croissants', description: 'buildings.malaxeur.aura_description',
    },
  },
  [GARNISSEUR as string]: {
    id: GARNISSEUR, name: 'buildings.garnisseur.name', emoji: 'buildings.garnisseur.emoji',
    description: 'buildings.garnisseur.description',
    baseCost: new Decimal(80), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.35),
    producedResource: PATON_CHOCOLAT, pipelineRole: 'garnissage', scope: 'pains_au_chocolat',
    aura: {
      effectType: 'production_bonus', bonusPerBuilding: new Decimal(0.03),
      targetProduct: 'pains_au_chocolat', description: 'buildings.garnisseur.aura_description',
    },
  },
  [FOUR_VENTILE as string]: {
    id: FOUR_VENTILE, name: 'buildings.four_ventile.name', emoji: 'buildings.four_ventile.emoji',
    description: 'buildings.four_ventile.description',
    baseCost: new Decimal(600), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(1.8),
    producedResource: PAINS_AU_CHOCOLAT, pipelineRole: 'cuisson', scope: 'pains_au_chocolat',
    aura: {
      effectType: 'crafting_speed_bonus', bonusPerBuilding: new Decimal(0.02),
      description: 'buildings.four_ventile.aura_description',
    },
  },
  [CHOCOLATERIE as string]: {
    id: CHOCOLATERIE, name: 'buildings.chocolaterie.name', emoji: 'buildings.chocolaterie.emoji',
    description: 'buildings.chocolaterie.description',
    baseCost: new Decimal(1_500), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.9),
    producedResource: PANTINS_COINS_ID, pipelineRole: 'vente', scope: 'pains_au_chocolat',
    aura: {
      effectType: 'sell_price_bonus', bonusPerBuilding: new Decimal(0.01),
      description: 'buildings.chocolaterie.aura_description',
    },
  },
}

// ─── Pipeline config ───────────────────────────────────────────
//  Petrissage: beurre + farine -> pate feuilletee
//  Garnissage: pate + chocolat -> paton au chocolat
//  Cuisson:    paton -> chocolatines
//  Vente:      chocolatines -> coins
const pipelineConfig: { stages: PipelineStageConfig[] } = {
  stages: [
    {
      role: 'petrissage',
      consumes: [
        { resource: BEURRE_DOUX, ratio: new Decimal(1) },
        { resource: FARINE_QUALITE, ratio: new Decimal(1.5) },
      ],
      produces: [
        { resource: PATE_LEVEE_FEUILLETEE, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'garnissage',
      consumes: [
        { resource: PATE_LEVEE_FEUILLETEE, ratio: new Decimal(0.8) },
        { resource: CHOCOLAT_PATISSIER, ratio: new Decimal(0.6) },
      ],
      produces: [
        { resource: PATON_CHOCOLAT, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'cuisson',
      consumes: [
        { resource: PATON_CHOCOLAT, ratio: new Decimal(0.8) },
      ],
      produces: [
        { resource: PAINS_AU_CHOCOLAT, ratio: new Decimal(1) },
      ],
    },
    {
      role: 'vente',
      consumes: [
        { resource: PAINS_AU_CHOCOLAT, ratio: new Decimal(1) },
      ],
      produces: [
        { resource: PANTINS_COINS_ID, ratio: new Decimal(1.5) },
      ],
    },
  ],
}

// ─── Crafting recipes ──────────────────────────────────────────
const PETRISSAGE_PAC = craftingRecipeId('petrissage_pac')
const GARNISSAGE_PAC = craftingRecipeId('garnissage_pac')
const CUISSON_PAC = craftingRecipeId('cuisson_pac')

const craftingRecipes: Record<string, CraftingRecipeData> = {
  [PETRISSAGE_PAC as string]: {
    id: PETRISSAGE_PAC, name: 'crafting.petrissage_pac.name', emoji: 'crafting.petrissage_pac.emoji',
    verb: 'crafting.petrissage_pac.verb',
    inputs: [
      { resource: BEURRE_DOUX, amount: new Decimal(2) },
      { resource: FARINE_QUALITE, amount: new Decimal(3) },
    ],
    output: { resource: PATE_LEVEE_FEUILLETEE, amount: new Decimal(2) },
    durationSeconds: 4,
    scope: 'pains_au_chocolat',
    linkedBuildingId: MALAXEUR,
  },
  [GARNISSAGE_PAC as string]: {
    id: GARNISSAGE_PAC, name: 'crafting.garnissage_pac.name', emoji: 'crafting.garnissage_pac.emoji',
    verb: 'crafting.garnissage_pac.verb',
    inputs: [
      { resource: PATE_LEVEE_FEUILLETEE, amount: new Decimal(2) },
      { resource: CHOCOLAT_PATISSIER, amount: new Decimal(2) },
    ],
    output: { resource: PATON_CHOCOLAT, amount: new Decimal(2) },
    durationSeconds: 3,
    scope: 'pains_au_chocolat',
    linkedBuildingId: GARNISSEUR,
  },
  [CUISSON_PAC as string]: {
    id: CUISSON_PAC, name: 'crafting.cuisson_pac.name', emoji: 'crafting.cuisson_pac.emoji',
    verb: 'crafting.cuisson_pac.verb',
    inputs: [
      { resource: PATON_CHOCOLAT, amount: new Decimal(2) },
    ],
    output: { resource: PAINS_AU_CHOCOLAT, amount: new Decimal(3) },
    durationSeconds: 6,
    scope: 'pains_au_chocolat',
    linkedBuildingId: FOUR_VENTILE,
  },
}

// ─── Upgrades ──────────────────────────────────────────────────
const upgrades: Record<string, UpgradeData> = {
  pac_petrissage_rapide: {
    id: upgradeId('pac_petrissage_rapide'), name: 'upgrades.pac_petrissage_rapide.name',
    description: 'upgrades.pac_petrissage_rapide.description', emoji: 'upgrades.pac_petrissage_rapide.emoji',
    cost: new Decimal(250), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: PETRISSAGE_PAC, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PATE_LEVEE_FEUILLETEE, threshold: new Decimal(5) },
    scope: 'pains_au_chocolat',
  },
  pac_garnissage_rapide: {
    id: upgradeId('pac_garnissage_rapide'), name: 'upgrades.pac_garnissage_rapide.name',
    description: 'upgrades.pac_garnissage_rapide.description', emoji: 'upgrades.pac_garnissage_rapide.emoji',
    cost: new Decimal(400), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: GARNISSAGE_PAC, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PATON_CHOCOLAT, threshold: new Decimal(5) },
    scope: 'pains_au_chocolat',
  },
  pac_cuisson_rapide: {
    id: upgradeId('pac_cuisson_rapide'), name: 'upgrades.pac_cuisson_rapide.name',
    description: 'upgrades.pac_cuisson_rapide.description', emoji: 'upgrades.pac_cuisson_rapide.emoji',
    cost: new Decimal(600), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: CUISSON_PAC, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PAINS_AU_CHOCOLAT, threshold: new Decimal(10) },
    scope: 'pains_au_chocolat',
  },
  pac_malaxeur_boost: {
    id: upgradeId('pac_malaxeur_boost'), name: 'upgrades.pac_malaxeur_boost.name',
    description: 'upgrades.pac_malaxeur_boost.description', emoji: 'upgrades.pac_malaxeur_boost.emoji',
    cost: new Decimal(800), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: MALAXEUR, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: MALAXEUR, threshold: new Decimal(5) },
    scope: 'pains_au_chocolat',
  },
  pac_garnisseur_boost: {
    id: upgradeId('pac_garnisseur_boost'), name: 'upgrades.pac_garnisseur_boost.name',
    description: 'upgrades.pac_garnisseur_boost.description', emoji: 'upgrades.pac_garnisseur_boost.emoji',
    cost: new Decimal(1200), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: GARNISSEUR, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: GARNISSEUR, threshold: new Decimal(5) },
    scope: 'pains_au_chocolat',
  },
  cuisson_parfaite: {
    id: upgradeId('cuisson_parfaite'), name: 'upgrades.cuisson_parfaite.name',
    description: 'upgrades.cuisson_parfaite.description', emoji: 'upgrades.cuisson_parfaite.emoji',
    cost: new Decimal(6_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: FOUR_VENTILE, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: FOUR_VENTILE, threshold: new Decimal(5) },
    scope: 'pains_au_chocolat',
  },
  pac_meilleur_prix: {
    id: upgradeId('pac_meilleur_prix'), name: 'upgrades.pac_meilleur_prix.name',
    description: 'upgrades.pac_meilleur_prix.description', emoji: 'upgrades.pac_meilleur_prix.emoji',
    cost: new Decimal(1_500), costResource: PANTINS_COINS_ID,
    effect: { type: 'sell_multiplier', multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(800) },
    scope: 'pains_au_chocolat',
  },
  pac_farine_premium: {
    id: upgradeId('pac_farine_premium'), name: 'upgrades.pac_farine_premium.name',
    description: 'upgrades.pac_farine_premium.description', emoji: 'upgrades.pac_farine_premium.emoji',
    cost: new Decimal(4_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'global_multiplier', multiplier: new Decimal(1.5) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(2_000) },
    scope: 'pains_au_chocolat',
  },
  pac_achat_en_gros: {
    id: upgradeId('pac_achat_en_gros'), name: 'upgrades.pac_achat_en_gros.name',
    description: 'upgrades.pac_achat_en_gros.description', emoji: 'upgrades.pac_achat_en_gros.emoji',
    cost: new Decimal(7_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'cost_reduction', multiplier: new Decimal(0.85) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(4_000) },
    scope: 'pains_au_chocolat',
  },
}

// ─── Suppliers (1 per ingredient) ────────────────────────────
const CREMERIE_NORMANDE = supplierId('cremerie_normande')
const MINOTERIE = supplierId('minoterie')
const CHOCOLATIER_BELGE = supplierId('chocolatier_suisse')

const suppliers: Record<string, SupplierData> = {
  [CREMERIE_NORMANDE as string]: {
    id: CREMERIE_NORMANDE, name: 'suppliers.cremerie_normande.name', emoji: 'suppliers.cremerie_normande.emoji',
    description: 'suppliers.cremerie_normande.description',
    producedResource: BEURRE_DOUX,
    baseMaxRate: new Decimal(2.5), baseCostPerSecond: new Decimal(1.5),
    contractCost: new Decimal(500), scope: 'pains_au_chocolat',
  },
  [MINOTERIE as string]: {
    id: MINOTERIE, name: 'suppliers.minoterie.name', emoji: 'suppliers.minoterie.emoji',
    description: 'suppliers.minoterie.description',
    producedResource: FARINE_QUALITE,
    baseMaxRate: new Decimal(3.5), baseCostPerSecond: new Decimal(2),
    contractCost: new Decimal(600), scope: 'pains_au_chocolat',
  },
  [CHOCOLATIER_BELGE as string]: {
    id: CHOCOLATIER_BELGE, name: 'suppliers.chocolatier_suisse.name', emoji: 'suppliers.chocolatier_suisse.emoji',
    description: 'suppliers.chocolatier_suisse.description',
    producedResource: CHOCOLAT_PATISSIER,
    baseMaxRate: new Decimal(2), baseCostPerSecond: new Decimal(1.2),
    contractCost: new Decimal(800), scope: 'pains_au_chocolat',
  },
}

// ─── Supplier upgrades (inline) ──────────────────────────────
const supplierUpgrades: Record<string, SupplierUpgradeData> = {
  // ── Cremerie normande (baseCost=15, costGrowth=1.8, costResource=PATE_LEVEE_FEUILLETEE) ──
  [supplierUpgradeId('cremerie_normande_rate_1') as string]: {
    id: supplierUpgradeId('cremerie_normande_rate_1'),
    name: 'supplier_upgrades.cremerie_normande_rate.name', emoji: 'supplier_upgrades.cremerie_normande_rate.emoji',
    description: 'supplier_upgrades.cremerie_normande_rate.description',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(15), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_cost_1') as string]: {
    id: supplierUpgradeId('cremerie_normande_cost_1'),
    name: 'supplier_upgrades.cremerie_normande_cost.name', emoji: 'supplier_upgrades.cremerie_normande_cost.emoji',
    description: 'supplier_upgrades.cremerie_normande_cost.description',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(27), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_rate_2') as string]: {
    id: supplierUpgradeId('cremerie_normande_rate_2'),
    name: 'supplier_upgrades.cremerie_normande_rate.name', emoji: 'supplier_upgrades.cremerie_normande_rate.emoji',
    description: 'supplier_upgrades.cremerie_normande_rate.description',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(49), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_cost_2') as string]: {
    id: supplierUpgradeId('cremerie_normande_cost_2'),
    name: 'supplier_upgrades.cremerie_normande_cost.name', emoji: 'supplier_upgrades.cremerie_normande_cost.emoji',
    description: 'supplier_upgrades.cremerie_normande_cost.description',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(87), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_rate_3') as string]: {
    id: supplierUpgradeId('cremerie_normande_rate_3'),
    name: 'supplier_upgrades.cremerie_normande_rate.name', emoji: 'supplier_upgrades.cremerie_normande_rate.emoji',
    description: 'supplier_upgrades.cremerie_normande_rate.description',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(157), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_cost_3') as string]: {
    id: supplierUpgradeId('cremerie_normande_cost_3'),
    name: 'supplier_upgrades.cremerie_normande_cost.name', emoji: 'supplier_upgrades.cremerie_normande_cost.emoji',
    description: 'supplier_upgrades.cremerie_normande_cost.description',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(283), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_rate_4') as string]: {
    id: supplierUpgradeId('cremerie_normande_rate_4'),
    name: 'supplier_upgrades.cremerie_normande_rate.name', emoji: 'supplier_upgrades.cremerie_normande_rate.emoji',
    description: 'supplier_upgrades.cremerie_normande_rate.description',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(510), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_cost_4') as string]: {
    id: supplierUpgradeId('cremerie_normande_cost_4'),
    name: 'supplier_upgrades.cremerie_normande_cost.name', emoji: 'supplier_upgrades.cremerie_normande_cost.emoji',
    description: 'supplier_upgrades.cremerie_normande_cost.description',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(918), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_rate_5') as string]: {
    id: supplierUpgradeId('cremerie_normande_rate_5'),
    name: 'supplier_upgrades.cremerie_normande_rate.name', emoji: 'supplier_upgrades.cremerie_normande_rate.emoji',
    description: 'supplier_upgrades.cremerie_normande_rate.description',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(1653), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_cost_5') as string]: {
    id: supplierUpgradeId('cremerie_normande_cost_5'),
    name: 'supplier_upgrades.cremerie_normande_cost.name', emoji: 'supplier_upgrades.cremerie_normande_cost.emoji',
    description: 'supplier_upgrades.cremerie_normande_cost.description',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(2975), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_rate_6') as string]: {
    id: supplierUpgradeId('cremerie_normande_rate_6'),
    name: 'supplier_upgrades.cremerie_normande_rate.name', emoji: 'supplier_upgrades.cremerie_normande_rate.emoji',
    description: 'supplier_upgrades.cremerie_normande_rate.description',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(5356), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },

  // ── Minoterie (baseCost=22, costGrowth=2.0, costResource=PATE_LEVEE_FEUILLETEE) ──
  [supplierUpgradeId('minoterie_rate_1') as string]: {
    id: supplierUpgradeId('minoterie_rate_1'),
    name: 'supplier_upgrades.minoterie_rate.name', emoji: 'supplier_upgrades.minoterie_rate.emoji',
    description: 'supplier_upgrades.minoterie_rate.description',
    targetSupplier: MINOTERIE,
    cost: new Decimal(22), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_cost_1') as string]: {
    id: supplierUpgradeId('minoterie_cost_1'),
    name: 'supplier_upgrades.minoterie_cost.name', emoji: 'supplier_upgrades.minoterie_cost.emoji',
    description: 'supplier_upgrades.minoterie_cost.description',
    targetSupplier: MINOTERIE,
    cost: new Decimal(44), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_rate_2') as string]: {
    id: supplierUpgradeId('minoterie_rate_2'),
    name: 'supplier_upgrades.minoterie_rate.name', emoji: 'supplier_upgrades.minoterie_rate.emoji',
    description: 'supplier_upgrades.minoterie_rate.description',
    targetSupplier: MINOTERIE,
    cost: new Decimal(88), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_cost_2') as string]: {
    id: supplierUpgradeId('minoterie_cost_2'),
    name: 'supplier_upgrades.minoterie_cost.name', emoji: 'supplier_upgrades.minoterie_cost.emoji',
    description: 'supplier_upgrades.minoterie_cost.description',
    targetSupplier: MINOTERIE,
    cost: new Decimal(176), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_rate_3') as string]: {
    id: supplierUpgradeId('minoterie_rate_3'),
    name: 'supplier_upgrades.minoterie_rate.name', emoji: 'supplier_upgrades.minoterie_rate.emoji',
    description: 'supplier_upgrades.minoterie_rate.description',
    targetSupplier: MINOTERIE,
    cost: new Decimal(352), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_cost_3') as string]: {
    id: supplierUpgradeId('minoterie_cost_3'),
    name: 'supplier_upgrades.minoterie_cost.name', emoji: 'supplier_upgrades.minoterie_cost.emoji',
    description: 'supplier_upgrades.minoterie_cost.description',
    targetSupplier: MINOTERIE,
    cost: new Decimal(704), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_rate_4') as string]: {
    id: supplierUpgradeId('minoterie_rate_4'),
    name: 'supplier_upgrades.minoterie_rate.name', emoji: 'supplier_upgrades.minoterie_rate.emoji',
    description: 'supplier_upgrades.minoterie_rate.description',
    targetSupplier: MINOTERIE,
    cost: new Decimal(1408), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_cost_4') as string]: {
    id: supplierUpgradeId('minoterie_cost_4'),
    name: 'supplier_upgrades.minoterie_cost.name', emoji: 'supplier_upgrades.minoterie_cost.emoji',
    description: 'supplier_upgrades.minoterie_cost.description',
    targetSupplier: MINOTERIE,
    cost: new Decimal(2816), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_rate_5') as string]: {
    id: supplierUpgradeId('minoterie_rate_5'),
    name: 'supplier_upgrades.minoterie_rate.name', emoji: 'supplier_upgrades.minoterie_rate.emoji',
    description: 'supplier_upgrades.minoterie_rate.description',
    targetSupplier: MINOTERIE,
    cost: new Decimal(5632), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_cost_5') as string]: {
    id: supplierUpgradeId('minoterie_cost_5'),
    name: 'supplier_upgrades.minoterie_cost.name', emoji: 'supplier_upgrades.minoterie_cost.emoji',
    description: 'supplier_upgrades.minoterie_cost.description',
    targetSupplier: MINOTERIE,
    cost: new Decimal(11264), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_rate_6') as string]: {
    id: supplierUpgradeId('minoterie_rate_6'),
    name: 'supplier_upgrades.minoterie_rate.name', emoji: 'supplier_upgrades.minoterie_rate.emoji',
    description: 'supplier_upgrades.minoterie_rate.description',
    targetSupplier: MINOTERIE,
    cost: new Decimal(22528), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },

  // ── Chocolatier suisse (baseCost=8, costGrowth=2.15, costResource=PATON_CHOCOLAT) ──
  [supplierUpgradeId('chocolatier_suisse_rate_1') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_rate_1'),
    name: 'supplier_upgrades.chocolatier_suisse_rate.name', emoji: 'supplier_upgrades.chocolatier_suisse_rate.emoji',
    description: 'supplier_upgrades.chocolatier_suisse_rate.description',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(8), costResource: PATON_CHOCOLAT,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_cost_1') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_cost_1'),
    name: 'supplier_upgrades.chocolatier_suisse_cost.name', emoji: 'supplier_upgrades.chocolatier_suisse_cost.emoji',
    description: 'supplier_upgrades.chocolatier_suisse_cost.description',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(17), costResource: PATON_CHOCOLAT,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_rate_2') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_rate_2'),
    name: 'supplier_upgrades.chocolatier_suisse_rate.name', emoji: 'supplier_upgrades.chocolatier_suisse_rate.emoji',
    description: 'supplier_upgrades.chocolatier_suisse_rate.description',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(37), costResource: PATON_CHOCOLAT,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_cost_2') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_cost_2'),
    name: 'supplier_upgrades.chocolatier_suisse_cost.name', emoji: 'supplier_upgrades.chocolatier_suisse_cost.emoji',
    description: 'supplier_upgrades.chocolatier_suisse_cost.description',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(79), costResource: PATON_CHOCOLAT,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_rate_3') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_rate_3'),
    name: 'supplier_upgrades.chocolatier_suisse_rate.name', emoji: 'supplier_upgrades.chocolatier_suisse_rate.emoji',
    description: 'supplier_upgrades.chocolatier_suisse_rate.description',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(170), costResource: PATON_CHOCOLAT,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_cost_3') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_cost_3'),
    name: 'supplier_upgrades.chocolatier_suisse_cost.name', emoji: 'supplier_upgrades.chocolatier_suisse_cost.emoji',
    description: 'supplier_upgrades.chocolatier_suisse_cost.description',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(366), costResource: PATON_CHOCOLAT,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_rate_4') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_rate_4'),
    name: 'supplier_upgrades.chocolatier_suisse_rate.name', emoji: 'supplier_upgrades.chocolatier_suisse_rate.emoji',
    description: 'supplier_upgrades.chocolatier_suisse_rate.description',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(786), costResource: PATON_CHOCOLAT,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_cost_4') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_cost_4'),
    name: 'supplier_upgrades.chocolatier_suisse_cost.name', emoji: 'supplier_upgrades.chocolatier_suisse_cost.emoji',
    description: 'supplier_upgrades.chocolatier_suisse_cost.description',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(1690), costResource: PATON_CHOCOLAT,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_rate_5') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_rate_5'),
    name: 'supplier_upgrades.chocolatier_suisse_rate.name', emoji: 'supplier_upgrades.chocolatier_suisse_rate.emoji',
    description: 'supplier_upgrades.chocolatier_suisse_rate.description',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(3634), costResource: PATON_CHOCOLAT,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_cost_5') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_cost_5'),
    name: 'supplier_upgrades.chocolatier_suisse_cost.name', emoji: 'supplier_upgrades.chocolatier_suisse_cost.emoji',
    description: 'supplier_upgrades.chocolatier_suisse_cost.description',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(7813), costResource: PATON_CHOCOLAT,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_rate_6') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_rate_6'),
    name: 'supplier_upgrades.chocolatier_suisse_rate.name', emoji: 'supplier_upgrades.chocolatier_suisse_rate.emoji',
    description: 'supplier_upgrades.chocolatier_suisse_rate.description',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(16799), costResource: PATON_CHOCOLAT,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
}

const supplierUpgradeOrder = [
  // Cremerie normande
  supplierUpgradeId('cremerie_normande_rate_1'),
  supplierUpgradeId('cremerie_normande_cost_1'),
  supplierUpgradeId('cremerie_normande_rate_2'),
  supplierUpgradeId('cremerie_normande_cost_2'),
  supplierUpgradeId('cremerie_normande_rate_3'),
  supplierUpgradeId('cremerie_normande_cost_3'),
  supplierUpgradeId('cremerie_normande_rate_4'),
  supplierUpgradeId('cremerie_normande_cost_4'),
  supplierUpgradeId('cremerie_normande_rate_5'),
  supplierUpgradeId('cremerie_normande_cost_5'),
  supplierUpgradeId('cremerie_normande_rate_6'),
  // Minoterie
  supplierUpgradeId('minoterie_rate_1'),
  supplierUpgradeId('minoterie_cost_1'),
  supplierUpgradeId('minoterie_rate_2'),
  supplierUpgradeId('minoterie_cost_2'),
  supplierUpgradeId('minoterie_rate_3'),
  supplierUpgradeId('minoterie_cost_3'),
  supplierUpgradeId('minoterie_rate_4'),
  supplierUpgradeId('minoterie_cost_4'),
  supplierUpgradeId('minoterie_rate_5'),
  supplierUpgradeId('minoterie_cost_5'),
  supplierUpgradeId('minoterie_rate_6'),
  // Chocolatier suisse
  supplierUpgradeId('chocolatier_suisse_rate_1'),
  supplierUpgradeId('chocolatier_suisse_cost_1'),
  supplierUpgradeId('chocolatier_suisse_rate_2'),
  supplierUpgradeId('chocolatier_suisse_cost_2'),
  supplierUpgradeId('chocolatier_suisse_rate_3'),
  supplierUpgradeId('chocolatier_suisse_cost_3'),
  supplierUpgradeId('chocolatier_suisse_rate_4'),
  supplierUpgradeId('chocolatier_suisse_cost_4'),
  supplierUpgradeId('chocolatier_suisse_rate_5'),
  supplierUpgradeId('chocolatier_suisse_cost_5'),
  supplierUpgradeId('chocolatier_suisse_rate_6'),
]

// ─── Milestones → Upgrades ─────────────────────────────────────

const milestonesMalaxeur = generateMilestones(MALAXEUR, 'petrissage', 'Malaxeur', 'pains_au_chocolat', PATE_LEVEE_FEUILLETEE, 3)
const milestonesGarnisseur = generateMilestones(GARNISSEUR, 'garnissage', 'Garnisseur', 'pains_au_chocolat', PATE_LEVEE_FEUILLETEE, 5)
const milestonesFourVentile = generateMilestones(FOUR_VENTILE, 'cuisson', 'Four ventile', 'pains_au_chocolat', PATE_LEVEE_FEUILLETEE, 40)
const milestonesChocolaterie = generateMilestones(CHOCOLATERIE, 'vente', 'Chocolaterie', 'pains_au_chocolat', PATE_LEVEE_FEUILLETEE, 100)

const allPacMilestoneUpgrades: Record<string, UpgradeData> = {
  ...milestonesMalaxeur.upgrades,
  ...milestonesGarnisseur.upgrades,
  ...milestonesFourVentile.upgrades,
  ...milestonesChocolaterie.upgrades,
}

// ─── Bundle ────────────────────────────────────────────────────

export const PAINS_AU_CHOCOLAT_BUNDLE: ProductBundle = {
  definition: {
    id: 'pains_au_chocolat',
    name: 'definition.name',
    emoji: 'definition.emoji',
    color: 'orange',
    unlockCondition: { resource: PANTINS_COINS_ID, amount: new Decimal(10_000) },
  },
  resources,
  buildings,
  buildingOrder: [MALAXEUR, GARNISSEUR, FOUR_VENTILE, CHOCOLATERIE],
  buildingUnlockThresholds: {
    [MALAXEUR as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(15) },
    [GARNISSEUR as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(15) },
    [FOUR_VENTILE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(250) },
    [CHOCOLATERIE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(600) },
  },
  craftingRecipes,
  craftingOrder: [PETRISSAGE_PAC, GARNISSAGE_PAC, CUISSON_PAC],
  upgrades: { ...upgrades, ...allPacMilestoneUpgrades },
  upgradeOrder: [
    upgradeId('pac_petrissage_rapide'),
    upgradeId('pac_garnissage_rapide'),
    upgradeId('pac_cuisson_rapide'),
    upgradeId('pac_meilleur_prix'),
    upgradeId('pac_malaxeur_boost'),
    upgradeId('pac_garnisseur_boost'),
    upgradeId('cuisson_parfaite'),
    upgradeId('pac_farine_premium'),
    upgradeId('pac_achat_en_gros'),
    ...milestonesMalaxeur.upgradeOrder.map(id => upgradeId(id)),
    ...milestonesGarnisseur.upgradeOrder.map(id => upgradeId(id)),
    ...milestonesFourVentile.upgradeOrder.map(id => upgradeId(id)),
    ...milestonesChocolaterie.upgradeOrder.map(id => upgradeId(id)),
  ],
  suppliers,
  supplierOrder: [CREMERIE_NORMANDE, MINOTERIE, CHOCOLATIER_BELGE],
  supplierUpgrades,
  supplierUpgradeOrder,
  pipelineConfig,
  passiveRegen: {
    [BEURRE_DOUX as string]: new Decimal(0.2),
    [FARINE_QUALITE as string]: new Decimal(0.3),
    [CHOCOLAT_PATISSIER as string]: new Decimal(0.15),
  },
  finishedProductId: PAINS_AU_CHOCOLAT,
  baseSellRate: new Decimal(4),
  milestones: [
    ...milestonesMalaxeur.milestones,
    ...milestonesGarnisseur.milestones,
    ...milestonesFourVentile.milestones,
    ...milestonesChocolaterie.milestones,
  ],
}
