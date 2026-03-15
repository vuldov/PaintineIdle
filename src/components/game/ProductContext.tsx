import { createContext, useContext } from 'react'
import type { ProductId, ProductBundle } from '@/types'

// ─── Context ────────────────────────────────────────────────────

interface ProductContextValue {
  productId: ProductId
  bundle: ProductBundle
}

const ProductContext = createContext<ProductContextValue | null>(null)

// ─── Provider ───────────────────────────────────────────────────

interface ProductProviderProps {
  productId: ProductId
  bundle: ProductBundle
  children: React.ReactNode
}

export function ProductProvider({ productId, bundle, children }: ProductProviderProps) {
  return (
    <ProductContext.Provider value={{ productId, bundle }}>
      {children}
    </ProductContext.Provider>
  )
}

// ─── Hook ───────────────────────────────────────────────────────

export function useProduct(): ProductContextValue {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider')
  }
  return context
}
