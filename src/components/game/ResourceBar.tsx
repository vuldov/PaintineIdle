import { useResourceStore } from '@/store/resourceStore'
import { RESOURCES_DATA } from '@/lib/constants'
import { NumberDisplay } from '@/components/ui/NumberDisplay'
import type { ResourceId } from '@/types'

export function ResourceBar() {
  const resources = useResourceStore((state) => state.resources)

  // Top bar : produits finis + monnaie
  const topBarResources = (Object.keys(resources) as ResourceId[]).filter(
    (id) => resources[id].unlocked
      && (RESOURCES_DATA[id].category === 'produit_fini' || RESOURCES_DATA[id].category === 'monnaie')
  )

  return (
    <header className="sticky top-0 z-10 bg-amber-100/90 backdrop-blur-sm border-b border-amber-300 px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-center gap-8">
        {topBarResources.map((id) => {
          const resource = resources[id]
          const data = RESOURCES_DATA[id]
          return (
            <div key={id} className="flex items-center gap-2 text-amber-900">
              <span className="text-2xl" role="img" aria-label={data.name}>
                {data.emoji}
              </span>
              <div className="flex flex-col items-start leading-tight">
                <span className="font-bold text-lg">
                  <NumberDisplay value={resource.amount} />
                </span>
                <span className="text-xs text-amber-700">
                  <NumberDisplay value={resource.perSecond} />/s
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </header>
  )
}
