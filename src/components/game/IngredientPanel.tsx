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
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {visible.map(([id, data]) => {
          const resource = productResources[id]
          if (!resource) return null
          const isNegative = resource.perSecond.lt(0)
          return (
            <div key={id} className="flex items-center gap-2 text-amber-900">
              <span className="text-lg" role="img" aria-label={data.name}>
                {data.emoji}
              </span>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-sm font-semibold">
                  <NumberDisplay value={resource.amount} />
                  <span className="ml-1 font-normal text-amber-700">{data.name}</span>
                </span>
                <span className={`text-xs ${isNegative ? 'text-red-500' : 'text-amber-500'}`}>
                  {isNegative ? '' : '+'}
                  <NumberDisplay value={resource.perSecond} />/s
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
