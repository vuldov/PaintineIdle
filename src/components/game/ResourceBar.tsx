import { useResourceStore } from '@/store/resourceStore'
import { useProductStore } from '@/store/productStore'
import { SHARED_RESOURCES } from '@/lib/products/shared'
import { PRODUCT_REGISTRY, PRODUCT_ORDER } from '@/lib/products/registry'
import { NumberDisplay } from '@/components/ui/NumberDisplay'
import { PANTINS_COINS_ID } from '@/types'
import type { ProductId } from '@/types'

// ─── Color ring for active product ──────────────────────────────

const RING_CLASSES: Record<string, string> = {
  amber: 'ring-amber-500',
  orange: 'ring-orange-500',
  yellow: 'ring-yellow-500',
  red: 'ring-red-500',
}

// ─── Component ──────────────────────────────────────────────────

export function ResourceBar() {
  const globalResources = useResourceStore((state) => state.globalResources)
  const productResources = useResourceStore((state) => state.productResources)
  const unlockedProducts = useProductStore((s) => s.unlockedProducts)
  const activeProduct = useProductStore((s) => s.activeProduct)
  const setActiveProduct = useProductStore((s) => s.setActiveProduct)

  // Paintines Coins
  const coinsResource = globalResources[PANTINS_COINS_ID as string]
  const coinsData = SHARED_RESOURCES[PANTINS_COINS_ID as string]

  // Reputation & etoiles
  const reputationResource = globalResources['reputation']
  const reputationData = SHARED_RESOURCES['reputation']
  const etoilesResource = globalResources['etoiles']
  const etoilesData = SHARED_RESOURCES['etoiles']

  // Unlocked products in order
  const visibleProducts = PRODUCT_ORDER.filter((id) => unlockedProducts.includes(id))

  return (
    <header className="sticky top-0 z-10 bg-amber-100/90 backdrop-blur-sm border-b border-amber-300 px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-center gap-6">
        {/* Paintines Coins -- always visible, not clickable */}
        {coinsResource && coinsData && (
          <div className="flex items-center gap-2 text-amber-900">
            <span className="text-2xl" role="img" aria-label={coinsData.name}>
              {coinsData.emoji}
            </span>
            <div className="flex flex-col items-start leading-tight">
              <span className="font-bold text-lg">
                <NumberDisplay value={coinsResource.amount} />
              </span>
              <span className="text-xs text-amber-700">
                <NumberDisplay value={coinsResource.perSecond} />/s
              </span>
            </div>
          </div>
        )}

        {/* Separator */}
        {visibleProducts.length > 0 && (
          <div className="w-px h-8 bg-amber-300" />
        )}

        {/* All unlocked product finished resources -- clickable to switch */}
        {visibleProducts.map((id) => {
          const bundle = PRODUCT_REGISTRY[id]
          const finishedRid = bundle.finishedProductId as string
          const finishedRes = productResources[id]?.[finishedRid]
          const finishedData = bundle.resources[finishedRid]
          const isActive = id === activeProduct
          const ringClass = RING_CLASSES[bundle.definition.color] ?? RING_CLASSES.amber

          if (!finishedRes || !finishedData) return null

          return (
            <button
              key={id}
              onClick={() => setActiveProduct(id as ProductId)}
              title={`${bundle.definition.name} — Cliquez pour afficher`}
              className={`
                flex items-center gap-2 text-amber-900 rounded-lg px-3 py-1.5 transition-all cursor-pointer
                ${isActive
                  ? `ring-2 ${ringClass} bg-white/60 shadow-sm`
                  : 'hover:bg-white/40'
                }
              `}
            >
              <span className="text-2xl" role="img" aria-label={finishedData.name}>
                {finishedData.emoji}
              </span>
              <div className="flex flex-col items-start leading-tight">
                <span className="font-bold text-lg">
                  <NumberDisplay value={finishedRes.amount} />
                </span>
                <span className="text-xs text-amber-700">
                  <NumberDisplay value={finishedRes.perSecond} />/s
                </span>
              </div>
            </button>
          )
        })}

        {/* Separator before meta resources */}
        {(reputationResource?.unlocked || etoilesResource?.unlocked) && (
          <div className="w-px h-8 bg-amber-300" />
        )}

        {/* Reputation if unlocked */}
        {reputationResource?.unlocked && reputationData && (
          <div className="flex items-center gap-2 text-amber-900">
            <span className="text-2xl" role="img" aria-label={reputationData.name}>
              {reputationData.emoji}
            </span>
            <div className="flex flex-col items-start leading-tight">
              <span className="font-bold text-lg">
                <NumberDisplay value={reputationResource.amount} />
              </span>
              <span className="text-xs text-amber-700">
                <NumberDisplay value={reputationResource.perSecond} />/s
              </span>
            </div>
          </div>
        )}

        {/* Etoiles if unlocked */}
        {etoilesResource?.unlocked && etoilesData && (
          <div className="flex items-center gap-2 text-amber-900">
            <span className="text-2xl" role="img" aria-label={etoilesData.name}>
              {etoilesData.emoji}
            </span>
            <div className="flex flex-col items-start leading-tight">
              <span className="font-bold text-lg">
                <NumberDisplay value={etoilesResource.amount} />
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
