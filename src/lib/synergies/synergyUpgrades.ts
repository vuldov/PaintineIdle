import Decimal from 'decimal.js'
import { upgradeId, buildingId, resourceId, PANTINS_COINS_ID } from '@/types'
import type { UpgradeData } from '@/types'

// ─── Synergy Upgrades ────────────────────────────────────────────
// These are global-scope upgrades that provide cross-product and scaling bonuses.

// ── Specialization upgrades ──────────────────────────────────────

const SPECIALIZATION_UPGRADES: Record<string, UpgradeData> = {
  beurre_aop_specialise: {
    id: upgradeId('beurre_aop_specialise'),
    name: 'Beurre AOP spécialisé',
    description: 'x2 production croissants + 0,5% production globale par tranche de 50 pétrins',
    emoji: '🧈',
    cost: new Decimal(50_000),
    costResource: PANTINS_COINS_ID,
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
  chocolat_belge_specialise: {
    id: upgradeId('chocolat_belge_specialise'),
    name: 'Chocolat belge spécialisé',
    description: 'x2 production PAC + 1% prix chocolatines par tranche de 50 malaxeurs',
    emoji: '🍫',
    cost: new Decimal(100_000),
    costResource: PANTINS_COINS_ID,
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
    name: 'Recette napolitaine spécialisée',
    description: 'x2 production pizzas + 5% prix tous produits par tranche de 50 pétrins pizza',
    emoji: '🍕',
    cost: new Decimal(500_000),
    costResource: PANTINS_COINS_ID,
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
    name: 'Petit-déjeuner français',
    description: 'Chaque tranche de 100 croissants (total) augmente le prix des PAC de 2%',
    emoji: '🥐',
    cost: new Decimal(100_000),
    costResource: PANTINS_COINS_ID,
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
    name: 'Alliance beurre-chocolat',
    description: 'Chaque pétrin augmente la production de chocolat de 1%',
    emoji: '🤝',
    cost: new Decimal(200_000),
    costResource: PANTINS_COINS_ID,
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
    name: 'Menu boulangerie',
    description: 'Si 4 produits produisent : +25% vente globale',
    emoji: '📋',
    cost: new Decimal(1_000_000),
    costResource: PANTINS_COINS_ID,
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
      resourceId: PANTINS_COINS_ID,
      threshold: new Decimal(500_000),
    },
    scope: 'global',
    category: 'synergy',
  },
}

// ── Scaling upgrades ─────────────────────────────────────────────

const SCALING_UPGRADES: Record<string, UpgradeData> = {
  industrialisation: {
    id: upgradeId('industrialisation'),
    name: 'Industrialisation',
    description: '+0,5% production globale par bâtiment possédé',
    emoji: '🏭',
    cost: new Decimal(500_000),
    costResource: PANTINS_COINS_ID,
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
      resourceId: PANTINS_COINS_ID,
      threshold: new Decimal(250_000),
    },
    scope: 'global',
    category: 'scaling',
  },
  franchise_nationale_scaling: {
    id: upgradeId('franchise_nationale_scaling'),
    name: 'Franchise nationale',
    description: '+2% vente par boutique',
    emoji: '🗺️',
    cost: new Decimal(300_000),
    costResource: PANTINS_COINS_ID,
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

// ─── All synergy upgrades combined ───────────────────────────────

export const SYNERGY_UPGRADES: Record<string, UpgradeData> = {
  ...SPECIALIZATION_UPGRADES,
  ...CROSS_PRODUCT_UPGRADES,
  ...SCALING_UPGRADES,
}

export const SYNERGY_UPGRADE_ORDER = [
  // Specialization
  upgradeId('beurre_aop_specialise'),
  upgradeId('chocolat_belge_specialise'),
  upgradeId('recette_napolitaine_specialise'),
  // Cross-product
  upgradeId('petit_dejeuner_francais'),
  upgradeId('alliance_beurre_chocolat'),
  upgradeId('menu_boulangerie'),
  // Scaling
  upgradeId('industrialisation'),
  upgradeId('franchise_nationale_scaling'),
]
