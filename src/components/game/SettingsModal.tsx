import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Decimal from 'decimal.js'
import { saveGame, exportSave, importSave, hardResetGame, getLastSaveTimestamp } from '@/hooks/useAutoSave'
import { useResourceStore } from '@/store/resourceStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { useProductStore } from '@/store/productStore'
import { ALL_RESOURCES, ALL_BUILDINGS } from '@/lib/constants'
import i18n from '@/i18n'
import type { ResourceId, BuildingId, ProductId } from '@/types'

// ─── Types ─────────────────────────────────────────────────────

type Tab = 'sauvegarde' | 'cheats' | 'langue'

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
  const { t } = useTranslation('settings')
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

  const formatSaveAgo = (ts: number): string => {
    const seconds = Math.floor((Date.now() - ts) / 1000)
    if (seconds < 5) return t('save.just_now')
    if (seconds < 60) return t('save.seconds_ago', { seconds })
    return t('save.minutes_ago', { minutes: Math.floor(seconds / 60) })
  }

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
      setImportError(t('save.import_empty_error'))
      return
    }
    const ok = await importSave(value)
    if (!ok) {
      setImportError(t('save.import_invalid'))
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
        <h3 className="text-sm font-semibold text-amber-800 mb-2">{t('save.manual_title')}</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
          >
            {t('save.save_now')}
          </button>
          {lastSave > 0 && (
            <span className="text-xs text-amber-600">
              {t('save.last_save', { time: formatSaveAgo(lastSave) })}
            </span>
          )}
        </div>
      </div>

      {/* Export */}
      <div>
        <h3 className="text-sm font-semibold text-amber-800 mb-2">{t('save.export_title')}</h3>
        <button
          onClick={handleExport}
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
        >
          {copied ? t('save.exported') : t('save.export_button')}
        </button>
      </div>

      {/* Import */}
      <div>
        <h3 className="text-sm font-semibold text-amber-800 mb-2">{t('save.import_title')}</h3>
        <textarea
          ref={importRef}
          placeholder={t('save.import_placeholder')}
          className="w-full h-20 border border-amber-300 rounded-lg p-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        {importError && <p className="text-red-500 text-xs mt-1">{importError}</p>}
        <button
          onClick={handleImport}
          className="mt-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
        >
          {t('save.import_button')}
        </button>
      </div>

      {/* Hard reset */}
      <div className="pt-2 border-t border-amber-200">
        <h3 className="text-sm font-semibold text-red-700 mb-2">{t('save.danger_zone')}</h3>
        <button
          onClick={handleReset}
          className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
            confirmReset
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300'
          }`}
        >
          {confirmReset ? t('save.confirm_delete') : t('save.delete_button')}
        </button>
        {confirmReset && (
          <p className="text-red-500 text-xs mt-1">
            {t('save.delete_warning')}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Cheats Tab ────────────────────────────────────────────────

function CheatsTab() {
  const { t } = useTranslation('settings')
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
    const allProducts: ProductId[] = ['croissants', 'pains_au_chocolat', 'curry_wurst', 'pizzas']
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
          {t('cheats.disclaimer')}
        </p>
      </div>

      {/* Amount selector */}
      <div>
        <label className="text-sm font-semibold text-amber-800 block mb-1">{t('cheats.amount_label')}</label>
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
        <h3 className="text-sm font-semibold text-amber-800 mb-2">{t('cheats.add_resources')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {resourceEntries.map(([id, data]) => (
            <button
              key={id}
              onClick={() => handleAddResource(id)}
              className="bg-white border border-amber-200 hover:bg-amber-50 active:bg-amber-100 rounded-lg px-3 py-2 text-xs font-medium text-amber-900 cursor-pointer transition-colors text-left"
            >
              {i18n.t(data.emoji, { ns: data.scope === 'global' ? 'common' : `products/${data.scope}` })} {i18n.t(data.name, { ns: data.scope === 'global' ? 'common' : `products/${data.scope}` })}
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
          {t('cheats.unlock_all')}
        </button>
        <button
          onClick={handleBuyAllUpgrades}
          className="bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
        >
          {t('cheats.buy_all_upgrades')}
        </button>
      </div>
    </div>
  )
}

// ─── Langue Tab ────────────────────────────────────────────────

function LangueTab() {
  const { t } = useTranslation('settings')
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
        <p className="text-amber-700 text-sm">
          {t('language.coming_soon')}
        </p>
        <p className="text-amber-500 text-xs mt-2">
          {t('language.current')}
        </p>
      </div>
    </div>
  )
}

// ─── Main Modal ────────────────────────────────────────────────

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { t } = useTranslation('settings')
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
          <h2 className="text-xl font-bold text-amber-900">{t('title')}</h2>
          <button
            onClick={onClose}
            className="text-amber-500 hover:text-amber-700 text-2xl leading-none cursor-pointer transition-colors"
            aria-label={t('close')}
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5">
          <TabButton label={t('tabs.save')} active={activeTab === 'sauvegarde'} onClick={() => setActiveTab('sauvegarde')} />
          <TabButton label={t('tabs.cheats')} active={activeTab === 'cheats'} onClick={() => setActiveTab('cheats')} />
          <TabButton label={t('tabs.language')} active={activeTab === 'langue'} onClick={() => setActiveTab('langue')} />
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
