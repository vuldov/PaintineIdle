import { useState } from 'react'
import { useGameLoop } from '@/hooks/useGameLoop'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useProductStore } from '@/store/productStore'
import { ResourceBar } from '@/components/game/ResourceBar'
import { ProductPage } from '@/components/game/ProductPage'
import { SynergyPanel } from '@/components/game/SynergyPanel'
import { SettingsModal } from '@/components/game/SettingsModal'
import { ToastContainer } from '@/components/ui/ToastContainer'

function App() {
  useGameLoop()
  useAutoSave()

  const viewMode = useProductStore((s) => s.viewMode)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-amber-50">
      {/* WIP Banner */}
      <div className="bg-yellow-400 text-yellow-900 text-center py-2 text-sm font-semibold border-b border-yellow-500">
        Version alpha -- Jeu en cours de developpement
      </div>

      <ResourceBar onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-900">
            Paintine Idle
          </h1>
          <p className="text-amber-700 mt-2">
            Du fournil artisanal a l'empire mondial de la viennoiserie
          </p>
        </div>

        {viewMode === 'product' && <ProductPage />}
        {viewMode === 'synergies' && <SynergyPanel />}
      </main>

      <footer className="text-center py-6 text-amber-600 text-sm border-t border-amber-200 mt-8">
        Fait avec amour par Lucas Antonelli
      </footer>

      <ToastContainer />
    </div>
  )
}

export default App
