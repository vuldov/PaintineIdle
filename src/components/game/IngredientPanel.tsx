import { useResourceStore } from '@/store/resourceStore'
import { useProduct } from './ProductContext'
import { NumberDisplay } from '@/components/ui/NumberDisplay'
import {useTranslation} from "react-i18next";

export function IngredientPanel() {
  const { productId, bundle } = useProduct()
  const { t } = useTranslation(`products/${productId}`)

  const productResources = useResourceStore((state) => state.productResources[productId])

  if (!productResources) return null

  // Filter resources of the active product that are ingredients or intermediaire
  const visible = Object.entries(bundle.resources)
    .filter(([, data]) => data.category === 'ingredient' || data.category === 'intermediaire')
    .filter(([id]) => productResources[id]?.unlocked)

  if (visible.length === 0) return null

  return (
    <div className="sticky z-[5] bg-white rounded-xl border border-amber-200 shadow-sm p-2 sm:p-4" style={{ top: 'var(--header-h, 3rem)' }}>
      {/* Mobile: horizontal scroll strip — fixed-width cards so the last one peeks out */}
      <div className="flex sm:hidden gap-2 overflow-x-auto scrollbar-hide">
        {visible.map(([id, data]) => {
          const resource = productResources[id]
          if (!resource) return null
          const isNegative = resource.perSecond.lt(0)
          return (
            <div key={id} className="flex items-center gap-1.5 bg-amber-50 rounded-lg px-2 py-1.5 shrink-0 w-28">
              <span className="text-base" role="img" aria-label={t(data.name)}>
                {t(data.emoji)}
              </span>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-xs font-bold text-amber-900 tabular-nums truncate">
                  <NumberDisplay value={resource.amount} />
                </span>
                <span className={`text-[10px] tabular-nums ${isNegative ? 'text-red-500' : 'text-green-600'}`}>
                  {isNegative ? '' : '+'}
                  <NumberDisplay value={resource.perSecond} />/s
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop: grid layout */}
      <div className="hidden sm:grid grid-cols-3 lg:grid-cols-4 gap-2">
        {visible.map(([id, data]) => {
          const resource = productResources[id]
          if (!resource) return null
          const isNegative = resource.perSecond.lt(0)
          return (
            <div key={id} className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
              <span className="text-xl shrink-0" role="img" aria-label={t(data.name)}>
                {t(data.emoji)}
              </span>
              <div className="min-w-0">
                <div className="text-xs text-amber-700 truncate">{t(data.name)}</div>
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
