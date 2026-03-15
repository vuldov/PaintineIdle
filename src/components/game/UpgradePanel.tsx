import { useUpgradeStore, isUpgradeVisible } from '@/store/upgradeStore'
import { useResourceStore } from '@/store/resourceStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useProduct } from './ProductContext'
import { ALL_RESOURCES } from '@/lib/products/registry'
import { NumberDisplay } from '@/components/ui/NumberDisplay'
import type { UpgradeId, Resource } from '@/types'

export function UpgradePanel() {
  const { productId, bundle } = useProduct()
  const upgrades = useUpgradeStore((state) => state.upgrades)
  const buyUpgrade = useUpgradeStore((state) => state.buyUpgrade)
  const globalResources = useResourceStore((state) => state.globalResources)
  const productResources = useResourceStore((state) => state.productResources)
  const buildings = useBuildingStore((state) => state.buildings)
  const canAfford = useResourceStore((state) => state.canAfford)

  // Merge resources inline (not in a selector to avoid unstable references)
  const allResources: Record<string, Resource> = { ...globalResources }
  for (const res of Object.values(productResources)) {
    Object.assign(allResources, res)
  }

  // Merge buildings inline
  const allBuildings: Record<string, { count: number }> = {}
  for (const productBuildings of Object.values(buildings)) {
    Object.assign(allBuildings, productBuildings)
  }

  // Filter upgrades by this product's scope
  const productUpgradeOrder = bundle.upgradeOrder

  // Available: visible + not purchased
  const available = productUpgradeOrder.filter((id) => {
    const uid = id as string
    const upgrade = upgrades[uid]
    if (!upgrade || upgrade.purchased) return false
    return isUpgradeVisible(uid, allResources, allBuildings, upgrades)
  })

  // Purchased
  const purchased = productUpgradeOrder.filter((id) => {
    const uid = id as string
    return upgrades[uid]?.purchased
  })

  if (available.length === 0 && purchased.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-amber-800 mb-4">
        Ameliorations
      </h2>

      {available.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {available.map((id) => {
            const uid = id as string
            const data = bundle.upgrades[uid]
            if (!data) return null
            const affordable = canAfford(data.costResource, data.cost)
            const costEmoji = ALL_RESOURCES[data.costResource as string]?.emoji ?? '🪙'

            return (
              <button
                key={uid}
                onClick={() => buyUpgrade(id as UpgradeId)}
                disabled={!affordable}
                className={`
                  flex items-start gap-3 p-3 rounded-lg border text-left transition-all
                  ${affordable
                    ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 hover:border-amber-400 cursor-pointer'
                    : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  }
                `}
              >
                <span className="text-2xl shrink-0 mt-0.5">{data.emoji}</span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-amber-900 text-sm">{data.name}</h3>
                  <p className="text-xs text-amber-600">{data.description}</p>
                  <p className="text-xs text-amber-800 font-medium mt-1">
                    <NumberDisplay value={data.cost} /> {costEmoji}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {purchased.length > 0 && (
        <div className="border-t border-amber-100 pt-3">
          <p className="text-xs text-amber-500 mb-2">Achetees</p>
          <div className="flex flex-wrap gap-2">
            {purchased.map((id) => {
              const uid = id as string
              const data = bundle.upgrades[uid]
              if (!data) return null
              return (
                <span
                  key={uid}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs"
                  title={`${data.name} -- ${data.description}`}
                >
                  {data.emoji} {data.name}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
