import { create } from 'zustand'
import type { ProductId } from '@/types'

// ─── Interface ───────────────────────────────────────────────────

interface ProductStoreState {
  unlockedProducts: ProductId[]
  activeProduct: ProductId
}

interface ProductStoreActions {
  unlockProduct: (id: ProductId) => void
  setActiveProduct: (id: ProductId) => void
  isUnlocked: (id: ProductId) => boolean
}

type ProductStore = ProductStoreState & ProductStoreActions

// ─── Store ───────────────────────────────────────────────────────

export const useProductStore = create<ProductStore>((set, get) => ({
  unlockedProducts: ['croissants'],
  activeProduct: 'croissants',

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
      set({ activeProduct: id })
    }
  },

  isUnlocked: (id) => {
    return get().unlockedProducts.includes(id)
  },
}))
