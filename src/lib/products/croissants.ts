import Decimal from 'decimal.js'
import { resourceId, buildingId, craftingRecipeId, upgradeId, supplierId, supplierUpgradeId, PANTINS_COINS_ID } from '@/types'
import type { ProductBundle, ResourceData, BuildingData, CraftingRecipeData, UpgradeData, PipelineStageConfig, SupplierData, SupplierUpgradeData } from '@/types'
import { generateMilestones } from '@/lib/milestones/generateMilestones'

// ─── Resource IDs ──────────────────────────────────────────────
const BEURRE = resourceId('beurre')
const FARINE = resourceId('farine')
const PATE_FEUILLETEE = resourceId('pate_feuilletee')
const CROISSANTS = resourceId('croissants')

// ─── Building IDs ──────────────────────────────────────────────
const FOURNIL = buildingId('fournil')
const PETRIN = buildingId('petrin')
const BOUTIQUE = buildingId('boutique')

// ─── Resources ─────────────────────────────────────────────────
const resources: Record<string, ResourceData> = {
  [BEURRE as string]: {
    id: BEURRE, name: 'resources.beurre.name', emoji: 'resources.beurre.emoji',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(10), scope: 'croissants',
  },
  [FARINE as string]: {
    id: FARINE, name: 'resources.farine.name', emoji: 'resources.farine.emoji',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(20), scope: 'croissants',
  },
  [PATE_FEUILLETEE as string]: {
    id: PATE_FEUILLETEE, name: 'resources.pate_feuilletee.name', emoji: 'resources.pate_feuilletee.emoji',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'croissants',
  },
  [CROISSANTS as string]: {
    id: CROISSANTS, name: 'shared_resources.croissants.name', emoji: 'shared_resources.croissants.emoji',
    category: 'produit_fini', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'croissants',
  },
}

// ─── Buildings ─────────────────────────────────────────────────
const buildings: Record<string, BuildingData> = {
  [FOURNIL as string]: {
    id: FOURNIL, name: 'buildings.fournil.name', emoji: 'buildings.fournil.emoji',
    description: 'buildings.fournil.description',
    baseCost: new Decimal(15), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.4),
    producedResource: CROISSANTS, pipelineRole: 'cuisson', scope: 'croissants',
    aura: {
      effectType: 'production_bonus', bonusPerBuilding: new Decimal(0.01),
      targetProduct: 'croissants', description: 'buildings.fournil.aura_description',
    },
  },
  [PETRIN as string]: {
    id: PETRIN, name: 'buildings.petrin.name', emoji: 'buildings.petrin.emoji',
    description: 'buildings.petrin.description',
    baseCost: new Decimal(30), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.5),
    producedResource: PATE_FEUILLETEE, pipelineRole: 'petrissage', scope: 'croissants',
    aura: {
      effectType: 'crafting_speed_bonus', bonusPerBuilding: new Decimal(0.02),
      targetRecipe: 'petrissage_croissant', description: 'buildings.petrin.aura_description',
    },
  },
  [BOUTIQUE as string]: {
    id: BOUTIQUE, name: 'buildings.boutique.name', emoji: 'buildings.boutique.emoji',
    description: 'buildings.boutique.description',
    baseCost: new Decimal(500), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(1),
    producedResource: PANTINS_COINS_ID, pipelineRole: 'vente', scope: 'croissants',
    aura: {
      effectType: 'sell_price_bonus', bonusPerBuilding: new Decimal(0.05),
      targetProduct: 'croissants', description: 'buildings.boutique.aura_description',
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
    id: PETRISSAGE_CROISSANT, name: 'crafting.petrissage_croissant.name', emoji: 'crafting.petrissage_croissant.emoji',
    verb: 'crafting.petrissage_croissant.verb',
    inputs: [
      { resource: BEURRE, amount: new Decimal(2) },
      { resource: FARINE, amount: new Decimal(3) },
    ],
    output: { resource: PATE_FEUILLETEE, amount: new Decimal(2) },
    durationSeconds: 3,
    scope: 'croissants',
    linkedBuildingId: PETRIN,
  },
  [CUISSON_CROISSANT as string]: {
    id: CUISSON_CROISSANT, name: 'crafting.cuisson_croissant.name', emoji: 'crafting.cuisson_croissant.emoji',
    verb: 'crafting.cuisson_croissant.verb',
    inputs: [
      { resource: PATE_FEUILLETEE, amount: new Decimal(2) },
    ],
    output: { resource: CROISSANTS, amount: new Decimal(3) },
    durationSeconds: 5,
    scope: 'croissants',
    linkedBuildingId: FOURNIL,
  },
}

// ─── Upgrades ──────────────────────────────────────────────────
const upgrades: Record<string, UpgradeData> = {
  petrissage_rapide: {
    id: upgradeId('petrissage_rapide'), name: 'upgrades.petrissage_rapide.name',
    description: 'upgrades.petrissage_rapide.description', emoji: 'upgrades.petrissage_rapide.emoji',
    cost: new Decimal(20), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: PETRISSAGE_CROISSANT, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PATE_FEUILLETEE, threshold: new Decimal(5) },
    scope: 'croissants',
  },
  cuisson_rapide: {
    id: upgradeId('cuisson_rapide'), name: 'upgrades.cuisson_rapide.name',
    description: 'upgrades.cuisson_rapide.description', emoji: 'upgrades.cuisson_rapide.emoji',
    cost: new Decimal(30), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: CUISSON_CROISSANT, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: CROISSANTS, threshold: new Decimal(10) },
    scope: 'croissants',
  },
  meilleur_prix: {
    id: upgradeId('meilleur_prix'), name: 'upgrades.meilleur_prix.name',
    description: 'upgrades.meilleur_prix.description', emoji: 'upgrades.meilleur_prix.emoji',
    cost: new Decimal(50), costResource: PANTINS_COINS_ID,
    effect: { type: 'sell_multiplier', multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(30) },
    scope: 'croissants',
  },
  beurre_aop_1: {
    id: upgradeId('beurre_aop_1'), name: 'upgrades.beurre_aop_1.name',
    description: 'upgrades.beurre_aop_1.description', emoji: 'upgrades.beurre_aop_1.emoji',
    cost: new Decimal(100), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: PETRIN, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: PETRIN, threshold: new Decimal(5) },
    scope: 'croissants',
  },
  croissant_dore: {
    id: upgradeId('croissant_dore'), name: 'upgrades.croissant_dore.name',
    description: 'upgrades.croissant_dore.description', emoji: 'upgrades.croissant_dore.emoji',
    cost: new Decimal(150), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: FOURNIL, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: FOURNIL, threshold: new Decimal(5) },
    scope: 'croissants',
  },
  farine_tradition: {
    id: upgradeId('farine_tradition'), name: 'upgrades.farine_tradition.name',
    description: 'upgrades.farine_tradition.description', emoji: 'upgrades.farine_tradition.emoji',
    cost: new Decimal(300), costResource: PANTINS_COINS_ID,
    effect: { type: 'global_multiplier', multiplier: new Decimal(1.5) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(150) },
    scope: 'croissants',
  },
  achat_en_gros: {
    id: upgradeId('achat_en_gros'), name: 'upgrades.achat_en_gros.name',
    description: 'upgrades.achat_en_gros.description', emoji: 'upgrades.achat_en_gros.emoji',
    cost: new Decimal(500), costResource: PANTINS_COINS_ID,
    effect: { type: 'cost_reduction', multiplier: new Decimal(0.85) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(250) },
    scope: 'croissants',
  },
  marketing: {
    id: upgradeId('marketing'), name: 'upgrades.marketing.name',
    description: 'upgrades.marketing.description', emoji: 'upgrades.marketing.emoji',
    cost: new Decimal(2_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'sell_multiplier', multiplier: new Decimal(3) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(1_000) },
    scope: 'croissants',
  },
  vitrine_refrigeree: {
    id: upgradeId('vitrine_refrigeree'), name: 'upgrades.vitrine_refrigeree.name',
    description: 'upgrades.vitrine_refrigeree.description', emoji: 'upgrades.vitrine_refrigeree.emoji',
    cost: new Decimal(5_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: BOUTIQUE, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: BOUTIQUE, threshold: new Decimal(5) },
    scope: 'croissants',
  },
  negociation_fournisseurs: {
    id: upgradeId('negociation_fournisseurs'), name: 'upgrades.negociation_fournisseurs.name',
    description: 'upgrades.negociation_fournisseurs.description', emoji: 'upgrades.negociation_fournisseurs.emoji',
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
    id: BEURRIER_ARTISANAL, name: 'suppliers.beurrier_artisanal.name', emoji: 'suppliers.beurrier_artisanal.emoji',
    description: 'suppliers.beurrier_artisanal.description',
    producedResource: BEURRE,
    baseMaxRate: new Decimal(2), baseCostPerSecond: new Decimal(0.4),
    contractCost: new Decimal(50), scope: 'croissants',
  },
  [MOULIN_A_FARINE as string]: {
    id: MOULIN_A_FARINE, name: 'suppliers.moulin_a_farine.name', emoji: 'suppliers.moulin_a_farine.emoji',
    description: 'suppliers.moulin_a_farine.description',
    producedResource: FARINE,
    baseMaxRate: new Decimal(3), baseCostPerSecond: new Decimal(0.6),
    contractCost: new Decimal(80), scope: 'croissants',
  },
}

// ─── Supplier upgrades (inline) ──────────────────────────────
const supplierUpgrades: Record<string, SupplierUpgradeData> = {
  // ── Beurrier artisanal (baseCost=10, costGrowth=1.8, costResource=PATE_FEUILLETEE) ──
  [supplierUpgradeId('beurrier_artisanal_rate_1') as string]: {
    id: supplierUpgradeId('beurrier_artisanal_rate_1'),
    name: 'supplier_upgrades.beurrier_artisanal_rate.name', emoji: 'supplier_upgrades.beurrier_artisanal_rate.emoji',
    description: 'supplier_upgrades.beurrier_artisanal_rate.description',
    targetSupplier: BEURRIER_ARTISANAL,
    cost: new Decimal(10), costResource: PATE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'croissants',
  },
  [supplierUpgradeId('beurrier_artisanal_cost_1') as string]: {
    id: supplierUpgradeId('beurrier_artisanal_cost_1'),
    name: 'supplier_upgrades.beurrier_artisanal_cost.name', emoji: 'supplier_upgrades.beurrier_artisanal_cost.emoji',
    description: 'supplier_upgrades.beurrier_artisanal_cost.description',
    targetSupplier: BEURRIER_ARTISANAL,
    cost: new Decimal(18), costResource: PATE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'croissants',
  },
  [supplierUpgradeId('beurrier_artisanal_rate_2') as string]: {
    id: supplierUpgradeId('beurrier_artisanal_rate_2'),
    name: 'supplier_upgrades.beurrier_artisanal_rate.name', emoji: 'supplier_upgrades.beurrier_artisanal_rate.emoji',
    description: 'supplier_upgrades.beurrier_artisanal_rate.description',
    targetSupplier: BEURRIER_ARTISANAL,
    cost: new Decimal(32), costResource: PATE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'croissants',
  },
  [supplierUpgradeId('beurrier_artisanal_cost_2') as string]: {
    id: supplierUpgradeId('beurrier_artisanal_cost_2'),
    name: 'supplier_upgrades.beurrier_artisanal_cost.name', emoji: 'supplier_upgrades.beurrier_artisanal_cost.emoji',
    description: 'supplier_upgrades.beurrier_artisanal_cost.description',
    targetSupplier: BEURRIER_ARTISANAL,
    cost: new Decimal(58), costResource: PATE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'croissants',
  },
  [supplierUpgradeId('beurrier_artisanal_rate_3') as string]: {
    id: supplierUpgradeId('beurrier_artisanal_rate_3'),
    name: 'supplier_upgrades.beurrier_artisanal_rate.name', emoji: 'supplier_upgrades.beurrier_artisanal_rate.emoji',
    description: 'supplier_upgrades.beurrier_artisanal_rate.description',
    targetSupplier: BEURRIER_ARTISANAL,
    cost: new Decimal(105), costResource: PATE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'croissants',
  },
  [supplierUpgradeId('beurrier_artisanal_cost_3') as string]: {
    id: supplierUpgradeId('beurrier_artisanal_cost_3'),
    name: 'supplier_upgrades.beurrier_artisanal_cost.name', emoji: 'supplier_upgrades.beurrier_artisanal_cost.emoji',
    description: 'supplier_upgrades.beurrier_artisanal_cost.description',
    targetSupplier: BEURRIER_ARTISANAL,
    cost: new Decimal(189), costResource: PATE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'croissants',
  },
  [supplierUpgradeId('beurrier_artisanal_rate_4') as string]: {
    id: supplierUpgradeId('beurrier_artisanal_rate_4'),
    name: 'supplier_upgrades.beurrier_artisanal_rate.name', emoji: 'supplier_upgrades.beurrier_artisanal_rate.emoji',
    description: 'supplier_upgrades.beurrier_artisanal_rate.description',
    targetSupplier: BEURRIER_ARTISANAL,
    cost: new Decimal(340), costResource: PATE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'croissants',
  },
  [supplierUpgradeId('beurrier_artisanal_cost_4') as string]: {
    id: supplierUpgradeId('beurrier_artisanal_cost_4'),
    name: 'supplier_upgrades.beurrier_artisanal_cost.name', emoji: 'supplier_upgrades.beurrier_artisanal_cost.emoji',
    description: 'supplier_upgrades.beurrier_artisanal_cost.description',
    targetSupplier: BEURRIER_ARTISANAL,
    cost: new Decimal(612), costResource: PATE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'croissants',
  },
  [supplierUpgradeId('beurrier_artisanal_rate_5') as string]: {
    id: supplierUpgradeId('beurrier_artisanal_rate_5'),
    name: 'supplier_upgrades.beurrier_artisanal_rate.name', emoji: 'supplier_upgrades.beurrier_artisanal_rate.emoji',
    description: 'supplier_upgrades.beurrier_artisanal_rate.description',
    targetSupplier: BEURRIER_ARTISANAL,
    cost: new Decimal(1102), costResource: PATE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'croissants',
  },
  [supplierUpgradeId('beurrier_artisanal_cost_5') as string]: {
    id: supplierUpgradeId('beurrier_artisanal_cost_5'),
    name: 'supplier_upgrades.beurrier_artisanal_cost.name', emoji: 'supplier_upgrades.beurrier_artisanal_cost.emoji',
    description: 'supplier_upgrades.beurrier_artisanal_cost.description',
    targetSupplier: BEURRIER_ARTISANAL,
    cost: new Decimal(1984), costResource: PATE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'croissants',
  },
  [supplierUpgradeId('beurrier_artisanal_rate_6') as string]: {
    id: supplierUpgradeId('beurrier_artisanal_rate_6'),
    name: 'supplier_upgrades.beurrier_artisanal_rate.name', emoji: 'supplier_upgrades.beurrier_artisanal_rate.emoji',
    description: 'supplier_upgrades.beurrier_artisanal_rate.description',
    targetSupplier: BEURRIER_ARTISANAL,
    cost: new Decimal(3570), costResource: PATE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'croissants',
  },

  // ── Moulin a farine (baseCost=15, costGrowth=2.0, costResource=PATE_FEUILLETEE) ──
  [supplierUpgradeId('moulin_a_farine_rate_1') as string]: {
    id: supplierUpgradeId('moulin_a_farine_rate_1'),
    name: 'supplier_upgrades.moulin_a_farine_rate.name', emoji: 'supplier_upgrades.moulin_a_farine_rate.emoji',
    description: 'supplier_upgrades.moulin_a_farine_rate.description',
    targetSupplier: MOULIN_A_FARINE,
    cost: new Decimal(15), costResource: PATE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'croissants',
  },
  [supplierUpgradeId('moulin_a_farine_cost_1') as string]: {
    id: supplierUpgradeId('moulin_a_farine_cost_1'),
    name: 'supplier_upgrades.moulin_a_farine_cost.name', emoji: 'supplier_upgrades.moulin_a_farine_cost.emoji',
    description: 'supplier_upgrades.moulin_a_farine_cost.description',
    targetSupplier: MOULIN_A_FARINE,
    cost: new Decimal(30), costResource: PATE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'croissants',
  },
  [supplierUpgradeId('moulin_a_farine_rate_2') as string]: {
    id: supplierUpgradeId('moulin_a_farine_rate_2'),
    name: 'supplier_upgrades.moulin_a_farine_rate.name', emoji: 'supplier_upgrades.moulin_a_farine_rate.emoji',
    description: 'supplier_upgrades.moulin_a_farine_rate.description',
    targetSupplier: MOULIN_A_FARINE,
    cost: new Decimal(60), costResource: PATE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'croissants',
  },
  [supplierUpgradeId('moulin_a_farine_cost_2') as string]: {
    id: supplierUpgradeId('moulin_a_farine_cost_2'),
    name: 'supplier_upgrades.moulin_a_farine_cost.name', emoji: 'supplier_upgrades.moulin_a_farine_cost.emoji',
    description: 'supplier_upgrades.moulin_a_farine_cost.description',
    targetSupplier: MOULIN_A_FARINE,
    cost: new Decimal(120), costResource: PATE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'croissants',
  },
  [supplierUpgradeId('moulin_a_farine_rate_3') as string]: {
    id: supplierUpgradeId('moulin_a_farine_rate_3'),
    name: 'supplier_upgrades.moulin_a_farine_rate.name', emoji: 'supplier_upgrades.moulin_a_farine_rate.emoji',
    description: 'supplier_upgrades.moulin_a_farine_rate.description',
    targetSupplier: MOULIN_A_FARINE,
    cost: new Decimal(240), costResource: PATE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'croissants',
  },
  [supplierUpgradeId('moulin_a_farine_cost_3') as string]: {
    id: supplierUpgradeId('moulin_a_farine_cost_3'),
    name: 'supplier_upgrades.moulin_a_farine_cost.name', emoji: 'supplier_upgrades.moulin_a_farine_cost.emoji',
    description: 'supplier_upgrades.moulin_a_farine_cost.description',
    targetSupplier: MOULIN_A_FARINE,
    cost: new Decimal(480), costResource: PATE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'croissants',
  },
  [supplierUpgradeId('moulin_a_farine_rate_4') as string]: {
    id: supplierUpgradeId('moulin_a_farine_rate_4'),
    name: 'supplier_upgrades.moulin_a_farine_rate.name', emoji: 'supplier_upgrades.moulin_a_farine_rate.emoji',
    description: 'supplier_upgrades.moulin_a_farine_rate.description',
    targetSupplier: MOULIN_A_FARINE,
    cost: new Decimal(960), costResource: PATE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'croissants',
  },
  [supplierUpgradeId('moulin_a_farine_cost_4') as string]: {
    id: supplierUpgradeId('moulin_a_farine_cost_4'),
    name: 'supplier_upgrades.moulin_a_farine_cost.name', emoji: 'supplier_upgrades.moulin_a_farine_cost.emoji',
    description: 'supplier_upgrades.moulin_a_farine_cost.description',
    targetSupplier: MOULIN_A_FARINE,
    cost: new Decimal(1920), costResource: PATE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'croissants',
  },
  [supplierUpgradeId('moulin_a_farine_rate_5') as string]: {
    id: supplierUpgradeId('moulin_a_farine_rate_5'),
    name: 'supplier_upgrades.moulin_a_farine_rate.name', emoji: 'supplier_upgrades.moulin_a_farine_rate.emoji',
    description: 'supplier_upgrades.moulin_a_farine_rate.description',
    targetSupplier: MOULIN_A_FARINE,
    cost: new Decimal(3840), costResource: PATE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'croissants',
  },
  [supplierUpgradeId('moulin_a_farine_cost_5') as string]: {
    id: supplierUpgradeId('moulin_a_farine_cost_5'),
    name: 'supplier_upgrades.moulin_a_farine_cost.name', emoji: 'supplier_upgrades.moulin_a_farine_cost.emoji',
    description: 'supplier_upgrades.moulin_a_farine_cost.description',
    targetSupplier: MOULIN_A_FARINE,
    cost: new Decimal(7680), costResource: PATE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'croissants',
  },
  [supplierUpgradeId('moulin_a_farine_rate_6') as string]: {
    id: supplierUpgradeId('moulin_a_farine_rate_6'),
    name: 'supplier_upgrades.moulin_a_farine_rate.name', emoji: 'supplier_upgrades.moulin_a_farine_rate.emoji',
    description: 'supplier_upgrades.moulin_a_farine_rate.description',
    targetSupplier: MOULIN_A_FARINE,
    cost: new Decimal(15360), costResource: PATE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'croissants',
  },
}

const supplierUpgradeOrder = [
  // Beurrier artisanal
  supplierUpgradeId('beurrier_artisanal_rate_1'),
  supplierUpgradeId('beurrier_artisanal_cost_1'),
  supplierUpgradeId('beurrier_artisanal_rate_2'),
  supplierUpgradeId('beurrier_artisanal_cost_2'),
  supplierUpgradeId('beurrier_artisanal_rate_3'),
  supplierUpgradeId('beurrier_artisanal_cost_3'),
  supplierUpgradeId('beurrier_artisanal_rate_4'),
  supplierUpgradeId('beurrier_artisanal_cost_4'),
  supplierUpgradeId('beurrier_artisanal_rate_5'),
  supplierUpgradeId('beurrier_artisanal_cost_5'),
  supplierUpgradeId('beurrier_artisanal_rate_6'),
  // Moulin a farine
  supplierUpgradeId('moulin_a_farine_rate_1'),
  supplierUpgradeId('moulin_a_farine_cost_1'),
  supplierUpgradeId('moulin_a_farine_rate_2'),
  supplierUpgradeId('moulin_a_farine_cost_2'),
  supplierUpgradeId('moulin_a_farine_rate_3'),
  supplierUpgradeId('moulin_a_farine_cost_3'),
  supplierUpgradeId('moulin_a_farine_rate_4'),
  supplierUpgradeId('moulin_a_farine_cost_4'),
  supplierUpgradeId('moulin_a_farine_rate_5'),
  supplierUpgradeId('moulin_a_farine_cost_5'),
  supplierUpgradeId('moulin_a_farine_rate_6'),
]

// ─── Milestones → Upgrades ─────────────────────────────────────

const milestonesPetrin = generateMilestones(PETRIN, 'petrissage', 'Petrin mecanique', 'croissants', PATE_FEUILLETEE, 2)
const milestonesFournil = generateMilestones(FOURNIL, 'cuisson', 'Fournil', 'croissants', PATE_FEUILLETEE, 1)
const milestonesBoutique = generateMilestones(BOUTIQUE, 'vente', 'Boutique', 'croissants', PATE_FEUILLETEE, 30)

const allMilestoneUpgrades: Record<string, UpgradeData> = {
  ...milestonesPetrin.upgrades,
  ...milestonesFournil.upgrades,
  ...milestonesBoutique.upgrades,
}

// ─── Bundle ────────────────────────────────────────────────────

export const CROISSANTS_BUNDLE: ProductBundle = {
  definition: {
    id: 'croissants',
    name: 'definition.name',
    emoji: 'definition.emoji',
    color: 'amber',
    unlockCondition: null, // unlocked from start
  },
  resources,
  buildings,
  buildingOrder: [PETRIN, FOURNIL, BOUTIQUE],
  buildingUnlockThresholds: {
    [PETRIN as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(5) },
    [FOURNIL as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(5) },
    [BOUTIQUE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(200) },
  },
  craftingRecipes,
  craftingOrder: [PETRISSAGE_CROISSANT, CUISSON_CROISSANT],
  upgrades: { ...upgrades, ...allMilestoneUpgrades },
  upgradeOrder: [
    upgradeId('petrissage_rapide'),
    upgradeId('cuisson_rapide'),
    upgradeId('meilleur_prix'),
    upgradeId('beurre_aop_1'),
    upgradeId('croissant_dore'),
    upgradeId('farine_tradition'),
    upgradeId('achat_en_gros'),
    upgradeId('marketing'),
    upgradeId('vitrine_refrigeree'),
    upgradeId('negociation_fournisseurs'),
    ...milestonesPetrin.upgradeOrder.map(id => upgradeId(id)),
    ...milestonesFournil.upgradeOrder.map(id => upgradeId(id)),
    ...milestonesBoutique.upgradeOrder.map(id => upgradeId(id)),
  ],
  suppliers,
  supplierOrder: [BEURRIER_ARTISANAL, MOULIN_A_FARINE],
  supplierUpgrades,
  supplierUpgradeOrder,
  pipelineConfig,
  passiveRegen: {
    [BEURRE as string]: new Decimal(0.2),
    [FARINE as string]: new Decimal(0.3),
  },
  finishedProductId: CROISSANTS,
  baseSellRate: new Decimal(1),
  milestones: [
    ...milestonesPetrin.milestones,
    ...milestonesFournil.milestones,
    ...milestonesBoutique.milestones,
  ],
}
