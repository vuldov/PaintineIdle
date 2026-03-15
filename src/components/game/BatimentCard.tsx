import { useBuildingStore } from '@/store/buildingStore'
import { useResourceStore } from '@/store/resourceStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { useProduct } from './ProductContext'
import { ALL_RESOURCES } from '@/lib/products/registry'
import { calcCost, calcCostReduction, calcBuildingRates } from '@/mechanics/productionMechanics'
import { NumberDisplay } from '@/components/ui/NumberDisplay'
import type { BuildingId } from '@/types'

// ─── Component ───────────────────────────────────────────────────

interface BatimentCardProps {
  buildingId: BuildingId
}

export function BatimentCard({ buildingId }: BatimentCardProps) {
  const { productId, bundle } = useProduct()
  const bid = buildingId as string

  const building = useBuildingStore((state) => state.buildings[productId]?.[bid])
  const buyBuilding = useBuildingStore((state) => state.buyBuilding)
  const upgrades = useUpgradeStore((state) => state.upgrades)

  // Filter upgrades to this product's scope
  const scopedUpgrades = Object.fromEntries(
    Object.entries(upgrades).filter(([, u]) => u.scope === productId || u.scope === 'global')
  )
  const costReduction = calcCostReduction(scopedUpgrades)
  const cost = building ? calcCost(building, building.count, costReduction) : undefined

  const canAfford = useResourceStore((state) =>
    building && cost ? state.canAfford(building.costResource, cost) : false
  )

  const data = bundle.buildings[bid]

  if (!building || !data || !building.unlocked) return null

  const costEmoji = ALL_RESOURCES[building.costResource as string]?.emoji ?? '🪙'
  const { produces, consumes } = calcBuildingRates(
    data,
    bundle.pipelineConfig.stages,
    building.baseProduction,
    scopedUpgrades,
  )

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label={data.name}>
            {data.emoji}
          </span>
          <div>
            <h3 className="font-semibold text-amber-900 text-sm">{data.name}</h3>
            <p className="text-xs text-amber-600">{data.description}</p>
          </div>
        </div>
        <span className="text-lg font-bold text-amber-800 bg-amber-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
          {building.count}
        </span>
      </div>

      {/* Production & consumption per unit */}
      <div className="text-xs space-y-0.5 mt-2 mb-3">
        {produces.map((p) => {
          const resData = ALL_RESOURCES[p.resource as string]
          return (
            <span key={`p-${p.resource as string}`} className="flex items-center gap-1 text-green-700">
              <span>+<NumberDisplay value={p.amount} />/s</span>
              <span>{resData?.emoji} {resData?.name}</span>
            </span>
          )
        })}
        {consumes.map((c) => {
          const resData = ALL_RESOURCES[c.resource as string]
          return (
            <span key={`c-${c.resource as string}`} className="flex items-center gap-1 text-red-500">
              <span>-<NumberDisplay value={c.amount} />/s</span>
              <span>{resData?.emoji} {resData?.name}</span>
            </span>
          )
        })}
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={() => buyBuilding(buildingId)}
          disabled={!canAfford}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            ${canAfford
              ? 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {cost && <NumberDisplay value={cost} />} {costEmoji}
        </button>
      </div>
    </div>
  )
}
