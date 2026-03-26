import { useTranslation } from 'react-i18next'
import type { ProductId } from '@/types'

/**
 * Hook to resolve translated display strings for game entities within a product.
 *
 * Usage:
 *   const pt = useProductTranslation('curry_wurst')
 *   pt.resource('saucisse_vege', 'name')   // → "Saucisse végé"
 *   pt.building('saucier', 'description')  // → "Sauce la saucisse végé..."
 *   pt.upgrade('wurst_global', 'name')     // → "Recette de Berlin"
 */
export function useProductTranslation(productId: ProductId) {
  const { t } = useTranslation(`products/${productId}`)

  return {
    /** Product definition field */
    definition: (field: 'name' | 'emoji') =>
      t(`definition.${field}`),

    /** Resource field by resource ID (stripped of branded type) */
    resource: (id: string, field: 'name' | 'emoji') =>
      t(`resources.${id}.${field}`),

    /** Building field */
    building: (id: string, field: 'name' | 'emoji' | 'description' | 'aura_description') =>
      t(`buildings.${id}.${field}`),

    /** Crafting recipe field */
    crafting: (id: string, field: 'name' | 'emoji' | 'verb') =>
      t(`crafting.${id}.${field}`),

    /** Upgrade field */
    upgrade: (id: string, field: 'name' | 'emoji' | 'description') =>
      t(`upgrades.${id}.${field}`),

    /** Supplier field */
    supplier: (id: string, field: 'name' | 'emoji' | 'description') =>
      t(`suppliers.${id}.${field}`),

    /** Supplier upgrade field (uses base name without tier suffix) */
    supplierUpgrade: (id: string, field: 'name' | 'emoji' | 'description') =>
      t(`supplier_upgrades.${id}.${field}`),
  }
}
