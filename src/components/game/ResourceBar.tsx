import { useCallback, useEffect, useRef } from 'react'
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

export function ResourceBar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const globalResources = useResourceStore((state) => state.globalResources)
  const productResources = useResourceStore((state) => state.productResources)
  const unlockedProducts = useProductStore((s) => s.unlockedProducts)
  const activeProduct = useProductStore((s) => s.activeProduct)
  const setActiveProduct = useProductStore((s) => s.setActiveProduct)
  const viewMode = useProductStore((s) => s.viewMode)
  const setViewMode = useProductStore((s) => s.setViewMode)

  // Track header height for sticky children below
  const headerRef = useRef<HTMLElement>(null)
  const updateCssVar = useCallback(() => {
    if (headerRef.current) {
      document.documentElement.style.setProperty(
        '--header-h',
        `${headerRef.current.offsetHeight}px`,
      )
    }
  }, [])

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    updateCssVar()
    const ro = new ResizeObserver(updateCssVar)
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateCssVar])

  // Paintines Coins
  const coinsResource = globalResources[PANTINS_COINS_ID as string]
  const coinsData = SHARED_RESOURCES[PANTINS_COINS_ID as string]

  // Unlocked products in order
  const visibleProducts = PRODUCT_ORDER.filter((id) => unlockedProducts.includes(id))

  return (
    <header ref={headerRef} className="sticky top-0 z-10 bg-amber-100/90 backdrop-blur-sm border-b border-amber-300 px-2 py-2 shadow-sm">
      <div className="flex items-center gap-1.5">
        {/* Left/center: coins + products */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 flex-1 min-w-0">
          {/* Paintines Coins */}
          {coinsResource && coinsData && (
            <div className="flex items-center gap-1.5 text-amber-900 rounded-lg px-2.5 py-1 min-w-[100px]">
              <span className="text-xl shrink-0" role="img" aria-label={coinsData.name}>
                {coinsData.emoji}
              </span>
              <div className="flex flex-col leading-tight tabular-nums">
                <span className="font-bold text-sm">
                  <NumberDisplay value={coinsResource.amount} />
                </span>
                <span className="text-[10px] text-amber-700">
                  <NumberDisplay value={coinsResource.perSecond} />/s
                </span>
              </div>
            </div>
          )}

          {/* Product tabs */}
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
                  flex items-center gap-1.5 text-amber-900 rounded-lg px-2.5 py-1 transition-all cursor-pointer min-w-[100px]
                  ${isActive
                    ? `ring-2 ${ringClass} bg-white/60 shadow-sm`
                    : 'bg-white/20 hover:bg-white/50 opacity-75 hover:opacity-100'
                  }
                `}
              >
                <span className="text-xl shrink-0" role="img" aria-label={finishedData.name}>
                  {finishedData.emoji}
                </span>
                <div className="flex flex-col leading-tight tabular-nums">
                  <span className="font-bold text-sm">
                    <NumberDisplay value={finishedRes.amount} />
                  </span>
                  <span className="text-[10px] text-amber-700">
                    <NumberDisplay value={finishedRes.perSecond} />/s
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right: utility icons */}
        <div className="flex flex-col gap-1 shrink-0">
          {visibleProducts.length > 0 && (
            <button
              onClick={() => setViewMode(viewMode === 'synergies' ? 'product' : 'synergies')}
              title="Synergies & Bonus"
              className={`
                w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer
                ${viewMode === 'synergies'
                  ? 'ring-2 ring-purple-400 bg-purple-50 shadow-sm'
                  : 'hover:bg-white/40 text-amber-900'
                }
              `}
            >
              <span className="text-lg">✨</span>
            </button>
          )}
          <button
            onClick={onOpenSettings}
            title="Options"
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer hover:bg-white/40 text-amber-900"
          >
            <span className="text-lg">&#9881;</span>
          </button>
        </div>
      </div>
    </header>
  )
}
