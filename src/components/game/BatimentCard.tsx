import { useBuildingStore } from '@/store/buildingStore'
import { useResourceStore } from '@/store/resourceStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { BUILDINGS_DATA } from '@/lib/buildings'
import { RESOURCES_DATA } from '@/lib/resources'
import { calcCost, calcCostReduction, calcBuildingRates } from '@/mechanics/productionMechanics'
import { NumberDisplay } from '@/components/ui/NumberDisplay'
import type { BuildingId } from '@/types'

// ─── Composant ───────────────────────────────────────────────────

interface BatimentCardProps {
  buildingId: BuildingId
}

export function BatimentCard({ buildingId }: BatimentCardProps) {
  const building = useBuildingStore((state) => state.buildings[buildingId])
  const buyBuilding = useBuildingStore((state) => state.buyBuilding)
  const upgrades = useUpgradeStore((state) => state.upgrades)
  const costReduction = calcCostReduction(upgrades)
  const cost = calcCost(building, building.count, costReduction)
  const canAfford = useResourceStore((state) =>
    state.canAfford(building.costResource, cost)
  )
  const data = BUILDINGS_DATA[buildingId]
  const costEmoji = RESOURCES_DATA[building.costResource].emoji
  const { produces, consumes } = calcBuildingRates(buildingId, building.baseProduction, upgrades)

  if (!building.unlocked) return null

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

      {/* Production & consommation par unité */}
      <div className="text-xs space-y-0.5 mt-2 mb-3">
        {produces.map((p) => (
          <span key={`p-${p.resource}`} className="flex items-center gap-1 text-green-700">
            <span>+<NumberDisplay value={p.amount} />/s</span>
            <span>{RESOURCES_DATA[p.resource].emoji} {RESOURCES_DATA[p.resource].name}</span>
          </span>
        ))}
        {consumes.map((c) => (
          <span key={`c-${c.resource}`} className="flex items-center gap-1 text-red-500">
            <span>-<NumberDisplay value={c.amount} />/s</span>
            <span>{RESOURCES_DATA[c.resource].emoji} {RESOURCES_DATA[c.resource].name}</span>
          </span>
        ))}
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
          <NumberDisplay value={cost} /> {costEmoji}
        </button>
      </div>
    </div>
  )
}
