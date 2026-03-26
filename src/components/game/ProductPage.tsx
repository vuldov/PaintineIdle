import { useProductStore } from '@/store/productStore'
import { PRODUCT_REGISTRY } from '@/lib/products/registry'
import { ProductProvider } from './ProductContext'
import { IngredientPanel } from './IngredientPanel'
import { SupplierPanel } from './SupplierPanel'
import { CraftingPanel } from './CraftingPanel'
import { UpgradePanel } from './UpgradePanel'
import { BatimentCard, BuyModeSelector } from './BatimentCard'
import { useBuildingStore } from '@/store/buildingStore'
import {useTranslation} from "react-i18next";

export function ProductPage() {
  const activeProduct = useProductStore((s) => s.activeProduct)
  const bundle = PRODUCT_REGISTRY[activeProduct]
  const buildings = useBuildingStore((s) => s.buildings[activeProduct])
  const hasUnlockedBuilding = bundle?.buildingOrder.some(
    (id) => buildings?.[id as string]?.unlocked
  )
  const { t } = useTranslation('common')

  if (!bundle) return null

  return (
    <ProductProvider key={activeProduct} productId={activeProduct} bundle={bundle}>
      <IngredientPanel />

      <SupplierPanel />

      <CraftingPanel />

      <UpgradePanel />

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-amber-800">
              {t('sections.buildings')}
          </h2>
          <BuyModeSelector />
        </div>
        {hasUnlockedBuilding ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bundle.buildingOrder.map((id) => (
              <BatimentCard key={id as string} buildingId={id} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-amber-600 text-center py-4">
              {t('building_card.no_buildings_hint')}
          </p>
        )}
      </section>
    </ProductProvider>
  )
}
