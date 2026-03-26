import { useState, useMemo } from 'react'
import type Decimal from 'decimal.js'
import { useSynergyStore } from '@/store/synergyStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { useSupplierStore } from '@/store/supplierStore'
import type { Building } from '@/types'
import { COMBO_DEFINITIONS } from '@/lib/synergies/combos'
import { SYNERGY_UPGRADES, SYNERGY_UPGRADE_ORDER } from '@/lib/synergies/synergyUpgrades'
import { ALL_BUILDINGS as ALL_BUILDING_DATA, PRODUCT_REGISTRY, ALL_SUPPLIER_UPGRADES } from '@/lib/products/registry'
import { formatNumber } from '@/lib/formatNumber'
import type { ProductId } from '@/types'
import type { AuraEffectType } from '@/types/synergies'

// ─── Constants ──────────────────────────────────────────────────

const PRODUCT_EMOJIS: Record<ProductId, string> = {
  croissants: '🥐',
  pains_au_chocolat: '🍫',
  curry_wurst: '🌭',
  pizzas: '🍕',
}

const PRODUCT_NAMES: Record<ProductId, string> = {
  croissants: 'Croissants',
  pains_au_chocolat: 'Pains au chocolat',
  curry_wurst: 'Curry Wurst végé',
  pizzas: 'Pizzas',
}

const AURA_CATEGORIES: Array<{ label: string; emoji: string; types: AuraEffectType[] }> = [
  { label: 'Production', emoji: '🏭', types: ['production_bonus', 'global_production_bonus'] },
  { label: 'Vente', emoji: '💰', types: ['sell_price_bonus'] },
  { label: 'Vitesse', emoji: '⚡', types: ['crafting_speed_bonus', 'all_speed_bonus'] },
  { label: 'Ingredients', emoji: '🌾', types: ['ingredient_generation_bonus'] },
  { label: 'Cross-produit', emoji: '🔗', types: ['cross_product_bonus'] },
]

const CATEGORY_COLORS: Record<string, { badge: string; border: string }> = {
  specialization: { badge: 'bg-amber-100 text-amber-800', border: 'border-amber-300' },
  synergy: { badge: 'bg-purple-100 text-purple-800', border: 'border-purple-300' },
  scaling: { badge: 'bg-blue-100 text-blue-800', border: 'border-blue-300' },
}

const CATEGORY_LABELS: Record<string, string> = {
  specialization: 'Specialisation',
  synergy: 'Synergie',
  scaling: 'Escalade',
}

// ─── Collapsible section (light theme) ──────────────────────────

function Section({
  title,
  emoji,
  badge,
  defaultOpen = true,
  children,
}: {
  title: string
  emoji: string
  badge?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-amber-50/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{emoji}</span>
          <span className="font-semibold text-amber-900">{title}</span>
          {badge && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {badge}
            </span>
          )}
        </div>
        <span className="text-amber-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Global bonus summary (top cards) ───────────────────────────

function BonusSummary() {
  const bonuses = useSynergyStore((s) => s.bonuses)
  const globalProd = bonuses.globalProductionMultiplier
  const globalSell = bonuses.globalSellMultiplier

  // Collect all active bonuses into simple items
  const items: Array<{ emoji: string; label: string; value: Decimal }> = []

  if (globalProd.gt(1)) items.push({ emoji: '🏭', label: 'Prod. globale', value: globalProd })
  if (globalSell.gt(1)) items.push({ emoji: '💰', label: 'Vente globale', value: globalSell })

  for (const [pid, v] of Object.entries(bonuses.productionMultipliers)) {
    if (v.gt(1)) {
      const emoji = PRODUCT_EMOJIS[pid as ProductId] ?? '📦'
      items.push({ emoji, label: `Prod. ${PRODUCT_NAMES[pid as ProductId] ?? pid}`, value: v })
    }
  }
  for (const [pid, v] of Object.entries(bonuses.sellMultipliers)) {
    if (v.gt(1)) {
      const emoji = PRODUCT_EMOJIS[pid as ProductId] ?? '📦'
      items.push({ emoji, label: `Vente ${PRODUCT_NAMES[pid as ProductId] ?? pid}`, value: v })
    }
  }
  for (const [key, v] of Object.entries(bonuses.craftingSpeedMultipliers)) {
    if (v.gt(1)) {
      items.push({ emoji: '⚡', label: key === '_global' ? 'Vitesse globale' : `Vitesse ${key}`, value: v })
    }
  }
  for (const [key, v] of Object.entries(bonuses.ingredientMultipliers)) {
    if (v.gt(1)) {
      items.push({ emoji: '🌾', label: key === '_global' ? 'Ingr. global' : `Ingr. ${key}`, value: v })
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-6 text-center">
        <p className="text-amber-600 text-sm">
          Aucun bonus de synergie actif pour le moment.
        </p>
        <p className="text-amber-400 text-xs mt-1">
          Achetez des batiments pour activer vos premieres auras !
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-white rounded-lg border border-amber-200 px-3 py-2 shadow-sm"
        >
          <span className="text-lg">{item.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-amber-600 truncate">{item.label}</p>
            <p className="text-sm font-bold text-green-700">
              x{formatNumber(item.value)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Combo section ──────────────────────────────────────────────

function ComboSection() {
  const activeCombos = useSynergyStore((s) => s.bonuses.activeCombos)
  const activeIds = new Set(activeCombos.map(c => c.id))

  return (
    <Section
      title="Combo Boulangerie"
      emoji="🤝"
      badge={`${activeCombos.length}/${COMBO_DEFINITIONS.length}`}
    >
      <div className="space-y-2">
        {COMBO_DEFINITIONS.map((combo) => {
          const isActive = activeIds.has(combo.id)
          return (
            <div
              key={combo.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all
                ${isActive
                  ? 'border-green-300 bg-green-50 shadow-sm'
                  : 'border-gray-200 bg-gray-50 opacity-60'
                }
              `}
            >
              {/* Product icons */}
              <div className="flex items-center gap-0.5 shrink-0">
                {combo.requiredProducts.map((pid) => (
                  <span key={pid} className="text-lg" title={PRODUCT_NAMES[pid]}>
                    {PRODUCT_EMOJIS[pid]}
                  </span>
                ))}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-amber-900">{combo.name}</span>
                  {isActive ? (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                      Actif
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      Verrouille
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-600 mt-0.5">{combo.description}</p>
              </div>

              {/* Bonus */}
              <div className="shrink-0 text-right">
                <span className={`text-sm font-bold ${isActive ? 'text-green-700' : 'text-gray-400'}`}>
                  +{formatNumber(combo.bonusMultiplier.mul(100))}%
                </span>
                <p className="text-[10px] text-amber-500">
                  {combo.bonusType === 'sell' ? 'vente' : combo.bonusType === 'production' ? 'prod.' : 'global'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

// ─── Aura section ───────────────────────────────────────────────

function AuraSection() {
  const buildingsByProduct = useBuildingStore((s) => s.buildings)
  const allBuildings = useMemo(() => {
    const all: Record<string, Building> = {}
    for (const productBuildings of Object.values(buildingsByProduct)) {
      Object.assign(all, productBuildings)
    }
    return all
  }, [buildingsByProduct])

  // Group active auras by category
  const aurasByCategory: Record<string, Array<{
    buildingName: string
    buildingEmoji: string
    count: number
    totalBonus: Decimal
    description: string
  }>> = {}

  for (const category of AURA_CATEGORIES) {
    aurasByCategory[category.label] = []
  }

  for (const [bid, building] of Object.entries(allBuildings)) {
    if (building.count <= 0) continue
    const data = ALL_BUILDING_DATA[bid]
    if (!data?.aura) continue

    const aura = data.aura
    const totalBonus = aura.bonusPerBuilding.mul(building.count)

    for (const category of AURA_CATEGORIES) {
      if (category.types.includes(aura.effectType)) {
        aurasByCategory[category.label].push({
          buildingName: data.name,
          buildingEmoji: data.emoji,
          count: building.count,
          totalBonus,
          description: aura.description,
        })
        break
      }
    }
  }

  const totalActiveAuras = Object.values(aurasByCategory).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <Section
      title="Auras des batiments"
      emoji="✨"
      badge={`${totalActiveAuras} actives`}
      defaultOpen={totalActiveAuras > 0}
    >
      {totalActiveAuras === 0 ? (
        <p className="text-sm text-amber-500 italic">
          Achetez des batiments pour activer les auras.
        </p>
      ) : (
        <div className="space-y-4">
          {AURA_CATEGORIES.map((category) => {
            const auras = aurasByCategory[category.label]
            if (auras.length === 0) return null

            return (
              <div key={category.label}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span>{category.emoji}</span>
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                    {category.label}
                  </span>
                </div>
                <div className="space-y-1">
                  {auras.map((aura, i) => (
                    <div
                      key={`${category.label}-${i}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 text-sm"
                    >
                      <span className="text-base">{aura.buildingEmoji}</span>
                      <span className="text-amber-900 font-medium">{aura.buildingName}</span>
                      <span className="text-amber-400 text-xs">(x{aura.count})</span>
                      <span className="text-amber-300 mx-0.5">→</span>
                      <span className="text-green-700 font-semibold">
                        +{formatNumber(aura.totalBonus.mul(100))}%
                      </span>
                      <span className="text-amber-500 text-xs hidden sm:inline truncate ml-auto">
                        {aura.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}

// ─── Upgrade synergy section ────────────────────────────────────

function UpgradeSynergySection() {
  const upgrades = useUpgradeStore((s) => s.upgrades)
  const buildingsByProduct = useBuildingStore((s) => s.buildings)
  const allBuildings = useMemo(() => {
    const all: Record<string, Building> = {}
    for (const productBuildings of Object.values(buildingsByProduct)) {
      Object.assign(all, productBuildings)
    }
    return all
  }, [buildingsByProduct])
  const totalBuildingCount = useSynergyStore((s) => s.totalBuildingCount)
  const totalUpgradeCount = useSynergyStore((s) => s.totalUpgradeCount)

  const purchasedSynergy = SYNERGY_UPGRADE_ORDER.filter((uid) => {
    const u = upgrades[uid as string]
    return u?.purchased
  })

  if (purchasedSynergy.length === 0) {
    return (
      <Section title="Ameliorations de synergie" emoji="🔧" defaultOpen={false}>
        <p className="text-sm text-amber-500 italic">
          Aucune amelioration de synergie achetee.
        </p>
      </Section>
    )
  }

  return (
    <Section title="Ameliorations de synergie" emoji="🔧" badge={`${purchasedSynergy.length}`}>
      <div className="space-y-2">
        {purchasedSynergy.map((uid) => {
          const uidStr = uid as string
          const data = SYNERGY_UPGRADES[uidStr]
          if (!data) return null

          const cat = data.category ?? 'synergy'
          const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.synergy
          const effect = data.effect

          // Compute dynamic text
          let dynamicText: string | null = null

          if (effect.type === 'specialization' && effect.scalingBonus) {
            const sb = effect.scalingBonus
            let count = 0
            if (sb.scalingBuildingId) {
              count = allBuildings[sb.scalingBuildingId as string]?.count ?? 0
            }
            const divisor = sb.scalingDivisor ?? 1
            const scaledCount = Math.floor(count / divisor)
            const bonus = sb.bonusPerUnit.mul(scaledCount)
            dynamicText = bonus.gt(0)
              ? `+${formatNumber(bonus.mul(100))}% ${sb.bonusType} (${scaledCount} tranches)`
              : `${count}/${divisor} pour 1 tranche`
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
              dynamicText = `+${formatNumber(bonus.mul(100))}% (${sourceCount} source)`
            }
          }

          return (
            <div
              key={uidStr}
              className={`flex items-center gap-3 p-3 rounded-lg border bg-white ${colors.border}`}
            >
              <span className="text-xl shrink-0">{data.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-amber-900">{data.name}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${colors.badge}`}>
                    {CATEGORY_LABELS[cat]}
                  </span>
                </div>
                <p className="text-xs text-amber-600 mt-0.5">{data.description}</p>
                {dynamicText && (
                  <p className="text-xs text-green-700 mt-1 font-medium">{dynamicText}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

// ─── Purchased upgrades section ──────────────────────────────────

function PurchasedUpgradesSection() {
  const upgrades = useUpgradeStore((s) => s.upgrades)
  const supplierUpgrades = useSupplierStore((s) => s.supplierUpgrades)

  const purchased: Array<{ key: string; emoji: string; name: string; category: string }> = []

  // Product upgrades (non-synergy)
  for (const [productId, bundle] of Object.entries(PRODUCT_REGISTRY)) {
    const productEmoji = PRODUCT_EMOJIS[productId as ProductId] ?? '🥐'
    // Regular upgrades
    for (const uid of bundle.upgradeOrder) {
      const u = upgrades[uid as string]
      const data = bundle.upgrades[uid as string]
      if (u?.purchased && data) {
        purchased.push({ key: uid as string, emoji: data.emoji ?? productEmoji, name: data.name, category: 'Produit' })
      }
    }
    // Milestone upgrades
    for (const m of bundle.milestones ?? []) {
      const u = upgrades[m.id]
      if (u?.purchased) {
        purchased.push({ key: m.id, emoji: '🏆', name: m.name, category: 'Palier' })
      }
    }
  }

  // Supplier upgrades
  for (const [uid, state] of Object.entries(supplierUpgrades)) {
    if (!state.purchased) continue
    const data = ALL_SUPPLIER_UPGRADES[uid]
    if (data) {
      purchased.push({ key: uid, emoji: '🚚', name: data.name, category: 'Fournisseur' })
    }
  }

  if (purchased.length === 0) return null

  return (
    <Section title="Ameliorations achetees" emoji="🛒" badge={`${purchased.length}`} defaultOpen={false}>
      <div className="flex flex-wrap gap-1.5">
        {purchased.map((item) => (
          <span
            key={item.key}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-amber-50 text-amber-700 border border-amber-200"
          >
            {item.emoji} {item.name}
          </span>
        ))}
      </div>
    </Section>
  )
}

// ─── Main SynergyPanel ──────────────────────────────────────────

export function SynergyPanel() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-amber-900">
          ✨ Synergies & Bonus
        </h2>
        <p className="text-sm text-amber-600 mt-1">
          Bonus automatiques de vos batiments, combos et ameliorations
        </p>
      </div>

      {/* Summary cards */}
      <BonusSummary />

      {/* Sections */}
      <ComboSection />
      <AuraSection />
      <UpgradeSynergySection />
      <PurchasedUpgradesSection />
    </div>
  )
}
