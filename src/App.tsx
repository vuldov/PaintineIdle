import { useGameLoop } from '@/hooks/useGameLoop'
import { useAutoSave } from '@/hooks/useAutoSave'
import { ResourceBar } from '@/components/game/ResourceBar'
import { IngredientPanel } from '@/components/game/IngredientPanel'
import { CraftingPanel } from '@/components/game/CraftingPanel'
import { UpgradePanel } from '@/components/game/UpgradePanel'
import { BatimentCard } from '@/components/game/BatimentCard'
import { BUILDING_ORDER } from '@/lib/buildings'

function App() {
  useGameLoop()
  useAutoSave()

  return (
    <div className="min-h-screen bg-amber-50">
      <ResourceBar />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-900">
            🥐 Paintine Idle
          </h1>
          <p className="text-amber-700 mt-2">
            Du fournil artisanal à l'empire mondial de la viennoiserie
          </p>
        </div>

        <IngredientPanel />

        <CraftingPanel />

        <UpgradePanel />

        <section>
          <h2 className="text-xl font-semibold text-amber-800 mb-4">
            Bâtiments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BUILDING_ORDER.map((id) => (
              <BatimentCard key={id} buildingId={id} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
