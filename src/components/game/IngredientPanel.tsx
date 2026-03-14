import { useResourceStore } from '@/store/resourceStore'
import { RESOURCES_DATA } from '@/lib/constants'
import { NumberDisplay } from '@/components/ui/NumberDisplay'
import type { ResourceId } from '@/types'

export function IngredientPanel() {
  const resources = useResourceStore((state) => state.resources)

  const ingredients = (Object.keys(resources) as ResourceId[]).filter(
    (id) => resources[id].unlocked && RESOURCES_DATA[id].category === 'ingredient'
  )

  const meta = (Object.keys(resources) as ResourceId[]).filter(
    (id) => resources[id].unlocked && RESOURCES_DATA[id].category === 'meta'
  )

  const visible = [...ingredients, ...meta]
  if (visible.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-amber-800 mb-3">Ressources</h2>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {visible.map((id) => {
          const resource = resources[id]
          const data = RESOURCES_DATA[id]
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
                <span className="text-xs text-amber-500">
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
