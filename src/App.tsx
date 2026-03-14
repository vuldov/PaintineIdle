import { useGameLoop } from '@/hooks/useGameLoop'
import { useAutoSave } from '@/hooks/useAutoSave'
import { ResourceBar } from '@/components/game/ResourceBar'
import { BatimentCard } from '@/components/game/BatimentCard'
import { CroissantButton } from '@/components/game/CroissantButton'
import { IngredientPanel } from '@/components/game/IngredientPanel'
import { UpgradePanel } from '@/components/game/UpgradePanel'
import { BUILDING_ORDER } from '@/lib/constants'

function App() {
  useGameLoop()
  useAutoSave()

  return (
    <div className="min-h-screen bg-amber-50">
      <ResourceBar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900">
            🥐 Croissant Idle
          </h1>
          <p className="text-amber-700 mt-2">
            Du fournil artisanal à l'empire mondial de la viennoiserie
          </p>
        </div>

        <section className="flex justify-center mb-10">
          <CroissantButton />
        </section>

        <IngredientPanel />

        <section className="mt-6">
          <UpgradePanel />
        </section>

        <section className="mt-6">
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
