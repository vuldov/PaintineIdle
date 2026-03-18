import type { SupplierData, SupplierState } from '@/types'
import { PANTINS_COINS_ID } from '@/types'
import { useProduct } from './ProductContext'
import { useSupplierStore } from '@/store/supplierStore'
import { useResourceStore } from '@/store/resourceStore'
import { NumberDisplay } from '@/components/ui/NumberDisplay'
import { ALL_SUPPLIERS, ALL_SUPPLIER_UPGRADES } from '@/lib/products/registry'
import { calcEffectiveMaxRate, calcEffectiveCostPerSecond, calcSupplierProduction, calcSupplierCostPerSecond } from '@/mechanics/supplierMechanics'

// ─── Single supplier card ────────────────────────────────────────

function SupplierCard({ supplierId }: { supplierId: string }) {
  const data: SupplierData | undefined = ALL_SUPPLIERS[supplierId]
  const state: SupplierState | undefined = useSupplierStore((s) => s.suppliers[supplierId])
  const upgradeStates = useSupplierStore((s) => s.supplierUpgrades)
  const buyContract = useSupplierStore((s) => s.buyContract)
  const toggleSupplier = useSupplierStore((s) => s.toggleSupplier)
  const setRate = useSupplierStore((s) => s.setRate)
  const canAfford = useResourceStore((s) => s.canAfford)

  if (!data || !state) return null

  const resourceData = useProduct().bundle.resources[data.producedResource as string]
  const resourceEmoji = resourceData?.emoji ?? ''
  const resourceName = resourceData?.name ?? data.producedResource

  const effectiveMax = calcEffectiveMaxRate(data, ALL_SUPPLIER_UPGRADES, upgradeStates)
  const effectiveCost = calcEffectiveCostPerSecond(data, ALL_SUPPLIER_UPGRADES, upgradeStates)

  // ── Locked state ──
  if (!state.unlocked) {
    const affordable = canAfford(PANTINS_COINS_ID, data.contractCost)
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm opacity-80">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl grayscale">{data.emoji}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-700 text-sm">{data.name}</h3>
            <p className="text-xs text-gray-500">{data.description}</p>
          </div>
        </div>
        <div className="text-xs text-gray-500 mb-3">
          Produit : {resourceEmoji} {resourceName} (max <NumberDisplay value={effectiveMax} />/s)
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
          Signer le contrat — <NumberDisplay value={data.contractCost} /> 🪙
        </button>
      </div>
    )
  }

  // ── Unlocked state ──
  const production = calcSupplierProduction(effectiveMax, state)
  const costPerSec = calcSupplierCostPerSecond(effectiveCost, state)

  return (
    <div className={`rounded-xl border p-4 shadow-sm transition-colors ${
      state.active
        ? 'bg-amber-50 border-amber-300'
        : 'bg-white border-amber-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl">{data.emoji}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-amber-900 text-sm">{data.name}</h3>
            <p className="text-xs text-amber-600">{data.description}</p>
          </div>
        </div>
        {state.active && (
          <span className="shrink-0 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            Actif
          </span>
        )}
      </div>

      {/* Resource info */}
      <div className="text-xs text-amber-700 mb-3">
        {resourceEmoji} {resourceName} — max <NumberDisplay value={effectiveMax} />/s
      </div>

      {/* Toggle button */}
      <button
        onClick={() => toggleSupplier(data.id)}
        className={`w-full py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer mb-3 ${
          state.active
            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            : 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700'
        }`}
      >
        {state.active ? 'Desactiver' : 'Activer'}
      </button>

      {/* Rate slider (only when active) */}
      {state.active && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
            <span>Debit : {state.ratePercent}%</span>
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
      )}
    </div>
  )
}

// ─── Panel ────────────────────────────────────────────────────────

export function SupplierPanel() {
  const { bundle } = useProduct()

  if (!bundle.supplierOrder || bundle.supplierOrder.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-amber-800 mb-1">
        Fournisseurs
      </h2>
      <p className="text-xs text-amber-600 mb-4">
        Signez des contrats puis activez vos fournisseurs pour approvisionner vos ingredients automatiquement.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bundle.supplierOrder.map((id) => (
          <SupplierCard key={id as string} supplierId={id as string} />
        ))}
      </div>
    </div>
  )
}
