import Decimal from 'decimal.js'
import type { BuildingId, ResourceId } from '@/types'

// ─── Types ──────────────────────────────────────────────────────

export type BuildingPipelineRole =
  | 'petrissage'    // consomme beurre+farine → produit pâte
  | 'cuisson'       // consomme pâte → produit croissants
  | 'vente'         // consomme croissants → produit pantins_coins
  | 'ingredients'   // produit beurre et/ou farine
  | 'full_pipeline' // fait tout

export interface BuildingData {
  id: BuildingId
  name: string
  emoji: string
  description: string
  baseCost: Decimal
  costResource: ResourceId
  costMultiplier: number
  baseProduction: Decimal
  producedResource: ResourceId
  pipelineRole: BuildingPipelineRole
}

// ─── Données des bâtiments ──────────────────────────────────────

export const BUILDINGS_DATA: Record<BuildingId, BuildingData> = {
  fournil: {
    id: 'fournil',
    name: 'Fournil',
    emoji: '🏠',
    description: 'Cuit automatiquement la pâte en croissants',
    baseCost: new Decimal(15),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(0.4),
    producedResource: 'croissants',
    pipelineRole: 'cuisson',
  },
  petrin: {
    id: 'petrin',
    name: 'Pétrin mécanique',
    emoji: '⚙️',
    description: 'Pétrit automatiquement le beurre et la farine en pâte',
    baseCost: new Decimal(30),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(0.5),
    producedResource: 'pate',
    pipelineRole: 'petrissage',
  },
  four_pro: {
    id: 'four_pro',
    name: 'Four professionnel',
    emoji: '🔥',
    description: 'Cuisson rapide et de qualité supérieure',
    baseCost: new Decimal(200),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(2),
    producedResource: 'croissants',
    pipelineRole: 'cuisson',
  },
  boutique: {
    id: 'boutique',
    name: 'Boutique',
    emoji: '🏪',
    description: 'Vend automatiquement les croissants',
    baseCost: new Decimal(500),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(1),
    producedResource: 'pantins_coins',
    pipelineRole: 'vente',
  },
  laboratoire: {
    id: 'laboratoire',
    name: 'Laboratoire pâtissier',
    emoji: '🔬',
    description: 'Génère du beurre et de la farine',
    baseCost: new Decimal(1_500),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(2),
    producedResource: 'beurre',
    pipelineRole: 'ingredients',
  },
  usine: {
    id: 'usine',
    name: 'Usine viennoiserie',
    emoji: '🏭',
    description: 'Production industrielle : pétrit, cuit et vend',
    baseCost: new Decimal(10_000),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(5),
    producedResource: 'croissants',
    pipelineRole: 'full_pipeline',
  },
  franchise: {
    id: 'franchise',
    name: 'Franchise nationale',
    emoji: '🗺️',
    description: 'Réseau de vente dans toute la France',
    baseCost: new Decimal(50_000),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(10),
    producedResource: 'pantins_coins',
    pipelineRole: 'vente',
  },
  empire: {
    id: 'empire',
    name: 'Empire mondial',
    emoji: '🌍',
    description: 'Domination mondiale de la viennoiserie',
    baseCost: new Decimal(500_000),
    costResource: 'pantins_coins',
    costMultiplier: 1.15,
    baseProduction: new Decimal(50),
    producedResource: 'croissants',
    pipelineRole: 'full_pipeline',
  },
}

// ─── Ratios de consommation du pipeline ──────────────────────────

export const PETRISSAGE_BEURRE_RATIO = new Decimal(1)
export const PETRISSAGE_FARINE_RATIO = new Decimal(1.5)
export const CUISSON_PATE_RATIO = new Decimal(0.7)
export const VENTE_CROISSANT_RATIO = new Decimal(1)

// ─── Ordre et seuils de déblocage ────────────────────────────────

export const BUILDING_ORDER: BuildingId[] = [
  'petrin',
  'fournil',
  'four_pro',
  'boutique',
  'laboratoire',
  'usine',
  'franchise',
  'empire',
]

export const BUILDING_UNLOCK_THRESHOLDS: Partial<Record<BuildingId, { resource: ResourceId; amount: Decimal }>> = {
  petrin:       { resource: 'pantins_coins', amount: new Decimal(5) },
  fournil:      { resource: 'pantins_coins', amount: new Decimal(5) },
  four_pro:     { resource: 'pantins_coins', amount: new Decimal(80) },
  boutique:     { resource: 'pantins_coins', amount: new Decimal(200) },
  laboratoire:  { resource: 'pantins_coins', amount: new Decimal(600) },
  usine:        { resource: 'pantins_coins', amount: new Decimal(4_000) },
  franchise:    { resource: 'pantins_coins', amount: new Decimal(20_000) },
  empire:       { resource: 'pantins_coins', amount: new Decimal(200_000) },
}
