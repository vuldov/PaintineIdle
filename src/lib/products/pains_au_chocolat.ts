import Decimal from 'decimal.js'
import { resourceId, buildingId, craftingRecipeId, upgradeId, supplierId, supplierUpgradeId, PANTINS_COINS_ID } from '@/types'
import type { ProductBundle, ResourceData, BuildingData, CraftingRecipeData, UpgradeData, PipelineStageConfig, SupplierData, SupplierUpgradeData } from '@/types'

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
const ATELIER_CHOCOLAT = buildingId('atelier_chocolat')
const FOUR_VENTILE = buildingId('four_ventile')
const CHOCOLATERIE = buildingId('chocolaterie')

const MANUFACTURE = buildingId('manufacture')
const CHAINE_BOULANGERE = buildingId('chaine_boulangere')
const CONSORTIUM_CHOCOLAT = buildingId('consortium_chocolat')

// ─── Resources ─────────────────────────────────────────────────
const resources: Record<string, ResourceData> = {
  [BEURRE_DOUX as string]: {
    id: BEURRE_DOUX, name: 'Beurre doux', emoji: '🧈',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(10), scope: 'pains_au_chocolat',
  },
  [FARINE_QUALITE as string]: {
    id: FARINE_QUALITE, name: 'Farine de qualite', emoji: '🌾',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(15), scope: 'pains_au_chocolat',
  },
  [CHOCOLAT_PATISSIER as string]: {
    id: CHOCOLAT_PATISSIER, name: 'Chocolat patissier', emoji: '🍫',
    category: 'ingredient', initiallyUnlocked: true,
    initialAmount: new Decimal(5), scope: 'pains_au_chocolat',
  },
  [PATE_LEVEE_FEUILLETEE as string]: {
    id: PATE_LEVEE_FEUILLETEE, name: 'Pate levee feuilletee', emoji: '🫓',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pains_au_chocolat',
  },
  [PATON_CHOCOLAT as string]: {
    id: PATON_CHOCOLAT, name: 'Paton au chocolat', emoji: '🟫',
    category: 'intermediaire', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pains_au_chocolat',
  },
  [PAINS_AU_CHOCOLAT as string]: {
    id: PAINS_AU_CHOCOLAT, name: 'Pains au chocolat', emoji: '🍫',
    category: 'produit_fini', initiallyUnlocked: true,
    initialAmount: new Decimal(0), scope: 'pains_au_chocolat',
  },
}

// ─── Buildings ─────────────────────────────────────────────────
const buildings: Record<string, BuildingData> = {
  [MALAXEUR as string]: {
    id: MALAXEUR, name: 'Malaxeur', emoji: '⚙️',
    description: 'Petrit le beurre et la farine en pate feuilletee',
    baseCost: new Decimal(50), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.45),
    producedResource: PATE_LEVEE_FEUILLETEE, pipelineRole: 'petrissage', scope: 'pains_au_chocolat',
    aura: {
      effectType: 'cross_product_bonus', bonusPerBuilding: new Decimal(0.02),
      crossProductTarget: 'croissants', description: '+2% production croissants par malaxeur',
    },
  },
  [GARNISSEUR as string]: {
    id: GARNISSEUR, name: 'Garnisseur', emoji: '🤲',
    description: 'Insere les batons de chocolat dans la pate',
    baseCost: new Decimal(80), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.35),
    producedResource: PATON_CHOCOLAT, pipelineRole: 'garnissage', scope: 'pains_au_chocolat',
    aura: {
      effectType: 'production_bonus', bonusPerBuilding: new Decimal(0.03),
      targetProduct: 'pains_au_chocolat', description: '+3% production pains au chocolat par garnisseur',
    },
  },
  [ATELIER_CHOCOLAT as string]: {
    id: ATELIER_CHOCOLAT, name: 'Atelier chocolat', emoji: '🍫',
    description: 'Garnissage professionnel a haute cadence',
    baseCost: new Decimal(500), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(1.5),
    producedResource: PATON_CHOCOLAT, pipelineRole: 'garnissage', scope: 'pains_au_chocolat',
    aura: {
      effectType: 'ingredient_generation_bonus', bonusPerBuilding: new Decimal(0.05),
      targetResource: 'chocolat_patissier', description: '+5% génération chocolat par atelier chocolat',
    },
  },
  [FOUR_VENTILE as string]: {
    id: FOUR_VENTILE, name: 'Four ventile', emoji: '🔥',
    description: 'Cuisson homogene pour des pains au chocolat parfaits',
    baseCost: new Decimal(600), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(1.8),
    producedResource: PAINS_AU_CHOCOLAT, pipelineRole: 'cuisson', scope: 'pains_au_chocolat',
    aura: {
      effectType: 'crafting_speed_bonus', bonusPerBuilding: new Decimal(0.02),
      description: '+2% vitesse cuisson globale par four ventilé',
    },
  },
  [CHOCOLATERIE as string]: {
    id: CHOCOLATERIE, name: 'Chocolaterie', emoji: '🏪',
    description: 'Vend automatiquement les pains au chocolat',
    baseCost: new Decimal(1_500), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(0.9),
    producedResource: PANTINS_COINS_ID, pipelineRole: 'vente', scope: 'pains_au_chocolat',
    aura: {
      effectType: 'sell_price_bonus', bonusPerBuilding: new Decimal(0.01),
      description: '+1% prix de vente tous produits par chocolaterie',
    },
  },
[MANUFACTURE as string]: {
    id: MANUFACTURE, name: 'Manufacture', emoji: '🏭',
    description: 'Ligne complete : petrit, garnit, cuit et vend',
    baseCost: new Decimal(30_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(4.5),
    producedResource: PAINS_AU_CHOCOLAT, pipelineRole: 'full_pipeline', scope: 'pains_au_chocolat',
    aura: {
      effectType: 'cross_product_bonus', bonusPerBuilding: new Decimal(0.01),
      crossProductTarget: 'croissants', description: '+1% production croissants par manufacture',
    },
  },
  [CHAINE_BOULANGERE as string]: {
    id: CHAINE_BOULANGERE, name: 'Chaine boulangere', emoji: '🗺️',
    description: 'Reseau de ventes specialisees',
    baseCost: new Decimal(150_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(9),
    producedResource: PANTINS_COINS_ID, pipelineRole: 'vente', scope: 'pains_au_chocolat',
  },
  [CONSORTIUM_CHOCOLAT as string]: {
    id: CONSORTIUM_CHOCOLAT, name: 'Consortium chocolat', emoji: '🌍',
    description: 'Empire mondial du pain au chocolat',
    baseCost: new Decimal(1_500_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(45),
    producedResource: PAINS_AU_CHOCOLAT, pipelineRole: 'full_pipeline', scope: 'pains_au_chocolat',
    aura: {
      effectType: 'global_production_bonus', bonusPerBuilding: new Decimal(0.005),
      description: '+0,5% production globale par consortium chocolat',
    },
  },
}

// ─── Pipeline config ───────────────────────────────────────────
//  Petrissage: beurre + farine -> pate feuilletee
//  Garnissage: pate + chocolat -> paton au chocolat
//  Cuisson:    paton -> pains au chocolat
//  Vente:      pains au chocolat -> coins
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
        { resource: PANTINS_COINS_ID, ratio: new Decimal(1) },
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
    id: PETRISSAGE_PAC, name: 'Petrissage', emoji: '🤲',
    verb: 'Petrir',
    inputs: [
      { resource: BEURRE_DOUX, amount: new Decimal(2) },
      { resource: FARINE_QUALITE, amount: new Decimal(3) },
    ],
    output: { resource: PATE_LEVEE_FEUILLETEE, amount: new Decimal(2) },
    durationSeconds: 4,
    scope: 'pains_au_chocolat',
  },
  [GARNISSAGE_PAC as string]: {
    id: GARNISSAGE_PAC, name: 'Garnissage', emoji: '🍫',
    verb: 'Garnir',
    inputs: [
      { resource: PATE_LEVEE_FEUILLETEE, amount: new Decimal(2) },
      { resource: CHOCOLAT_PATISSIER, amount: new Decimal(2) },
    ],
    output: { resource: PATON_CHOCOLAT, amount: new Decimal(2) },
    durationSeconds: 3,
    scope: 'pains_au_chocolat',
  },
  [CUISSON_PAC as string]: {
    id: CUISSON_PAC, name: 'Cuisson', emoji: '🔥',
    verb: 'Cuire',
    inputs: [
      { resource: PATON_CHOCOLAT, amount: new Decimal(2) },
    ],
    output: { resource: PAINS_AU_CHOCOLAT, amount: new Decimal(3) },
    durationSeconds: 6,
    scope: 'pains_au_chocolat',
  },
}

// ─── Upgrades ──────────────────────────────────────────────────
const upgrades: Record<string, UpgradeData> = {
  pac_petrissage_rapide: {
    id: upgradeId('pac_petrissage_rapide'), name: 'Petrissage rapide',
    description: 'Petrissage 2x plus rapide', emoji: '⚡',
    cost: new Decimal(100), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: PETRISSAGE_PAC, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PATE_LEVEE_FEUILLETEE, threshold: new Decimal(5) },
    scope: 'pains_au_chocolat',
  },
  pac_garnissage_rapide: {
    id: upgradeId('pac_garnissage_rapide'), name: 'Garnissage rapide',
    description: 'Garnissage 2x plus rapide', emoji: '⚡',
    cost: new Decimal(150), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: GARNISSAGE_PAC, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PATON_CHOCOLAT, threshold: new Decimal(5) },
    scope: 'pains_au_chocolat',
  },
  pac_cuisson_rapide: {
    id: upgradeId('pac_cuisson_rapide'), name: 'Cuisson rapide',
    description: 'Cuisson 2x plus rapide', emoji: '⚡',
    cost: new Decimal(200), costResource: PANTINS_COINS_ID,
    effect: { type: 'crafting_speed', targetRecipe: CUISSON_PAC, multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PAINS_AU_CHOCOLAT, threshold: new Decimal(10) },
    scope: 'pains_au_chocolat',
  },
  pac_malaxeur_boost: {
    id: upgradeId('pac_malaxeur_boost'), name: 'Malaxeur renforce',
    description: 'x2 production du malaxeur', emoji: '⚙️',
    cost: new Decimal(300), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: MALAXEUR, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: MALAXEUR, threshold: new Decimal(5) },
    scope: 'pains_au_chocolat',
  },
  pac_garnisseur_boost: {
    id: upgradeId('pac_garnisseur_boost'), name: 'Garnisseur automatique',
    description: 'x2 production du garnisseur', emoji: '🤲',
    cost: new Decimal(500), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: GARNISSEUR, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: GARNISSEUR, threshold: new Decimal(5) },
    scope: 'pains_au_chocolat',
  },
  chocolat_suisse: {
    id: upgradeId('chocolat_suisse'), name: 'Chocolat suisse',
    description: 'x2 production de l\'atelier chocolat', emoji: '🍫',
    cost: new Decimal(3_000), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: ATELIER_CHOCOLAT, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: ATELIER_CHOCOLAT, threshold: new Decimal(5) },
    scope: 'pains_au_chocolat',
  },
  cuisson_parfaite: {
    id: upgradeId('cuisson_parfaite'), name: 'Cuisson parfaite',
    description: 'x2 production du four ventile', emoji: '🔥',
    cost: new Decimal(3_500), costResource: PANTINS_COINS_ID,
    effect: { type: 'building_multiplier', targetBuilding: FOUR_VENTILE, multiplier: new Decimal(2) },
    unlockCondition: { type: 'building_count', buildingId: FOUR_VENTILE, threshold: new Decimal(5) },
    scope: 'pains_au_chocolat',
  },
  pac_meilleur_prix: {
    id: upgradeId('pac_meilleur_prix'), name: 'Emballage premium',
    description: 'x2 prix de vente', emoji: '💰',
    cost: new Decimal(500), costResource: PANTINS_COINS_ID,
    effect: { type: 'sell_multiplier', multiplier: new Decimal(2) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(300) },
    scope: 'pains_au_chocolat',
  },
  pac_farine_premium: {
    id: upgradeId('pac_farine_premium'), name: 'Farine premium',
    description: 'x1,5 production de tous les batiments PAC', emoji: '🌾',
    cost: new Decimal(1_500), costResource: PANTINS_COINS_ID,
    effect: { type: 'global_multiplier', multiplier: new Decimal(1.5) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(800) },
    scope: 'pains_au_chocolat',
  },
  pac_achat_en_gros: {
    id: upgradeId('pac_achat_en_gros'), name: 'Achats groupes',
    description: 'Batiments PAC 15% moins chers', emoji: '📦',
    cost: new Decimal(2_500), costResource: PANTINS_COINS_ID,
    effect: { type: 'cost_reduction', multiplier: new Decimal(0.85) },
    unlockCondition: { type: 'resource_threshold', resourceId: PANTINS_COINS_ID, threshold: new Decimal(1_500) },
    scope: 'pains_au_chocolat',
  },
}

// ─── Suppliers (1 per ingredient) ────────────────────────────
const CREMERIE_NORMANDE = supplierId('cremerie_normande')
const MINOTERIE = supplierId('minoterie')
const CHOCOLATIER_BELGE = supplierId('chocolatier_suisse')

const suppliers: Record<string, SupplierData> = {
  [CREMERIE_NORMANDE as string]: {
    id: CREMERIE_NORMANDE, name: 'Cremerie normande', emoji: '🧈',
    description: 'Beurre doux de Normandie, onctueux et frais',
    producedResource: BEURRE_DOUX,
    baseMaxRate: new Decimal(2.5), baseCostPerSecond: new Decimal(1.5),
    contractCost: new Decimal(500), scope: 'pains_au_chocolat',
  },
  [MINOTERIE as string]: {
    id: MINOTERIE, name: 'Minoterie', emoji: '🌾',
    description: 'Farine de qualite superieure moulue sur pierre',
    producedResource: FARINE_QUALITE,
    baseMaxRate: new Decimal(3.5), baseCostPerSecond: new Decimal(2),
    contractCost: new Decimal(600), scope: 'pains_au_chocolat',
  },
  [CHOCOLATIER_BELGE as string]: {
    id: CHOCOLATIER_BELGE, name: 'Chocolatier suisse', emoji: '🍫',
    description: 'Chocolat patissier fin importe de Belgique',
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
    name: 'Livraison express beurre', emoji: '🧈',
    description: 'x3 debit max - Cremerie normande',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(15), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_cost_1') as string]: {
    id: supplierUpgradeId('cremerie_normande_cost_1'),
    name: 'Contrat cremerie', emoji: '🧈',
    description: 'x0,8 cout - Cremerie normande',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(27), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_rate_2') as string]: {
    id: supplierUpgradeId('cremerie_normande_rate_2'),
    name: 'Livraison express beurre II', emoji: '🧈',
    description: 'x3 debit max - Cremerie normande',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(49), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_cost_2') as string]: {
    id: supplierUpgradeId('cremerie_normande_cost_2'),
    name: 'Contrat cremerie II', emoji: '🧈',
    description: 'x0,8 cout - Cremerie normande',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(87), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_rate_3') as string]: {
    id: supplierUpgradeId('cremerie_normande_rate_3'),
    name: 'Livraison express beurre III', emoji: '🧈',
    description: 'x3 debit max - Cremerie normande',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(157), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_cost_3') as string]: {
    id: supplierUpgradeId('cremerie_normande_cost_3'),
    name: 'Contrat cremerie III', emoji: '🧈',
    description: 'x0,8 cout - Cremerie normande',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(283), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_rate_4') as string]: {
    id: supplierUpgradeId('cremerie_normande_rate_4'),
    name: 'Livraison express beurre IV', emoji: '🧈',
    description: 'x3 debit max - Cremerie normande',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(510), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_cost_4') as string]: {
    id: supplierUpgradeId('cremerie_normande_cost_4'),
    name: 'Contrat cremerie IV', emoji: '🧈',
    description: 'x0,8 cout - Cremerie normande',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(918), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_rate_5') as string]: {
    id: supplierUpgradeId('cremerie_normande_rate_5'),
    name: 'Livraison express beurre V', emoji: '🧈',
    description: 'x3 debit max - Cremerie normande',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(1653), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_cost_5') as string]: {
    id: supplierUpgradeId('cremerie_normande_cost_5'),
    name: 'Contrat cremerie V', emoji: '🧈',
    description: 'x0,8 cout - Cremerie normande',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(2975), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('cremerie_normande_rate_6') as string]: {
    id: supplierUpgradeId('cremerie_normande_rate_6'),
    name: 'Livraison express beurre VI', emoji: '🧈',
    description: 'Debit max fixe a 1 000/s - Cremerie normande',
    targetSupplier: CREMERIE_NORMANDE,
    cost: new Decimal(5356), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'set_max_rate', effectValue: new Decimal(1000),
    scope: 'pains_au_chocolat',
  },

  // ── Minoterie (baseCost=15, costGrowth=1.8, costResource=PATE_LEVEE_FEUILLETEE) ──
  [supplierUpgradeId('minoterie_rate_1') as string]: {
    id: supplierUpgradeId('minoterie_rate_1'),
    name: 'Mouture fine', emoji: '🌾',
    description: 'x3 debit max - Minoterie',
    targetSupplier: MINOTERIE,
    cost: new Decimal(15), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_cost_1') as string]: {
    id: supplierUpgradeId('minoterie_cost_1'),
    name: 'Contrat minoterie', emoji: '🌾',
    description: 'x0,8 cout - Minoterie',
    targetSupplier: MINOTERIE,
    cost: new Decimal(27), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_rate_2') as string]: {
    id: supplierUpgradeId('minoterie_rate_2'),
    name: 'Mouture fine II', emoji: '🌾',
    description: 'x3 debit max - Minoterie',
    targetSupplier: MINOTERIE,
    cost: new Decimal(49), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_cost_2') as string]: {
    id: supplierUpgradeId('minoterie_cost_2'),
    name: 'Contrat minoterie II', emoji: '🌾',
    description: 'x0,8 cout - Minoterie',
    targetSupplier: MINOTERIE,
    cost: new Decimal(87), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_rate_3') as string]: {
    id: supplierUpgradeId('minoterie_rate_3'),
    name: 'Mouture fine III', emoji: '🌾',
    description: 'x3 debit max - Minoterie',
    targetSupplier: MINOTERIE,
    cost: new Decimal(157), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_cost_3') as string]: {
    id: supplierUpgradeId('minoterie_cost_3'),
    name: 'Contrat minoterie III', emoji: '🌾',
    description: 'x0,8 cout - Minoterie',
    targetSupplier: MINOTERIE,
    cost: new Decimal(283), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_rate_4') as string]: {
    id: supplierUpgradeId('minoterie_rate_4'),
    name: 'Mouture fine IV', emoji: '🌾',
    description: 'x3 debit max - Minoterie',
    targetSupplier: MINOTERIE,
    cost: new Decimal(510), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_cost_4') as string]: {
    id: supplierUpgradeId('minoterie_cost_4'),
    name: 'Contrat minoterie IV', emoji: '🌾',
    description: 'x0,8 cout - Minoterie',
    targetSupplier: MINOTERIE,
    cost: new Decimal(918), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_rate_5') as string]: {
    id: supplierUpgradeId('minoterie_rate_5'),
    name: 'Mouture fine V', emoji: '🌾',
    description: 'x3 debit max - Minoterie',
    targetSupplier: MINOTERIE,
    cost: new Decimal(1653), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_cost_5') as string]: {
    id: supplierUpgradeId('minoterie_cost_5'),
    name: 'Contrat minoterie V', emoji: '🌾',
    description: 'x0,8 cout - Minoterie',
    targetSupplier: MINOTERIE,
    cost: new Decimal(2975), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('minoterie_rate_6') as string]: {
    id: supplierUpgradeId('minoterie_rate_6'),
    name: 'Mouture fine VI', emoji: '🌾',
    description: 'Debit max fixe a 1 000/s - Minoterie',
    targetSupplier: MINOTERIE,
    cost: new Decimal(5356), costResource: PATE_LEVEE_FEUILLETEE,
    effectType: 'set_max_rate', effectValue: new Decimal(1000),
    scope: 'pains_au_chocolat',
  },

  // ── Chocolatier suisse (baseCost=10, costGrowth=1.8, costResource=PATON_CHOCOLAT) ──
  [supplierUpgradeId('chocolatier_suisse_rate_1') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_rate_1'),
    name: 'Cacao grand cru', emoji: '🍫',
    description: 'x3 debit max - Chocolatier suisse',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(10), costResource: PATON_CHOCOLAT,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_cost_1') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_cost_1'),
    name: 'Contrat chocolatier', emoji: '🍫',
    description: 'x0,8 cout - Chocolatier suisse',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(18), costResource: PATON_CHOCOLAT,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_rate_2') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_rate_2'),
    name: 'Cacao grand cru II', emoji: '🍫',
    description: 'x3 debit max - Chocolatier suisse',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(32), costResource: PATON_CHOCOLAT,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_cost_2') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_cost_2'),
    name: 'Contrat chocolatier II', emoji: '🍫',
    description: 'x0,8 cout - Chocolatier suisse',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(58), costResource: PATON_CHOCOLAT,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_rate_3') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_rate_3'),
    name: 'Cacao grand cru III', emoji: '🍫',
    description: 'x3 debit max - Chocolatier suisse',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(105), costResource: PATON_CHOCOLAT,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_cost_3') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_cost_3'),
    name: 'Contrat chocolatier III', emoji: '🍫',
    description: 'x0,8 cout - Chocolatier suisse',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(189), costResource: PATON_CHOCOLAT,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_rate_4') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_rate_4'),
    name: 'Cacao grand cru IV', emoji: '🍫',
    description: 'x3 debit max - Chocolatier suisse',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(340), costResource: PATON_CHOCOLAT,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_cost_4') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_cost_4'),
    name: 'Contrat chocolatier IV', emoji: '🍫',
    description: 'x0,8 cout - Chocolatier suisse',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(612), costResource: PATON_CHOCOLAT,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_rate_5') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_rate_5'),
    name: 'Cacao grand cru V', emoji: '🍫',
    description: 'x3 debit max - Chocolatier suisse',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(1102), costResource: PATON_CHOCOLAT,
    effectType: 'max_rate_bonus', effectValue: new Decimal(3),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_cost_5') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_cost_5'),
    name: 'Contrat chocolatier V', emoji: '🍫',
    description: 'x0,8 cout - Chocolatier suisse',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(1984), costResource: PATON_CHOCOLAT,
    effectType: 'cost_reduction', effectValue: new Decimal(0.8),
    scope: 'pains_au_chocolat',
  },
  [supplierUpgradeId('chocolatier_suisse_rate_6') as string]: {
    id: supplierUpgradeId('chocolatier_suisse_rate_6'),
    name: 'Cacao grand cru VI', emoji: '🍫',
    description: 'Debit max fixe a 1 000/s - Chocolatier suisse',
    targetSupplier: CHOCOLATIER_BELGE,
    cost: new Decimal(3570), costResource: PATON_CHOCOLAT,
    effectType: 'set_max_rate', effectValue: new Decimal(1000),
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

// ─── Bundle ────────────────────────────────────────────────────

export const PAINS_AU_CHOCOLAT_BUNDLE: ProductBundle = {
  definition: {
    id: 'pains_au_chocolat',
    name: 'Pains au chocolat',
    emoji: '🍫',
    color: 'orange',
    unlockCondition: { resource: PANTINS_COINS_ID, amount: new Decimal(10_000) },
  },
  resources,
  buildings,
  buildingOrder: [MALAXEUR, GARNISSEUR, ATELIER_CHOCOLAT, FOUR_VENTILE, CHOCOLATERIE, MANUFACTURE, CHAINE_BOULANGERE, CONSORTIUM_CHOCOLAT],
  buildingUnlockThresholds: {
    [MALAXEUR as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(15) },
    [GARNISSEUR as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(15) },
    [ATELIER_CHOCOLAT as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(200) },
    [FOUR_VENTILE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(250) },
    [CHOCOLATERIE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(600) },
[MANUFACTURE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(12_000) },
    [CHAINE_BOULANGERE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(60_000) },
    [CONSORTIUM_CHOCOLAT as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(600_000) },
  },
  craftingRecipes,
  craftingOrder: [PETRISSAGE_PAC, GARNISSAGE_PAC, CUISSON_PAC],
  upgrades,
  upgradeOrder: [
    upgradeId('pac_petrissage_rapide'),
    upgradeId('pac_garnissage_rapide'),
    upgradeId('pac_cuisson_rapide'),
    upgradeId('pac_meilleur_prix'),
    upgradeId('pac_malaxeur_boost'),
    upgradeId('pac_garnisseur_boost'),
    upgradeId('chocolat_suisse'),
    upgradeId('cuisson_parfaite'),
    upgradeId('pac_farine_premium'),
    upgradeId('pac_achat_en_gros'),
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
}
