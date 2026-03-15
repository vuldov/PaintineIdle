import Decimal from 'decimal.js'
import { resourceId, PANTINS_COINS_ID, REPUTATION_ID, ETOILES_ID } from '@/types'
import type { ResourceData } from '@/types'

// ─── Ressources globales (partagées entre tous les produits) ────

export const SHARED_RESOURCES: Record<string, ResourceData> = {
  [PANTINS_COINS_ID as string]: {
    id: PANTINS_COINS_ID,
    name: 'Paintines Coins',
    emoji: '🪙',
    category: 'monnaie',
    initiallyUnlocked: true,
    initialAmount: new Decimal(0),
    scope: 'global',
  },
  [REPUTATION_ID as string]: {
    id: REPUTATION_ID,
    name: 'Réputation',
    emoji: '⭐',
    category: 'meta',
    initiallyUnlocked: false,
    initialAmount: new Decimal(0),
    scope: 'global',
  },
  [ETOILES_ID as string]: {
    id: ETOILES_ID,
    name: 'Étoiles Michelin',
    emoji: '🌟',
    category: 'meta',
    initiallyUnlocked: false,
    initialAmount: new Decimal(0),
    scope: 'global',
  },
}

// ─── Seuils de déblocage des ressources globales ────────────────

export const SHARED_RESOURCE_UNLOCK_THRESHOLDS: Record<string, { resource: ResourceId; amount: Decimal }> = {
  [REPUTATION_ID as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(2_000) },
  [ETOILES_ID as string]: { resource: PANTINS_COINS_ID, amount: new Decimal(1_000_000) },
}

// Re-export for convenience
import type { ResourceId } from '@/types'
export { resourceId }
