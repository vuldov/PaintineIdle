import Decimal from 'decimal.js'
import { resourceId, buildingId, craftingRecipeId, upgradeId, PANTINS_COINS_ID } from '@/types'
import type { ProductBundle, ResourceData, BuildingData, CraftingRecipeData, UpgradeData, PipelineStageConfig } from '@/types'

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
const LABO_CACAO = buildingId('labo_cacao')
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
  [LABO_CACAO as string]: {
    id: LABO_CACAO, name: 'Labo cacao', emoji: '🔬',
    description: 'Genere du beurre, de la farine et du chocolat',
    baseCost: new Decimal(5_000), costResource: PANTINS_COINS_ID,
    costMultiplier: 1.15, baseProduction: new Decimal(1.8),
    producedResource: CHOCOLAT_PATISSIER, pipelineRole: 'ingredients', scope: 'pains_au_chocolat',
    aura: {
      effectType: 'cross_product_bonus', bonusPerBuilding: new Decimal(0.02),
      crossProductTarget: 'croissants', description: '+2% production croissants par labo cacao',
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
  chocolat_belge: {
    id: upgradeId('chocolat_belge'), name: 'Chocolat belge',
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
  buildingOrder: [MALAXEUR, GARNISSEUR, ATELIER_CHOCOLAT, FOUR_VENTILE, CHOCOLATERIE, LABO_CACAO, MANUFACTURE, CHAINE_BOULANGERE, CONSORTIUM_CHOCOLAT],
  buildingUnlockThresholds: {
    [MALAXEUR as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(15) },
    [GARNISSEUR as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(15) },
    [ATELIER_CHOCOLAT as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(200) },
    [FOUR_VENTILE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(250) },
    [CHOCOLATERIE as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(600) },
    [LABO_CACAO as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(2_000) },
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
    upgradeId('chocolat_belge'),
    upgradeId('cuisson_parfaite'),
    upgradeId('pac_farine_premium'),
    upgradeId('pac_achat_en_gros'),
  ],
  pipelineConfig,
  passiveRegen: {
    [BEURRE_DOUX as string]: new Decimal(0.2),
    [FARINE_QUALITE as string]: new Decimal(0.3),
    [CHOCOLAT_PATISSIER as string]: new Decimal(0.15),
  },
  finishedProductId: PAINS_AU_CHOCOLAT,
  baseSellRate: new Decimal(4),
}
