import { useState } from 'react'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'
import type { SupplierData, SupplierState, SupplierContractTier } from '@/types'
import { PANTINS_COINS_ID } from '@/types'
import { useProduct } from './ProductContext'
import { useSupplierStore } from '@/store/supplierStore'
import { useResourceStore } from '@/store/resourceStore'
import { NumberDisplay } from '@/components/ui/NumberDisplay'
import { ALL_SUPPLIERS, ALL_SUPPLIER_UPGRADES } from '@/lib/products/registry'
import { SUPPLIER_CONTRACT_TIERS } from '@/lib/constants'
import { GameEmoji } from '@/components/ui/GameEmoji'
import { calcEffectiveMaxRate, calcEffectiveCostPerSecond, calcSupplierProduction, calcSupplierCostPerSecond, calcContractUpgradeCost } from '@/mechanics/supplierMechanics'

// ─── Collapsible wrapper for mobile ──────────────────────────────

function CollapsibleSupplier({
  emoji,
  name,
  description,
  resourceEmoji,
  production,
  costPerSec,
  tierEmoji,
  tierName,
  children,
}: {
  emoji: string
  name: string
  description: string
  resourceEmoji: string
  production: Decimal
  costPerSec: Decimal
  tierEmoji: string
  tierName: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-xl border shadow-sm transition-colors bg-amber-50 border-amber-300">
      {/* Header — always visible, clickable on mobile to toggle */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between sm:pointer-events-none cursor-pointer sm:cursor-default p-4 ${open ? 'pb-2' : ''}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl"><GameEmoji value={emoji} /></span>
          <div className="min-w-0 text-left">
            <h3 className="font-semibold text-amber-900 text-sm">{name}</h3>
            {open && <p className="text-xs text-amber-600">{description}</p>}
          </div>
        </div>
        <span className="text-amber-400 text-sm sm:hidden shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {/* Collapsed summary — compact rate badges */}
      {!open && (
        <div className="flex items-center gap-2 px-4 pb-3 pt-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-medium">
            +<NumberDisplay value={production} />/s <GameEmoji value={resourceEmoji} />
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-[11px] font-medium">
            -<NumberDisplay value={costPerSec} />/s 🪙
          </span>
          <span className="text-[10px] text-amber-500 ml-auto">{tierEmoji} {tierName}</span>
        </div>
      )}

      {/* Expanded body */}
      {open && (
        <div className="px-4 pb-4">
          {/* Contract tier */}
          <div className="text-xs font-medium text-amber-600 mb-1">
            {tierEmoji} {tierName}
          </div>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Single supplier card ────────────────────────────────────────

function SupplierCard({ supplierId }: { supplierId: string }) {
  const data: SupplierData | undefined = ALL_SUPPLIERS[supplierId]
  const state: SupplierState | undefined = useSupplierStore((s) => s.suppliers[supplierId])
  const upgradeStates = useSupplierStore((s) => s.supplierUpgrades)
  const buyContract = useSupplierStore((s) => s.buyContract)
  const upgradeContract = useSupplierStore((s) => s.upgradeContract)
  const setRate = useSupplierStore((s) => s.setRate)
  const coinsAmount = useResourceStore((s) => {
    const coins = s.globalResources[PANTINS_COINS_ID as string]
    return coins ? coins.amount : new Decimal(0)
  })

  if (!data || !state) return null

  const { productId } = useProduct()
  const resourceData = useProduct().bundle.resources[data.producedResource as string]
  const { t: tp } = useTranslation(`products/${productId}`)
  const { t: tc } = useTranslation('common')

  const resourceEmoji = resourceData ? tp(resourceData.emoji) : ''
  const resourceName = resourceData ? tp(resourceData.name) : (data.producedResource as string)

  const contractTier = state.contractTier ?? 0
  const effectiveMax = calcEffectiveMaxRate(data, ALL_SUPPLIER_UPGRADES, upgradeStates, contractTier)
  const effectiveCost = calcEffectiveCostPerSecond(data, ALL_SUPPLIER_UPGRADES, upgradeStates)

  const currentTierData = SUPPLIER_CONTRACT_TIERS[contractTier]

  // ── Locked state ──
  if (!state.unlocked) {
    const affordable = coinsAmount.gte(data.contractCost)
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm opacity-80">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl grayscale"><GameEmoji value={tp(data.emoji)} /></span>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-700 text-sm">{tp(data.name)}</h3>
            <p className="text-xs text-gray-500">{tp(data.description)}</p>
          </div>
        </div>
        <div className="text-xs text-gray-500 mb-3">
          {tc('supplier.produces')} : <GameEmoji value={resourceEmoji} /> {resourceName} (max <NumberDisplay value={effectiveMax} />/s)
        </div>
        <button
          onClick={() => buyContract(data.id)}
          disabled={!affordable}
          className={`w-full py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            affordable
              ? 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {tc('actions.sign_contract')} — <NumberDisplay value={data.contractCost} integer /> 🪙
        </button>
      </div>
    )
  }

  // ── Unlocked state ──
  const production = calcSupplierProduction(effectiveMax, state)
  const costPerSec = calcSupplierCostPerSecond(effectiveCost, data.baseMaxRate, effectiveMax, state)

  const canUpgradeTier = contractTier < 4
  const nextTier = canUpgradeTier ? ((contractTier + 1) as SupplierContractTier) : null
  const nextTierData = nextTier !== null ? SUPPLIER_CONTRACT_TIERS[nextTier] : null
  const upgradeCost = nextTier !== null ? calcContractUpgradeCost(data, nextTier) : null
  const canAffordUpgrade = upgradeCost !== null && coinsAmount.gte(upgradeCost)

  return (
    <CollapsibleSupplier
      emoji={tp(data.emoji)}
      name={tp(data.name)}
      description={tp(data.description)}
      resourceEmoji={resourceEmoji}
      production={production}
      costPerSec={costPerSec}
      tierEmoji={currentTierData.emoji}
      tierName={currentTierData.name}
    >
      {/* Resource info */}
      <div className="text-xs text-amber-700 mb-3">
        <GameEmoji value={resourceEmoji} /> {resourceName} — max <NumberDisplay value={effectiveMax} />/s
      </div>

      {/* Rate slider */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
          <span>{tc('supplier.rate')} : {state.ratePercent}%</span>
          <span>
            <NumberDisplay value={production} />/s → <NumberDisplay value={costPerSec} /> 🪙/s
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={10}
          value={state.ratePercent}
          onChange={(e) => setRate(data.id, Number(e.target.value))}
          className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-[10px] text-amber-500 mt-0.5">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Contract tier upgrade */}
      {canUpgradeTier && nextTierData && upgradeCost && (
        <button
          onClick={() => upgradeContract(data.id)}
          disabled={!canAffordUpgrade}
          className={`w-full py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            canAffordUpgrade
              ? 'bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {tc('supplier.upgrade_contract')} → {nextTierData.emoji} {nextTierData.name} (x{nextTierData.rateMultiplier} {tc('supplier.rate').toLowerCase()}) — <NumberDisplay value={upgradeCost} integer /> 🪙
        </button>
      )}
      {!canUpgradeTier && (
        <div className="text-center text-[10px] text-amber-500 font-medium">
          {tc('status.max_tier')}
        </div>
      )}
    </CollapsibleSupplier>
  )
}

// ─── Panel ────────────────────────────────────────────────────────

export function SupplierPanel() {
  const { t } = useTranslation('common')
  const { bundle } = useProduct()

  if (!bundle.supplierOrder || bundle.supplierOrder.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-amber-800 mb-1">
        {t('sections.suppliers')}
      </h2>
      <p className="text-xs text-amber-600 mb-4">
        {t('supplier.sign_contracts_hint')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bundle.supplierOrder.map((id) => (
          <SupplierCard key={id as string} supplierId={id as string} />
        ))}
      </div>
    </div>
  )
}
