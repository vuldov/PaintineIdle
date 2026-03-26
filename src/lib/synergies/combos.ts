import Decimal from 'decimal.js'
import type { ComboBoulangerie } from '@/types/synergies'

// ─── Combo Boulangerie definitions ──────────────────────────────
// Combos activate when ALL required products are actively producing.
// They stack additively.

export const COMBO_DEFINITIONS: ComboBoulangerie[] = [
  {
    id: 'duo_classique',
    name: 'Duo classique',
    description: 'Croissants + Pains au chocolat : +10% prix de vente',
    requiredProducts: ['croissants', 'pains_au_chocolat'],
    bonusType: 'sell',
    bonusMultiplier: new Decimal(0.10),
  },
  {
    id: 'trio_boulangerie',
    name: 'Trio boulangerie',
    description: 'Croissants + PAC + Curry Wurst : +20% production',
    requiredProducts: ['croissants', 'pains_au_chocolat', 'curry_wurst'],
    bonusType: 'production',
    bonusMultiplier: new Decimal(0.20),
  },
  {
    id: 'empire_complet',
    name: 'Empire complet',
    description: 'Les 4 produits : +50% prix de vente',
    requiredProducts: ['croissants', 'pains_au_chocolat', 'curry_wurst', 'pizzas'],
    bonusType: 'sell',
    bonusMultiplier: new Decimal(0.50),
  },
]
