import { create } from 'zustand'
import type { ProductId } from '@/types'

// ─── Interface ───────────────────────────────────────────────────

type ViewMode = 'product' | 'synergies'

interface ProductStoreState {
  unlockedProducts: ProductId[]
  activeProduct: ProductId
  viewMode: ViewMode
}

interface ProductStoreActions {
  unlockProduct: (id: ProductId) => void
  setActiveProduct: (id: ProductId) => void
  setViewMode: (mode: ViewMode) => void
  isUnlocked: (id: ProductId) => boolean
}

type ProductStore = ProductStoreState & ProductStoreActions

// ─── Store ───────────────────────────────────────────────────────

export const useProductStore = create<ProductStore>((set, get) => ({
  unlockedProducts: ['croissants'],
  activeProduct: 'croissants',
  viewMode: 'product',

  unlockProduct: (id) => {
    set((state) => {
      if (state.unlockedProducts.includes(id)) return state
      return {
        unlockedProducts: [...state.unlockedProducts, id],
      }
    })
  },

  setActiveProduct: (id) => {
    if (get().unlockedProducts.includes(id)) {
      set({ activeProduct: id, viewMode: 'product' })
    }
  },

  setViewMode: (mode) => {
    set({ viewMode: mode })
  },

  isUnlocked: (id) => {
    return get().unlockedProducts.includes(id)
  },
}))
