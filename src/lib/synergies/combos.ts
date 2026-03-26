import Decimal from 'decimal.js'
import type { ComboBoulangerie } from '@/types/synergies'

// ─── Combo Boulangerie definitions ──────────────────────────────
// Combos activate when ALL required products are actively producing.
// They stack additively.

export const COMBO_DEFINITIONS: ComboBoulangerie[] = [
  {
    id: 'duo_classique',
    name: 'combos.duo_classique.name',
    description: 'combos.duo_classique.description',
    requiredProducts: ['croissants', 'pains_au_chocolat'],
    bonusType: 'sell',
    bonusMultiplier: new Decimal(0.10),
  },
  {
    id: 'trio_boulangerie',
    name: 'combos.trio_boulangerie.name',
    description: 'combos.trio_boulangerie.description',
    requiredProducts: ['croissants', 'pains_au_chocolat', 'curry_wurst'],
    bonusType: 'production',
    bonusMultiplier: new Decimal(0.20),
  },
  {
    id: 'empire_complet',
    name: 'combos.empire_complet.name',
    description: 'combos.empire_complet.description',
    requiredProducts: ['croissants', 'pains_au_chocolat', 'curry_wurst', 'pizzas'],
    bonusType: 'sell',
    bonusMultiplier: new Decimal(0.50),
  },
]
