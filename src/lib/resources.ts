import Decimal from 'decimal.js'
import type { ResourceId } from '@/types'

// ─── Données de base des ressources ─────────────────────────────

export type ResourceCategory = 'produit_fini' | 'ingredient' | 'monnaie' | 'meta'

export interface ResourceData {
  id: ResourceId
  name: string
  emoji: string
  category: ResourceCategory
  initiallyUnlocked: boolean
  initialAmount: Decimal
}

export const RESOURCES_DATA: Record<ResourceId, ResourceData> = {
  croissants: {
    id: 'croissants',
    name: 'Croissants',
    emoji: '🥐',
    category: 'produit_fini',
    initiallyUnlocked: true,
    initialAmount: new Decimal(0),
  },
  beurre: {
    id: 'beurre',
    name: 'Beurre',
    emoji: '🧈',
    category: 'ingredient',
    initiallyUnlocked: true,
    initialAmount: new Decimal(10),
  },
  farine: {
    id: 'farine',
    name: 'Farine',
    emoji: '🌾',
    category: 'ingredient',
    initiallyUnlocked: true,
    initialAmount: new Decimal(20),
  },
  pate: {
    id: 'pate',
    name: 'Pâte',
    emoji: '🫓',
    category: 'ingredient',
    initiallyUnlocked: true,
    initialAmount: new Decimal(0),
  },
  pantins_coins: {
    id: 'pantins_coins',
    name: 'Paintines Coins',
    emoji: '🪙',
    category: 'monnaie',
    initiallyUnlocked: true,
    initialAmount: new Decimal(0),
  },
  reputation: {
    id: 'reputation',
    name: 'Réputation',
    emoji: '⭐',
    category: 'meta',
    initiallyUnlocked: false,
    initialAmount: new Decimal(0),
  },
  etoiles: {
    id: 'etoiles',
    name: 'Étoiles Michelin',
    emoji: '⭐',
    category: 'meta',
    initiallyUnlocked: false,
    initialAmount: new Decimal(0),
  },
}

// ─── Régénération passive d'ingrédients ──────────────────────────

export const BASE_INGREDIENT_REGEN: Partial<Record<ResourceId, Decimal>> = {
  beurre: new Decimal(0.2),
  farine: new Decimal(0.3),
}

// ─── Seuils de déblocage des ressources ──────────────────────────

export const RESOURCE_UNLOCK_THRESHOLDS: Partial<Record<ResourceId, { resource: ResourceId; amount: Decimal }>> = {
  reputation: { resource: 'pantins_coins', amount: new Decimal(2_000) },
  etoiles:    { resource: 'pantins_coins', amount: new Decimal(1_000_000) },
}
