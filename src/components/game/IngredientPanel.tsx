import { useResourceStore } from '@/store/resourceStore'
import { useProduct } from './ProductContext'
import { NumberDisplay } from '@/components/ui/NumberDisplay'

export function IngredientPanel() {
  const { productId, bundle } = useProduct()
  const productResources = useResourceStore((state) => state.productResources[productId])

  if (!productResources) return null

  // Filter resources of the active product that are ingredients or intermediaire
  const visible = Object.entries(bundle.resources)
    .filter(([, data]) => data.category === 'ingredient' || data.category === 'intermediaire')
    .filter(([id]) => productResources[id]?.unlocked)

  if (visible.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-amber-800 mb-3">Ingredients</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {visible.map(([id, data]) => {
          const resource = productResources[id]
          if (!resource) return null
          const isNegative = resource.perSecond.lt(0)
          return (
            <div key={id} className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
              <span className="text-xl shrink-0" role="img" aria-label={data.name}>
                {data.emoji}
              </span>
              <div className="min-w-0">
                <div className="text-xs text-amber-700 truncate">{data.name}</div>
                <div className="text-sm font-bold text-amber-900">
                  <NumberDisplay value={resource.amount} />
                </div>
                <div className={`text-xs ${isNegative ? 'text-red-500' : 'text-green-600'}`}>
                  {isNegative ? '' : '+'}
                  <NumberDisplay value={resource.perSecond} />/s
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
