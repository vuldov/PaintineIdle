import { useUpgradeStore, isUpgradeVisible } from '@/store/upgradeStore'
import { useResourceStore } from '@/store/resourceStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useSynergyStore } from '@/store/synergyStore'
import { useSupplierStore } from '@/store/supplierStore'
import { useProduct } from './ProductContext'
import { ALL_RESOURCES, ALL_SUPPLIERS, ALL_SUPPLIER_UPGRADES } from '@/lib/products/registry'
import { SYNERGY_UPGRADES, SYNERGY_UPGRADE_ORDER } from '@/lib/synergies/synergyUpgrades'
import { NumberDisplay } from '@/components/ui/NumberDisplay'
import { formatNumber } from '@/lib/formatNumber'
import type { UpgradeId, SupplierUpgradeId, Resource, UpgradeData } from '@/types'

// ─── Category badge styles ──────────────────────────────────────

const CATEGORY_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  specialization: { bg: 'bg-amber-100 border-amber-400', text: 'text-amber-800', label: 'Specialisation' },
  synergy: { bg: 'bg-purple-100 border-purple-400', text: 'text-purple-800', label: 'Synergie' },
  scaling: { bg: 'bg-blue-100 border-blue-400', text: 'text-blue-800', label: 'Escalade' },
}

const CATEGORY_BORDER: Record<string, string> = {
  specialization: 'border-amber-400',
  synergy: 'border-purple-400',
  scaling: 'border-blue-400',
}

// ─── Dynamic value computation ──────────────────────────────────

function computeDynamicLabel(
  data: UpgradeData,
  allBuildings: Record<string, { count: number }>,
  totalBuildingCount: number,
  totalUpgradeCount: number,
): string | null {
  const effect = data.effect

  if (effect.type === 'specialization' && effect.scalingBonus) {
    const sb = effect.scalingBonus
    let count = 0
    if (sb.scalingBuildingId) {
      count = allBuildings[sb.scalingBuildingId as string]?.count ?? 0
    }
    const divisor = sb.scalingDivisor ?? 1
    const scaledCount = Math.floor(count / divisor)
    const bonus = sb.bonusPerUnit.mul(scaledCount)
    if (bonus.gt(0)) {
      return `+${formatNumber(bonus.mul(100))}% (${scaledCount} tranches)`
    }
    return null
  }

  if (effect.type === 'scaling' && effect.scalingEffect) {
    const se = effect.scalingEffect
    let sourceCount = 0
    if (se.source === 'total_buildings') sourceCount = totalBuildingCount
    else if (se.source === 'total_upgrades') sourceCount = totalUpgradeCount
    else if (se.source === 'building_count' && se.sourceBuildingId) {
      sourceCount = allBuildings[se.sourceBuildingId as string]?.count ?? 0
    }
    const divisor = se.scalingDivisor ?? 1
    const scaledCount = Math.floor(sourceCount / divisor)
    const bonus = se.bonusPerUnit.mul(scaledCount)
    if (bonus.gt(0)) {
      return `+${formatNumber(bonus.mul(100))}% (${sourceCount})`
    }
    return null
  }

  return null
}

// ─── Product-scoped upgrade panel ───────────────────────────────

function ProductUpgrades() {
  const { bundle } = useProduct()
  const upgrades = useUpgradeStore((state) => state.upgrades)
  const buyUpgrade = useUpgradeStore((state) => state.buyUpgrade)
  const globalResources = useResourceStore((state) => state.globalResources)
  const productResources = useResourceStore((state) => state.productResources)
  const buildings = useBuildingStore((state) => state.buildings)
  const canAfford = useResourceStore((state) => state.canAfford)

  // Merge resources inline
  const allResources: Record<string, Resource> = { ...globalResources }
  for (const res of Object.values(productResources)) {
    Object.assign(allResources, res)
  }

  // Merge buildings inline
  const allBuildings: Record<string, { count: number }> = {}
  for (const productBuildings of Object.values(buildings)) {
    Object.assign(allBuildings, productBuildings)
  }

  const productUpgradeOrder = bundle.upgradeOrder

  // Available: visible + not purchased
  const available = productUpgradeOrder.filter((id) => {
    const uid = id as string
    const upgrade = upgrades[uid]
    if (!upgrade || upgrade.purchased) return false
    return isUpgradeVisible(uid, allResources, allBuildings, upgrades)
  })

  // Purchased
  const purchased = productUpgradeOrder.filter((id) => {
    const uid = id as string
    return upgrades[uid]?.purchased
  })

  if (available.length === 0 && purchased.length === 0) return null

  return (
    <>
      {available.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {available.map((id) => {
            const uid = id as string
            const data = bundle.upgrades[uid]
            if (!data) return null
            const affordable = canAfford(data.costResource, data.cost)
            const costEmoji = ALL_RESOURCES[data.costResource as string]?.emoji ?? '🪙'

            return (
              <button
                key={uid}
                onClick={() => buyUpgrade(id as UpgradeId)}
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
          <p className="text-xs text-amber-500 mb-2">Achetees</p>
          <div className="flex flex-wrap gap-2">
            {purchased.map((id) => {
              const uid = id as string
              const data = bundle.upgrades[uid]
              if (!data) return null
              return (
                <span
                  key={uid}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs"
                  title={`${data.name} -- ${data.description}`}
                >
                  {data.emoji} {data.name}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

// ─── Global synergy upgrades section ────────────────────────────

function GlobalSynergyUpgrades() {
  const upgrades = useUpgradeStore((state) => state.upgrades)
  const buyUpgrade = useUpgradeStore((state) => state.buyUpgrade)
  const globalResources = useResourceStore((state) => state.globalResources)
  const productResources = useResourceStore((state) => state.productResources)
  const buildings = useBuildingStore((state) => state.buildings)
  const canAfford = useResourceStore((state) => state.canAfford)
  const totalBuildingCount = useSynergyStore((s) => s.totalBuildingCount)
  const totalUpgradeCount = useSynergyStore((s) => s.totalUpgradeCount)

  // Merge resources
  const allResources: Record<string, Resource> = { ...globalResources }
  for (const res of Object.values(productResources)) {
    Object.assign(allResources, res)
  }

  // Merge buildings
  const allBuildings: Record<string, { count: number }> = {}
  for (const productBuildings of Object.values(buildings)) {
    Object.assign(allBuildings, productBuildings)
  }

  // Available synergy upgrades (visible + not purchased)
  const available = SYNERGY_UPGRADE_ORDER.filter((id) => {
    const uid = id as string
    const upgrade = upgrades[uid]
    if (!upgrade || upgrade.purchased) return false
    return isUpgradeVisible(uid, allResources, allBuildings, upgrades)
  })

  // Purchased synergy upgrades
  const purchased = SYNERGY_UPGRADE_ORDER.filter((id) => {
    const uid = id as string
    return upgrades[uid]?.purchased
  })

  if (available.length === 0 && purchased.length === 0) return null

  return (
    <div className="mt-4 pt-4 border-t border-amber-200">
      <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-1.5">
        <span>🔗</span> Ameliorations de synergie
      </h3>

      {available.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {available.map((id) => {
            const uid = id as string
            const data = SYNERGY_UPGRADES[uid]
            if (!data) return null
            const affordable = canAfford(data.costResource, data.cost)
            const costEmoji = ALL_RESOURCES[data.costResource as string]?.emoji ?? '🪙'
            const category = data.category ?? 'synergy'
            const badge = CATEGORY_BADGE[category]
            const borderColor = CATEGORY_BORDER[category] ?? 'border-amber-300'

            // Dynamic label for upgrades that show scaling values
            const dynamicLabel = computeDynamicLabel(data, allBuildings, totalBuildingCount, totalUpgradeCount)

            return (
              <button
                key={uid}
                onClick={() => buyUpgrade(id as UpgradeId)}
                disabled={!affordable}
                className={`
                  flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all
                  ${affordable
                    ? `${borderColor} bg-white hover:bg-amber-50 cursor-pointer`
                    : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  }
                `}
              >
                <span className="text-2xl shrink-0 mt-0.5">{data.emoji}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-amber-900 text-sm">{data.name}</h3>
                    {badge && (
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-600">{data.description}</p>
                  {dynamicLabel && (
                    <p className="text-xs text-green-700 font-medium mt-0.5">
                      Actuellement : {dynamicLabel}
                    </p>
                  )}
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
          <p className="text-xs text-amber-500 mb-2">Achetees</p>
          <div className="flex flex-wrap gap-2">
            {purchased.map((id) => {
              const uid = id as string
              const data = SYNERGY_UPGRADES[uid]
              if (!data) return null
              const category = data.category ?? 'synergy'
              const badge = CATEGORY_BADGE[category]

              // Dynamic label for purchased upgrades
              const dynamicLabel = computeDynamicLabel(data, allBuildings, totalBuildingCount, totalUpgradeCount)

              return (
                <span
                  key={uid}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${badge?.bg ?? 'bg-amber-100'} ${badge?.text ?? 'text-amber-800'}`}
                  title={`${data.name} -- ${data.description}${dynamicLabel ? ` (${dynamicLabel})` : ''}`}
                >
                  {data.emoji} {data.name}
                  {dynamicLabel && (
                    <span className="text-green-700 font-medium ml-1">({dynamicLabel})</span>
                  )}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Supplier upgrades section ──────────────────────────────────

function SupplierUpgradesSection() {
  const { bundle } = useProduct()
  const upgradeStates = useSupplierStore((s) => s.supplierUpgrades)
  const buyUpgrade = useSupplierStore((s) => s.buySupplierUpgrade)
  const canAfford = useResourceStore((s) => s.canAfford)

  if (!bundle.supplierUpgradeOrder || bundle.supplierUpgradeOrder.length === 0) return null

  const available = bundle.supplierUpgradeOrder.filter((id) => {
    const state = upgradeStates[id as string]
    return state && !state.purchased
  })

  const purchased = bundle.supplierUpgradeOrder.filter((id) => {
    return upgradeStates[id as string]?.purchased
  })

  if (available.length === 0 && purchased.length === 0) return null

  return (
    <div className="mt-4 pt-4 border-t border-amber-200">
      <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-1.5">
        <span>🚚</span> Ameliorations fournisseurs
      </h3>

      {available.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {available.map((id) => {
            const uid = id as string
            const data = ALL_SUPPLIER_UPGRADES[uid]
            if (!data) return null
            const affordable = canAfford(data.costResource, data.cost)
            const costRes = ALL_RESOURCES[data.costResource as string]
            const costEmoji = costRes?.emoji ?? ''
            const supplierData = ALL_SUPPLIERS[data.targetSupplier as string]
            const supplierName = supplierData?.name ?? data.targetSupplier

            return (
              <button
                key={uid}
                onClick={() => buyUpgrade(data.id as SupplierUpgradeId)}
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
                  <p className="text-[10px] text-amber-400">Cible : {supplierName}</p>
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
          <p className="text-xs text-amber-500 mb-2">Achetees</p>
          <div className="flex flex-wrap gap-2">
            {purchased.map((id) => {
              const uid = id as string
              const data = ALL_SUPPLIER_UPGRADES[uid]
              if (!data) return null
              return (
                <span
                  key={uid}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs"
                  title={`${data.name} -- ${data.description}`}
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

// ─── Main panel ─────────────────────────────────────────────────

export function UpgradePanel() {
  return (
    <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-amber-800 mb-4">
        Ameliorations
      </h2>

      <ProductUpgrades />
      <SupplierUpgradesSection />
      <GlobalSynergyUpgrades />
    </div>
  )
}
