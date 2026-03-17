import { useState, useRef, useEffect } from 'react'
import Decimal from 'decimal.js'
import { saveGame, exportSave, importSave, hardResetGame, getLastSaveTimestamp } from '@/hooks/useAutoSave'
import { useResourceStore } from '@/store/resourceStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { useProductStore } from '@/store/productStore'
import { ALL_RESOURCES, ALL_BUILDINGS } from '@/lib/constants'
import type { ResourceId, BuildingId, ProductId } from '@/types'

// ─── Types ─────────────────────────────────────────────────────

type Tab = 'sauvegarde' | 'cheats' | 'langue'

function formatSaveAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000)
  if (seconds < 5) return 'a l\'instant'
  if (seconds < 60) return `il y a ${seconds} s`
  return `il y a ${Math.floor(seconds / 60)} min`
}

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

// ─── Tab Button ────────────────────────────────────────────────

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer ${
        active
          ? 'bg-white text-amber-900 border border-b-0 border-amber-300'
          : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
      }`}
    >
      {label}
    </button>
  )
}

// ─── Sauvegarde Tab ────────────────────────────────────────────

function SaveTab({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const [importError, setImportError] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const importRef = useRef<HTMLTextAreaElement>(null)

  const [, forceUpdate] = useState(0)
  const lastSave = getLastSaveTimestamp()

  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const handleSave = () => {
    saveGame()
  }

  const handleExport = () => {
    const data = exportSave()
    navigator.clipboard.writeText(data).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleImport = async () => {
    const value = importRef.current?.value?.trim()
    if (!value) {
      setImportError('Collez votre sauvegarde ici.')
      return
    }
    const ok = await importSave(value)
    if (!ok) {
      setImportError('Sauvegarde invalide.')
    }
  }

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    await hardResetGame()
    onClose()
  }

  return (
    <div className="space-y-4">
      {/* Manual save */}
      <div>
        <h3 className="text-sm font-semibold text-amber-800 mb-2">Sauvegarde manuelle</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
          >
            Sauvegarder maintenant
          </button>
          {lastSave > 0 && (
            <span className="text-xs text-amber-600">
              Derniere sauvegarde : {formatSaveAgo(lastSave)}
            </span>
          )}
        </div>
      </div>

      {/* Export */}
      <div>
        <h3 className="text-sm font-semibold text-amber-800 mb-2">Exporter</h3>
        <button
          onClick={handleExport}
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
        >
          {copied ? 'Copie dans le presse-papier !' : 'Copier la sauvegarde'}
        </button>
      </div>

      {/* Import */}
      <div>
        <h3 className="text-sm font-semibold text-amber-800 mb-2">Importer</h3>
        <textarea
          ref={importRef}
          placeholder="Collez votre sauvegarde ici..."
          className="w-full h-20 border border-amber-300 rounded-lg p-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        {importError && <p className="text-red-500 text-xs mt-1">{importError}</p>}
        <button
          onClick={handleImport}
          className="mt-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
        >
          Importer la sauvegarde
        </button>
      </div>

      {/* Hard reset */}
      <div className="pt-2 border-t border-amber-200">
        <h3 className="text-sm font-semibold text-red-700 mb-2">Zone dangereuse</h3>
        <button
          onClick={handleReset}
          className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
            confirmReset
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300'
          }`}
        >
          {confirmReset ? 'Confirmer la suppression' : 'Supprimer la sauvegarde'}
        </button>
        {confirmReset && (
          <p className="text-red-500 text-xs mt-1">
            Cette action est irreversible ! Cliquez a nouveau pour confirmer.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Cheats Tab ────────────────────────────────────────────────

function CheatsTab() {
  const addResource = useResourceStore((s) => s.addResource)
  const unlockResource = useResourceStore((s) => s.unlockResource)
  const unlockBuilding = useBuildingStore((s) => s.unlockBuilding)
  const unlockProduct = useProductStore((s) => s.unlockProduct)
  const unlockedProducts = useProductStore((s) => s.unlockedProducts)

  const [cheatAmount, setCheatAmount] = useState('1000')

  const handleAddResource = (rid: string) => {
    const amount = new Decimal(cheatAmount || '0')
    if (amount.lte(0)) return
    addResource(rid as ResourceId, amount)
  }

  const handleUnlockAll = () => {
    // Unlock all resources
    for (const rid of Object.keys(ALL_RESOURCES)) {
      unlockResource(rid as ResourceId)
    }
    // Unlock all buildings
    for (const bid of Object.keys(ALL_BUILDINGS)) {
      unlockBuilding(bid as BuildingId)
    }
    // Unlock all products
    const allProducts: ProductId[] = ['croissants', 'pains_au_chocolat', 'chocolatines', 'pizzas']
    for (const pid of allProducts) {
      if (!unlockedProducts.includes(pid)) {
        unlockProduct(pid)
      }
    }
  }

  const handleBuyAllUpgrades = () => {
    const { upgrades } = useUpgradeStore.getState()
    const newUpgrades = { ...upgrades }
    for (const [id, upgrade] of Object.entries(newUpgrades)) {
      newUpgrades[id] = { ...upgrade, purchased: true }
    }
    useUpgradeStore.setState({ upgrades: newUpgrades })
  }

  // Group resources by scope for display
  const resourceEntries = Object.entries(ALL_RESOURCES)

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
        <p className="text-yellow-800 text-xs font-medium">
          Mode triche -- pour tester le jeu uniquement.
        </p>
      </div>

      {/* Amount selector */}
      <div>
        <label className="text-sm font-semibold text-amber-800 block mb-1">Quantite a ajouter</label>
        <div className="flex gap-2 flex-wrap">
          {['100', '1000', '1e6', '1e9', '1e15'].map((val) => (
            <button
              key={val}
              onClick={() => setCheatAmount(val)}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                cheatAmount === val
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Add resources */}
      <div>
        <h3 className="text-sm font-semibold text-amber-800 mb-2">Ajouter des ressources</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {resourceEntries.map(([id, data]) => (
            <button
              key={id}
              onClick={() => handleAddResource(id)}
              className="bg-white border border-amber-200 hover:bg-amber-50 active:bg-amber-100 rounded-lg px-3 py-2 text-xs font-medium text-amber-900 cursor-pointer transition-colors text-left"
            >
              {data.emoji} {data.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex gap-2 flex-wrap pt-2 border-t border-amber-200">
        <button
          onClick={handleUnlockAll}
          className="bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
        >
          Tout debloquer
        </button>
        <button
          onClick={handleBuyAllUpgrades}
          className="bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
        >
          Acheter tous les upgrades
        </button>
      </div>
    </div>
  )
}

// ─── Langue Tab ────────────────────────────────────────────────

function LangueTab() {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
        <p className="text-amber-700 text-sm">
          Le choix de la langue sera disponible prochainement.
        </p>
        <p className="text-amber-500 text-xs mt-2">
          Actuellement : Francais uniquement
        </p>
      </div>
    </div>
  )
}

// ─── Main Modal ────────────────────────────────────────────────

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('sauvegarde')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-amber-50 rounded-xl shadow-xl border border-amber-300 w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="text-xl font-bold text-amber-900">Options</h2>
          <button
            onClick={onClose}
            className="text-amber-500 hover:text-amber-700 text-2xl leading-none cursor-pointer transition-colors"
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5">
          <TabButton label="Sauvegarde" active={activeTab === 'sauvegarde'} onClick={() => setActiveTab('sauvegarde')} />
          <TabButton label="Cheats" active={activeTab === 'cheats'} onClick={() => setActiveTab('cheats')} />
          <TabButton label="Langue" active={activeTab === 'langue'} onClick={() => setActiveTab('langue')} />
        </div>

        {/* Content */}
        <div className="bg-white border-t border-amber-300 rounded-b-xl p-5 overflow-y-auto flex-1">
          {activeTab === 'sauvegarde' && <SaveTab onClose={onClose} />}
          {activeTab === 'cheats' && <CheatsTab />}
          {activeTab === 'langue' && <LangueTab />}
        </div>
      </div>
    </div>
  )
}
