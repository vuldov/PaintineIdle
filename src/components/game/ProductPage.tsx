import { useProductStore } from '@/store/productStore'
import { PRODUCT_REGISTRY } from '@/lib/products/registry'
import { ProductProvider } from './ProductContext'
import { IngredientPanel } from './IngredientPanel'
import { SupplierPanel } from './SupplierPanel'
import { CraftingPanel } from './CraftingPanel'
import { UpgradePanel } from './UpgradePanel'
import { BatimentCard } from './BatimentCard'

export function ProductPage() {
  const activeProduct = useProductStore((s) => s.activeProduct)
  const bundle = PRODUCT_REGISTRY[activeProduct]

  if (!bundle) return null

  return (
    <ProductProvider productId={activeProduct} bundle={bundle}>
      <IngredientPanel />

      <SupplierPanel />

      <CraftingPanel />

      <UpgradePanel />

      <section>
        <h2 className="text-xl font-semibold text-amber-800 mb-4">
          Batiments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bundle.buildingOrder.map((id) => (
            <BatimentCard key={id as string} buildingId={id} />
          ))}
        </div>
      </section>
    </ProductProvider>
  )
}
