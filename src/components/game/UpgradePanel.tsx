import { useUpgradeStore, isUpgradeVisible } from '@/store/upgradeStore'
import { useResourceStore } from '@/store/resourceStore'
import { useBuildingStore } from '@/store/buildingStore'
import { UPGRADES_DATA, UPGRADE_ORDER } from '@/lib/upgrades'
import { RESOURCES_DATA } from '@/lib/resources'
import { NumberDisplay } from '@/components/ui/NumberDisplay'

export function UpgradePanel() {
  const upgrades = useUpgradeStore((state) => state.upgrades)
  const buyUpgrade = useUpgradeStore((state) => state.buyUpgrade)
  const resources = useResourceStore((state) => state.resources)
  const buildings = useBuildingStore((state) => state.buildings)
  const canAfford = useResourceStore((state) => state.canAfford)

  // Filtrer : visible + pas encore acheté
  const available = UPGRADE_ORDER.filter((id) => {
    const upgrade = upgrades[id]
    if (!upgrade || upgrade.purchased) return false
    return isUpgradeVisible(id, resources, buildings, upgrades)
  })

  // Upgrades déjà achetées (pour l'affichage)
  const purchased = UPGRADE_ORDER.filter((id) => upgrades[id]?.purchased)

  if (available.length === 0 && purchased.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-amber-800 mb-4">
        Améliorations
      </h2>

      {available.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {available.map((id) => {
            const data = UPGRADES_DATA[id]
            const affordable = canAfford(data.costResource, data.cost)
            const costEmoji = RESOURCES_DATA[data.costResource].emoji

            return (
              <button
                key={id}
                onClick={() => buyUpgrade(id)}
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
          <p className="text-xs text-amber-500 mb-2">Achetées</p>
          <div className="flex flex-wrap gap-2">
            {purchased.map((id) => {
              const data = UPGRADES_DATA[id]
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs"
                  title={`${data.name} — ${data.description}`}
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
