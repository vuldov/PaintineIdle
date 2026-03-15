import Decimal from 'decimal.js'
import type { CraftingInput, CraftingOutput, CraftingRecipeId } from '@/types'

// ─── Types ──────────────────────────────────────────────────────

export interface CraftingRecipeData {
  id: CraftingRecipeId
  name: string
  emoji: string
  verb: string
  inputs: CraftingInput[]
  output: CraftingOutput
  durationSeconds: number
}

// ─── Recettes de fabrication ─────────────────────────────────────

export const CRAFTING_RECIPES: Record<CraftingRecipeId, CraftingRecipeData> = {
  petrissage: {
    id: 'petrissage',
    name: 'Pétrissage',
    emoji: '🤲',
    verb: 'Pétrir',
    inputs: [
      { resource: 'beurre', amount: new Decimal(2) },
      { resource: 'farine', amount: new Decimal(3) },
    ],
    output: { resource: 'pate', amount: new Decimal(2) },
    durationSeconds: 3,
  },
  cuisson: {
    id: 'cuisson',
    name: 'Cuisson',
    emoji: '🔥',
    verb: 'Cuire',
    inputs: [
      { resource: 'pate', amount: new Decimal(2) },
    ],
    output: { resource: 'croissants', amount: new Decimal(3) },
    durationSeconds: 5,
  },
}

export const CRAFTING_ORDER: CraftingRecipeId[] = ['petrissage', 'cuisson']

// ─── Vente ───────────────────────────────────────────────────────

export const BASE_SELL_RATE = new Decimal(1)
