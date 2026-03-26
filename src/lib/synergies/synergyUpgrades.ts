import Decimal from 'decimal.js'
import { upgradeId, buildingId, resourceId } from '@/types'
import type { UpgradeData } from '@/types'

// Produits finis utilisés comme coût
const CROISSANTS = resourceId('croissants')
const PAINS_AU_CHOCOLAT = resourceId('pains_au_chocolat')
const PIZZAS = resourceId('pizzas')

// ─── Synergy Upgrades ────────────────────────────────────────────
// These are global-scope upgrades that provide cross-product and scaling bonuses.

// ── Specialization upgrades ──────────────────────────────────────

const SPECIALIZATION_UPGRADES: Record<string, UpgradeData> = {
  beurre_aop_specialise: {
    id: upgradeId('beurre_aop_specialise'),
    name: 'upgrades.beurre_aop_specialise.name',
    description: 'upgrades.beurre_aop_specialise.description',
    emoji: 'upgrades.beurre_aop_specialise.emoji',
    cost: new Decimal(500),
    costResource: CROISSANTS,
    effect: {
      type: 'specialization',
      multiplier: new Decimal(2),
      targetBuilding: buildingId('petrin'),
      scalingBonus: {
        bonusType: 'global',
        bonusPerUnit: new Decimal(0.005),
        scalingBuildingId: buildingId('petrin'),
        scalingDivisor: 50,
      },
    },
    unlockCondition: {
      type: 'building_count',
      buildingId: buildingId('petrin'),
      threshold: new Decimal(25),
    },
    scope: 'global',
    category: 'specialization',
  },
  chocolat_suisse_specialise: {
    id: upgradeId('chocolat_suisse_specialise'),
    name: 'upgrades.chocolat_suisse_specialise.name',
    description: 'upgrades.chocolat_suisse_specialise.description',
    emoji: 'upgrades.chocolat_suisse_specialise.emoji',
    cost: new Decimal(500),
    costResource: PAINS_AU_CHOCOLAT,
    effect: {
      type: 'specialization',
      multiplier: new Decimal(2),
      targetBuilding: buildingId('malaxeur'),
      scalingBonus: {
        bonusType: 'sell',
        bonusPerUnit: new Decimal(0.01),
        scalingBuildingId: buildingId('malaxeur'),
        scalingDivisor: 50,
      },
    },
    unlockCondition: {
      type: 'building_count',
      buildingId: buildingId('malaxeur'),
      threshold: new Decimal(25),
    },
    scope: 'global',
    category: 'specialization',
  },
  recette_napolitaine_specialise: {
    id: upgradeId('recette_napolitaine_specialise'),
    name: 'upgrades.recette_napolitaine_specialise.name',
    description: 'upgrades.recette_napolitaine_specialise.description',
    emoji: 'upgrades.recette_napolitaine_specialise.emoji',
    cost: new Decimal(500),
    costResource: PIZZAS,
    effect: {
      type: 'specialization',
      multiplier: new Decimal(2),
      targetBuilding: buildingId('petrin_pizza'),
      scalingBonus: {
        bonusType: 'sell',
        bonusPerUnit: new Decimal(0.05),
        scalingBuildingId: buildingId('petrin_pizza'),
        scalingDivisor: 50,
      },
    },
    unlockCondition: {
      type: 'building_count',
      buildingId: buildingId('petrin_pizza'),
      threshold: new Decimal(25),
    },
    scope: 'global',
    category: 'specialization',
  },
}

// ── Cross-product synergy upgrades ───────────────────────────────

const CROSS_PRODUCT_UPGRADES: Record<string, UpgradeData> = {
  petit_dejeuner_francais: {
    id: upgradeId('petit_dejeuner_francais'),
    name: 'upgrades.petit_dejeuner_francais.name',
    description: 'upgrades.petit_dejeuner_francais.description',
    emoji: 'upgrades.petit_dejeuner_francais.emoji',
    cost: new Decimal(1_000),
    costResource: CROISSANTS,
    effect: {
      type: 'cross_product_synergy',
      multiplier: new Decimal(1),
      crossProductEffect: {
        sourceProduct: 'croissants',
        sourceResource: 'croissants',
        targetProduct: 'pains_au_chocolat',
        bonusType: 'sell',
        bonusPerUnit: new Decimal(0.02),
        scalingDivisor: 100,
      },
    },
    unlockCondition: {
      type: 'resource_threshold',
      resourceId: resourceId('croissants'),
      threshold: new Decimal(500),
    },
    scope: 'global',
    category: 'synergy',
  },
  alliance_beurre_chocolat: {
    id: upgradeId('alliance_beurre_chocolat'),
    name: 'upgrades.alliance_beurre_chocolat.name',
    description: 'upgrades.alliance_beurre_chocolat.description',
    emoji: 'upgrades.alliance_beurre_chocolat.emoji',
    cost: new Decimal(500),
    costResource: PAINS_AU_CHOCOLAT,
    effect: {
      type: 'cross_product_synergy',
      multiplier: new Decimal(1),
      crossProductEffect: {
        sourceProduct: 'croissants',
        targetProduct: 'pains_au_chocolat',
        bonusType: 'production',
        bonusPerUnit: new Decimal(0.01),
        scalingDivisor: 1,
      },
    },
    unlockCondition: {
      type: 'building_count',
      buildingId: buildingId('petrin'),
      threshold: new Decimal(10),
    },
    scope: 'global',
    category: 'synergy',
  },
  menu_boulangerie: {
    id: upgradeId('menu_boulangerie'),
    name: 'upgrades.menu_boulangerie.name',
    description: 'upgrades.menu_boulangerie.description',
    emoji: 'upgrades.menu_boulangerie.emoji',
    cost: new Decimal(5_000),
    costResource: CROISSANTS,
    effect: {
      type: 'cross_product_synergy',
      multiplier: new Decimal(1),
      crossProductEffect: {
        sourceProduct: 'croissants',
        targetProduct: 'croissants', // global effect handled via combo-like behavior
        bonusType: 'sell',
        bonusPerUnit: new Decimal(0.25),
        scalingDivisor: 1,
      },
    },
    unlockCondition: {
      type: 'resource_threshold',
      resourceId: CROISSANTS,
      threshold: new Decimal(3_000),
    },
    scope: 'global',
    category: 'synergy',
  },
}

// ── Scaling upgrades ─────────────────────────────────────────────

const SCALING_UPGRADES: Record<string, UpgradeData> = {
  industrialisation: {
    id: upgradeId('industrialisation'),
    name: 'upgrades.industrialisation.name',
    description: 'upgrades.industrialisation.description',
    emoji: 'upgrades.industrialisation.emoji',
    cost: new Decimal(2_000),
    costResource: CROISSANTS,
    effect: {
      type: 'scaling',
      multiplier: new Decimal(1),
      scalingEffect: {
        source: 'total_buildings',
        bonusType: 'global_production',
        bonusPerUnit: new Decimal(0.005),
        scalingDivisor: 1,
      },
    },
    unlockCondition: {
      type: 'resource_threshold',
      resourceId: CROISSANTS,
      threshold: new Decimal(1_000),
    },
    scope: 'global',
    category: 'scaling',
  },
  franchise_nationale_scaling: {
    id: upgradeId('franchise_nationale_scaling'),
    name: 'upgrades.franchise_nationale_scaling.name',
    description: 'upgrades.franchise_nationale_scaling.description',
    emoji: 'upgrades.franchise_nationale_scaling.emoji',
    cost: new Decimal(1_500),
    costResource: CROISSANTS,
    effect: {
      type: 'scaling',
      multiplier: new Decimal(1),
      scalingEffect: {
        source: 'building_count',
        sourceBuildingId: buildingId('boutique'),
        bonusType: 'sell',
        bonusPerUnit: new Decimal(0.02),
        scalingDivisor: 1,
      },
    },
    unlockCondition: {
      type: 'building_count',
      buildingId: buildingId('boutique'),
      threshold: new Decimal(10),
    },
    scope: 'global',
    category: 'scaling',
  },
}

// ── Combined-cost synergy upgrades ──────────────────────────────

const COMBINED_SYNERGY_UPGRADES: Record<string, UpgradeData> = {
  // ── Paires ──

  brunch_dominical: {
    id: upgradeId('brunch_dominical'),
    name: 'upgrades.brunch_dominical.name',
    description: 'upgrades.brunch_dominical.description',
    emoji: 'upgrades.brunch_dominical.emoji',
    cost: new Decimal(800),
    costResource: CROISSANTS,
    extraCosts: [{ resource: PAINS_AU_CHOCOLAT, amount: new Decimal(400) }],
    effect: {
      type: 'cross_product_synergy',
      multiplier: new Decimal(1),
      crossProductEffect: {
        sourceProduct: 'croissants',
        targetProduct: 'pains_au_chocolat',
        bonusType: 'sell',
        bonusPerUnit: new Decimal(0.15),
        scalingDivisor: 1,
      },
    },
    unlockCondition: {
      type: 'resource_threshold',
      resourceId: PAINS_AU_CHOCOLAT,
      threshold: new Decimal(200),
    },
    scope: 'global',
    category: 'synergy',
  },

  gouter_gourmand: {
    id: upgradeId('gouter_gourmand'),
    name: 'upgrades.gouter_gourmand.name',
    description: 'upgrades.gouter_gourmand.description',
    emoji: 'upgrades.gouter_gourmand.emoji',
    cost: new Decimal(600),
    costResource: PAINS_AU_CHOCOLAT,
    extraCosts: [{ resource: resourceId('curry_wurst'), amount: new Decimal(300) }],
    effect: {
      type: 'cross_product_synergy',
      multiplier: new Decimal(1),
      crossProductEffect: {
        sourceProduct: 'pains_au_chocolat',
        targetProduct: 'curry_wurst',
        bonusType: 'production',
        bonusPerUnit: new Decimal(0.20),
        scalingDivisor: 1,
      },
    },
    unlockCondition: {
      type: 'resource_threshold',
      resourceId: resourceId('curry_wurst'),
      threshold: new Decimal(100),
    },
    scope: 'global',
    category: 'synergy',
  },

  apero_mixte: {
    id: upgradeId('apero_mixte'),
    name: 'upgrades.apero_mixte.name',
    description: 'upgrades.apero_mixte.description',
    emoji: 'upgrades.apero_mixte.emoji',
    cost: new Decimal(1_500),
    costResource: CROISSANTS,
    extraCosts: [{ resource: PIZZAS, amount: new Decimal(300) }],
    effect: {
      type: 'cross_product_synergy',
      multiplier: new Decimal(1),
      crossProductEffect: {
        sourceProduct: 'croissants',
        targetProduct: 'pizzas',
        bonusType: 'sell',
        bonusPerUnit: new Decimal(0.25),
        scalingDivisor: 1,
      },
    },
    unlockCondition: {
      type: 'resource_threshold',
      resourceId: PIZZAS,
      threshold: new Decimal(100),
    },
    scope: 'global',
    category: 'synergy',
  },

  fusion_choco_pizza: {
    id: upgradeId('fusion_choco_pizza'),
    name: 'upgrades.fusion_choco_pizza.name',
    description: 'upgrades.fusion_choco_pizza.description',
    emoji: 'upgrades.fusion_choco_pizza.emoji',
    cost: new Decimal(500),
    costResource: resourceId('curry_wurst'),
    extraCosts: [{ resource: PIZZAS, amount: new Decimal(500) }],
    effect: {
      type: 'scaling',
      multiplier: new Decimal(1),
      scalingEffect: {
        source: 'total_buildings',
        bonusType: 'global_production',
        bonusPerUnit: new Decimal(0.015),
        scalingDivisor: 25,
      },
    },
    unlockCondition: {
      type: 'resource_threshold',
      resourceId: PIZZAS,
      threshold: new Decimal(200),
    },
    scope: 'global',
    category: 'scaling',
  },

  // ── Trios ──

  buffet_francais: {
    id: upgradeId('buffet_francais'),
    name: 'upgrades.buffet_francais.name',
    description: 'upgrades.buffet_francais.description',
    emoji: 'upgrades.buffet_francais.emoji',
    cost: new Decimal(2_000),
    costResource: CROISSANTS,
    extraCosts: [
      { resource: PAINS_AU_CHOCOLAT, amount: new Decimal(1_000) },
      { resource: resourceId('curry_wurst'), amount: new Decimal(500) },
    ],
    effect: {
      type: 'scaling',
      multiplier: new Decimal(1),
      scalingEffect: {
        source: 'total_upgrades',
        bonusType: 'sell',
        bonusPerUnit: new Decimal(0.30),
        scalingDivisor: 1,
      },
    },
    unlockCondition: {
      type: 'resource_threshold',
      resourceId: resourceId('curry_wurst'),
      threshold: new Decimal(250),
    },
    scope: 'global',
    category: 'synergy',
  },

  tour_du_monde: {
    id: upgradeId('tour_du_monde'),
    name: 'upgrades.tour_du_monde.name',
    description: 'upgrades.tour_du_monde.description',
    emoji: 'upgrades.tour_du_monde.emoji',
    cost: new Decimal(1_500),
    costResource: PAINS_AU_CHOCOLAT,
    extraCosts: [
      { resource: resourceId('curry_wurst'), amount: new Decimal(750) },
      { resource: PIZZAS, amount: new Decimal(400) },
    ],
    effect: {
      type: 'scaling',
      multiplier: new Decimal(1),
      scalingEffect: {
        source: 'total_upgrades',
        bonusType: 'global_production',
        bonusPerUnit: new Decimal(0.02),
        scalingDivisor: 1,
      },
    },
    unlockCondition: {
      type: 'resource_threshold',
      resourceId: PIZZAS,
      threshold: new Decimal(200),
    },
    scope: 'global',
    category: 'scaling',
  },

  // ── Quadruple — les 4 produits ──

  carte_complete: {
    id: upgradeId('carte_complete'),
    name: 'upgrades.carte_complete.name',
    description: 'upgrades.carte_complete.description',
    emoji: 'upgrades.carte_complete.emoji',
    cost: new Decimal(5_000),
    costResource: CROISSANTS,
    extraCosts: [
      { resource: PAINS_AU_CHOCOLAT, amount: new Decimal(2_500) },
      { resource: resourceId('curry_wurst'), amount: new Decimal(1_500) },
      { resource: PIZZAS, amount: new Decimal(1_000) },
    ],
    effect: {
      type: 'scaling',
      multiplier: new Decimal(1),
      scalingEffect: {
        source: 'total_buildings',
        bonusType: 'global_production',
        bonusPerUnit: new Decimal(0.50),
        scalingDivisor: 1,
      },
    },
    unlockCondition: {
      type: 'resource_threshold',
      resourceId: PIZZAS,
      threshold: new Decimal(500),
    },
    scope: 'global',
    category: 'synergy',
  },

  empire_gastronomique: {
    id: upgradeId('empire_gastronomique'),
    name: 'upgrades.empire_gastronomique.name',
    description: 'upgrades.empire_gastronomique.description',
    emoji: 'upgrades.empire_gastronomique.emoji',
    cost: new Decimal(10_000),
    costResource: CROISSANTS,
    extraCosts: [
      { resource: PAINS_AU_CHOCOLAT, amount: new Decimal(5_000) },
      { resource: resourceId('curry_wurst'), amount: new Decimal(3_000) },
      { resource: PIZZAS, amount: new Decimal(2_000) },
    ],
    effect: {
      type: 'scaling',
      multiplier: new Decimal(1),
      scalingEffect: {
        source: 'total_buildings',
        bonusType: 'sell',
        bonusPerUnit: new Decimal(0.03),
        scalingDivisor: 1,
      },
    },
    unlockCondition: {
      type: 'resource_threshold',
      resourceId: PIZZAS,
      threshold: new Decimal(1_000),
    },
    scope: 'global',
    category: 'scaling',
  },
}

// ── Ultimate upgrade ─────────────────────────────────────────────

export const ULTIMATE_UPGRADE_ID = upgradeId('croissantification_planetaire')

const ULTIMATE_UPGRADE: Record<string, UpgradeData> = {
  croissantification_planetaire: {
    id: ULTIMATE_UPGRADE_ID,
    name: 'upgrades.croissantification_planetaire.name',
    description: 'upgrades.croissantification_planetaire.description',
    emoji: 'upgrades.croissantification_planetaire.emoji',
    cost: new Decimal(10_000_000),
    costResource: CROISSANTS,
    extraCosts: [
      { resource: PAINS_AU_CHOCOLAT, amount: new Decimal(5_000_000) },
      { resource: resourceId('curry_wurst'), amount: new Decimal(2_500_000) },
      { resource: PIZZAS, amount: new Decimal(1_000_000) },
    ],
    effect: {
      type: 'global_multiplier',
      multiplier: new Decimal(1),
    },
    unlockCondition: {
      type: 'resource_threshold',
      resourceId: PIZZAS,
      threshold: new Decimal(1),
    },
    scope: 'global',
    category: 'ultimate',
  },
}

// ─── All synergy upgrades combined ───────────────────────────────

export const SYNERGY_UPGRADES: Record<string, UpgradeData> = {
  ...SPECIALIZATION_UPGRADES,
  ...CROSS_PRODUCT_UPGRADES,
  ...SCALING_UPGRADES,
  ...COMBINED_SYNERGY_UPGRADES,
  ...ULTIMATE_UPGRADE,
}

export const SYNERGY_UPGRADE_ORDER = [
  // Specialization
  upgradeId('beurre_aop_specialise'),
  upgradeId('chocolat_suisse_specialise'),
  upgradeId('recette_napolitaine_specialise'),
  // Cross-product
  upgradeId('petit_dejeuner_francais'),
  upgradeId('alliance_beurre_chocolat'),
  upgradeId('menu_boulangerie'),
  // Scaling
  upgradeId('industrialisation'),
  upgradeId('franchise_nationale_scaling'),
  // Combined-cost synergies
  upgradeId('brunch_dominical'),
  upgradeId('gouter_gourmand'),
  upgradeId('apero_mixte'),
  upgradeId('fusion_choco_pizza'),
  upgradeId('buffet_francais'),
  upgradeId('tour_du_monde'),
  upgradeId('carte_complete'),
  upgradeId('empire_gastronomique'),
  // Ultimate
  ULTIMATE_UPGRADE_ID,
]
