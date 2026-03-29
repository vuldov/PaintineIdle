import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
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
import type { UpgradeId, SupplierUpgradeId, Resource, UpgradeData, ResourceCost } from '@/types'
import { GameEmoji } from '@/components/ui/GameEmoji'

// ─── Category badge styles ──────────────────────────────────────

const CATEGORY_BADGE: Record<string, { bg: string; text: string; labelKey: string; border: string }> = {
  specialization: { bg: 'bg-amber-100', text: 'text-amber-800', labelKey: 'upgrade_categories.specialization', border: 'border-amber-400' },
  synergy:        { bg: 'bg-purple-100', text: 'text-purple-800', labelKey: 'upgrade_categories.synergy', border: 'border-purple-400' },
  scaling:        { bg: 'bg-blue-100', text: 'text-blue-800', labelKey: 'upgrade_categories.scaling', border: 'border-blue-400' },
  supplier:       { bg: 'bg-teal-100', text: 'text-teal-800', labelKey: 'upgrade_categories.supplier', border: 'border-teal-400' },
  milestone:      { bg: 'bg-orange-100', text: 'text-orange-800', labelKey: 'upgrade_categories.milestone', border: 'border-orange-400' },
  ultimate:       { bg: 'bg-red-100', text: 'text-red-800', labelKey: 'upgrade_categories.ultimate', border: 'border-red-400' },
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

// ─── Unified upgrade item type ──────────────────────────────────

interface CostDisplay {
  amount: Decimal
  emoji: string
}

interface UpgradeItem {
  key: string
  emoji: string
  name: string
  description: string
  subtitle?: string
  costs: CostDisplay[]
  badge?: typeof CATEGORY_BADGE[string]
  dynamicLabel?: string | null
  affordable: boolean
  purchased: boolean
  onBuy: () => unknown
}

// ─── Cost helpers ───────────────────────────────────────────────

function buildCosts(costResource: string, cost: Decimal, extraCosts?: ResourceCost[], resolve?: (key: string) => string): CostDisplay[] {
  const r = (key: string) => resolve ? resolve(key) : key
  const costs: CostDisplay[] = [
    { amount: cost, emoji: (() => { const res = ALL_RESOURCES[costResource]; return res ? r(res.emoji) : '🪙' })() },
  ]
  if (extraCosts) {
    for (const ec of extraCosts) {
      const res = ALL_RESOURCES[ec.resource as string]
      costs.push({ amount: ec.amount, emoji: res ? r(res.emoji) : '🪙' })
    }
  }
  return costs
}

function canAffordAll(
  canAfford: (r: import('@/types').ResourceId, a: Decimal) => boolean,
  costResource: import('@/types').ResourceId,
  cost: Decimal,
  extraCosts?: ResourceCost[],
): boolean {
  if (!canAfford(costResource, cost)) return false
  if (extraCosts) {
    for (const ec of extraCosts) {
      if (!canAfford(ec.resource, ec.amount)) return false
    }
  }
  return true
}

// ─── Main panel ─────────────────────────────────────────────────

export function UpgradePanel() {
  const { t } = useTranslation('common')
  const { productId, bundle } = useProduct()
  const { t: tp } = useTranslation(`products/${productId}`)
  const upgrades = useUpgradeStore((s) => s.upgrades)
  const buyUpgrade = useUpgradeStore((s) => s.buyUpgrade)
  const globalResources = useResourceStore((s) => s.globalResources)
  const productResources = useResourceStore((s) => s.productResources)
  const buildings = useBuildingStore((s) => s.buildings)
  const canAfford = useResourceStore((s) => s.canAfford)
  const totalBuildingCount = useSynergyStore((s) => s.totalBuildingCount)
  const totalUpgradeCount = useSynergyStore((s) => s.totalUpgradeCount)
  const supplierUpgradeStates = useSupplierStore((s) => s.supplierUpgrades)
  const supplierStates = useSupplierStore((s) => s.suppliers)
  const buySupplierUpgrade = useSupplierStore((s) => s.buySupplierUpgrade)

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

  // ── 1. Product upgrades (non-milestone) ──
  const regularProductItems: UpgradeItem[] = []
  const milestoneAvailableItems: UpgradeItem[] = []
  const milestonePurchasedItems: UpgradeItem[] = []

  for (const id of bundle.upgradeOrder) {
    const uid = id as string
    const data = bundle.upgrades[uid]
    const state = upgrades[uid]
    if (!data || !state) continue

    if (data.category === 'milestone') {
      // Milestone upgrade: show ALL whose threshold is reached
      if (state.purchased) {
        milestonePurchasedItems.push({
          key: uid, emoji: tp(data.emoji), name: tp(data.name), description: tp(data.description),
          costs: buildCosts(data.costResource as string, data.cost, data.extraCosts, tp),
          badge: CATEGORY_BADGE.milestone,
          affordable: false, purchased: true, onBuy: () => {},
        })
        continue
      }

      const visible = isUpgradeVisible(uid, allResources, allBuildings, upgrades)
      if (!visible) continue

      milestoneAvailableItems.push({
        key: uid, emoji: tp(data.emoji), name: tp(data.name), description: tp(data.description),
        costs: buildCosts(data.costResource as string, data.cost, data.extraCosts, tp),
        badge: CATEGORY_BADGE.milestone,
        affordable: canAffordAll(canAfford, data.costResource, data.cost, data.extraCosts),
        purchased: false,
        onBuy: () => buyUpgrade(id as UpgradeId),
      })
    } else {
      // Regular product upgrade
      const visible = state.purchased || isUpgradeVisible(uid, allResources, allBuildings, upgrades)
      if (!visible) continue
      regularProductItems.push({
        key: uid,
        emoji: tp(data.emoji),
        name: tp(data.name),
        description: tp(data.description),
        costs: buildCosts(data.costResource as string, data.cost, data.extraCosts, tp),
        affordable: canAffordAll(canAfford, data.costResource, data.cost, data.extraCosts),
        purchased: state.purchased,
        onBuy: () => buyUpgrade(id as UpgradeId),
      })
    }
  }

  const productItems = [...regularProductItems, ...milestoneAvailableItems, ...milestonePurchasedItems]

  // ── 2. Supplier upgrades (show only next unpurchased per supplier) ──
  const supplierItems: UpgradeItem[] = []
  const shownSuppliers = new Set<string>()
  const purchasedSupplierItems: UpgradeItem[] = []

  for (const id of (bundle.supplierUpgradeOrder ?? [])) {
    const uid = id as string
    const data = ALL_SUPPLIER_UPGRADES[uid]
    const state = supplierUpgradeStates[uid]
    if (!data || !state) continue
    const sid = data.targetSupplier as string
    const supplierData = ALL_SUPPLIERS[sid]

    // Hide upgrades for suppliers whose contract hasn't been bought yet
    if (!supplierStates[sid]?.unlocked) continue

    if (state.purchased) {
      purchasedSupplierItems.push({
        key: uid, emoji: tp(data.emoji), name: tp(data.name), description: tp(data.description),
        subtitle: supplierData ? tp(supplierData.name) : undefined,
        costs: [{ amount: data.cost, emoji: (() => { const r = ALL_RESOURCES[data.costResource as string]; return r ? tp(r.emoji) : '' })() }],
        badge: CATEGORY_BADGE.supplier, affordable: false, purchased: true,
        onBuy: () => {},
      })
      continue
    }

    // Only show the first unpurchased upgrade for each supplier
    if (shownSuppliers.has(sid)) continue
    shownSuppliers.add(sid)

    supplierItems.push({
      key: uid, emoji: tp(data.emoji), name: tp(data.name), description: tp(data.description),
      subtitle: supplierData ? tp(supplierData.name) : undefined,
      costs: [{ amount: data.cost, emoji: (() => { const r = ALL_RESOURCES[data.costResource as string]; return r ? tp(r.emoji) : '' })() }],
      badge: CATEGORY_BADGE.supplier,
      affordable: canAfford(data.costResource, data.cost),
      purchased: false,
      onBuy: () => buySupplierUpgrade(data.id as SupplierUpgradeId),
    })
  }

  // ── 3. Synergy upgrades ──
  const ts = (key: string) => i18n.t(key, { ns: 'synergies' })
  // Scope-aware resolver for cost emojis (resources can come from any product)
  const resolveResourceEmoji = (resId: string): string => {
    const res = ALL_RESOURCES[resId]
    if (!res) return '🪙'
    const scope = res.scope
    if (scope === 'global') return i18n.t(res.emoji, { ns: 'common' })
    return i18n.t(res.emoji, { ns: `products/${scope}` })
  }
  const synergyItems: UpgradeItem[] = SYNERGY_UPGRADE_ORDER.map((id): UpgradeItem | null => {
    const uid = id as string
    const data = SYNERGY_UPGRADES[uid]
    const state = upgrades[uid]
    if (!data || !state) return null
    const visible = state.purchased || isUpgradeVisible(uid, allResources, allBuildings, upgrades)
    if (!visible) return null
    const category = data.category ?? 'synergy'
    // Build costs with scope-aware emoji resolution
    const mainRes = ALL_RESOURCES[data.costResource as string]
    const synergyCosts: CostDisplay[] = [
      { amount: data.cost, emoji: mainRes ? resolveResourceEmoji(data.costResource as string) : '🪙' },
    ]
    if (data.extraCosts) {
      for (const ec of data.extraCosts) {
        synergyCosts.push({ amount: ec.amount, emoji: resolveResourceEmoji(ec.resource as string) })
      }
    }
    return {
      key: uid,
      emoji: ts(data.emoji),
      name: ts(data.name),
      description: ts(data.description),
      costs: synergyCosts,
      badge: CATEGORY_BADGE[category],
      dynamicLabel: computeDynamicLabel(data, allBuildings, totalBuildingCount, totalUpgradeCount),
      affordable: canAffordAll(canAfford, data.costResource, data.cost, data.extraCosts),
      purchased: state.purchased,
      onBuy: () => buyUpgrade(id as UpgradeId),
    }
  }).filter((x): x is UpgradeItem => x !== null)

  // ── Merge all ──
  const allAvailable = [...productItems.filter(i => !i.purchased), ...supplierItems, ...synergyItems.filter(i => !i.purchased)]
  const available = allAvailable
  const purchased = [...productItems.filter(i => i.purchased), ...purchasedSupplierItems, ...synergyItems.filter(i => i.purchased)]

  if (available.length === 0 && purchased.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-amber-800 mb-4">
        {t('sections.upgrades')}
      </h2>

      {available.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {available.map((item) => {
            const borderColor = item.badge?.border ?? 'border-amber-300'
            const hasBadge = !!item.badge
            return (
              <button
                key={item.key}
                onClick={item.onBuy}
                disabled={!item.affordable}
                className={`
                  flex items-start gap-3 p-3 rounded-lg text-left transition-all
                  ${hasBadge ? 'border-2' : 'border'}
                  ${item.affordable
                    ? `${borderColor} ${hasBadge ? 'bg-white hover:bg-amber-50' : 'bg-amber-50 hover:bg-amber-100 hover:border-amber-400'} cursor-pointer`
                    : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  }
                `}
              >
                <span className="text-2xl shrink-0 mt-0.5"><GameEmoji value={item.emoji} /></span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-amber-900 text-sm">{item.name}</h3>
                    {item.badge && (
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${item.badge.bg} ${item.badge.border} ${item.badge.text}`}>
                        {t(item.badge.labelKey)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-600">{item.description}</p>
                  {item.subtitle && (
                    <p className="text-[10px] text-amber-400">{t('synergy_panel.target', { name: item.subtitle })}</p>
                  )}
                  {item.dynamicLabel && (
                    <p className="text-xs text-green-700 font-medium mt-0.5">
                      {t('synergy_panel.currently', { value: item.dynamicLabel })}
                    </p>
                  )}
                  <p className="text-xs text-amber-800 font-medium mt-1 flex items-center gap-2 flex-wrap">
                    {item.costs.map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-0.5">
                        <NumberDisplay value={c.amount} /> <GameEmoji value={c.emoji} />
                      </span>
                    ))}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}

    </div>
  )
}
