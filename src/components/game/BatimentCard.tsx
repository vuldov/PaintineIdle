import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'
import { useBuildingStore, type BuyMode } from '@/store/buildingStore'
import { useResourceStore } from '@/store/resourceStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { useSynergyStore } from '@/store/synergyStore'
import { useProduct } from './ProductContext'
import { ALL_RESOURCES } from '@/lib/products/registry'
import { calcCost, calcBulkCost, calcCostReduction, calcMaxAffordable, calcBuildingRates } from '@/mechanics/productionMechanics'
import { getNextMilestone, getMilestoneProgress } from '@/mechanics/milestoneMechanics'
import { NumberDisplay } from '@/components/ui/NumberDisplay'
import { formatNumber } from '@/lib/formatNumber'
import type { BuildingId, MilestoneData } from '@/types'
import { MILESTONE_THRESHOLDS } from '@/types'
import type { BuildingAura } from '@/types/synergies'
import { GameEmoji } from '@/components/ui/GameEmoji'

// ─── Aura effect type emojis ─────────────────────────────────────

const AURA_EMOJIS: Record<string, string> = {
  production_bonus: '🏭',
  global_production_bonus: '🌍',
  sell_price_bonus: '💰',
  crafting_speed_bonus: '⚡',
  ingredient_generation_bonus: '🌾',
  all_speed_bonus: '🚀',
  cross_product_bonus: '🔗',
}

function AuraBadge({ aura, count }: { aura: BuildingAura; count: number }) {
  const { t } = useTranslation('common')
  const perBuilding = aura.bonusPerBuilding
  const totalBonus = perBuilding.mul(count)
  const emoji = AURA_EMOJIS[aura.effectType] ?? '✨'

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 border border-amber-200/60 text-[11px]">
      <span>{emoji}</span>
      <span className="text-amber-700">
        {t('building_card.aura_per_building', { value: formatNumber(perBuilding.mul(100)) })}
      </span>
      {count > 0 && (
        <span className="text-green-700 font-semibold">
          {t('building_card.aura_total', { value: formatNumber(totalBonus.mul(100)) })}
        </span>
      )}
    </div>
  )
}

// ─── Milestone dots ──────────────────────────────────────────────

function MilestoneDots({ milestones, buildingCount }: { milestones: MilestoneData[]; buildingCount: number }) {
  const { t } = useTranslation('common')
  const { nextThreshold } = getMilestoneProgress(buildingCount)
  const nextMilestone = getNextMilestone(milestones, buildingCount)

  return (
    <div className="mt-1 mb-2">
      <div className="flex items-center gap-1">
        {MILESTONE_THRESHOLDS.map((threshold) => {
          const isAchieved = buildingCount >= threshold
          const milestone = milestones.find(m => m.threshold === threshold)
          const dotClasses = isAchieved
            ? 'bg-amber-400 border-amber-500 shadow-sm shadow-amber-300/50'
            : 'bg-gray-200 border-gray-300'

          return (
            <div key={threshold} className="group relative">
              <div
                className={`w-2.5 h-2.5 rounded-full border transition-colors ${dotClasses}`}
              />
              {milestone && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 pointer-events-none">
                  <div className="bg-gray-900 text-white text-[10px] rounded-md px-2 py-1.5 whitespace-nowrap shadow-lg">
                    <div className="font-semibold">{milestone.name}</div>
                    <div className="text-gray-300">{milestone.description}</div>
                    {isAchieved && <div className="text-green-400 mt-0.5">{t('status.achieved')}</div>}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {nextMilestone && nextThreshold !== null && (
        <p className="text-[10px] text-amber-600 mt-1">
          {t('building_card.next_milestone', { threshold: nextThreshold, effect: nextMilestone.description.split(' : ').slice(1).join(' : ') })}
        </p>
      )}
    </div>
  )
}

// ─── Buy mode selector (shared across all cards) ─────────────────

const BUY_MODE_KEYS: BuyMode[] = ['1', '10', 'next', 'max']

export function BuyModeSelector() {
  const { t } = useTranslation('common')
  const buyMode = useBuildingStore((s) => s.buyMode)
  const setBuyMode = useBuildingStore((s) => s.setBuyMode)

  return (
    <div className="flex gap-1 bg-amber-50 rounded-lg p-0.5 border border-amber-200">
      {BUY_MODE_KEYS.map((value) => (
        <button
          key={value}
          onClick={() => setBuyMode(value)}
          className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            buyMode === value
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-amber-700 hover:bg-amber-100'
          }`}
        >
          {t(`buy_modes.${value}`)}
        </button>
      ))}
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────

interface BatimentCardProps {
  buildingId: BuildingId
}

export function BatimentCard({ buildingId }: BatimentCardProps) {
  const { t } = useTranslation('common')
  const { productId, bundle } = useProduct()
  const { t: tp } = useTranslation(`products/${productId}`)
  const bid = buildingId as string

  const building = useBuildingStore((state) => state.buildings[productId]?.[bid])
  const buyBuilding = useBuildingStore((state) => state.buyBuilding)
  const sellBuilding = useBuildingStore((state) => state.sellBuilding)
  const buyMode = useBuildingStore((state) => state.buyMode)
  const upgrades = useUpgradeStore((state) => state.upgrades)

  // Filter upgrades to this product's scope
  const scopedUpgrades = Object.fromEntries(
    Object.entries(upgrades).filter(([, u]) => u.scope === productId || u.scope === 'global')
  )
  const costReduction = calcCostReduction(scopedUpgrades)

  // Compute buy amount and cost based on mode
  const budget = useResourceStore((state) =>
    building ? state.getResource(building.costResource)?.amount ?? new Decimal(0) : new Decimal(0)
  )

  let buyAmount = 0
  if (building) {
    switch (buyMode) {
      case '1': buyAmount = 1; break
      case '10': buyAmount = 10; break
      case 'next': {
        const next = MILESTONE_THRESHOLDS.find(t => t > building.count)
        buyAmount = next ? next - building.count : 1
        break
      }
      case 'max':
        buyAmount = calcMaxAffordable(building, building.count, budget, costReduction)
        break
    }
  }

  const cost = building && buyAmount > 0
    ? (buyAmount === 1
      ? calcCost(building, building.count, costReduction)
      : calcBulkCost(building, building.count, buyAmount, costReduction))
    : undefined

  const canAfford = cost ? budget.gte(cost) : false

  // Synergy bonuses for accurate display (must be before early return)
  const synergyBonuses = useSynergyStore((state) => state.bonuses)

  const data = bundle.buildings[bid]

  if (!building || !data || !building.unlocked) return null

  const buildingMilestones = (bundle.milestones ?? []).filter(
    m => (m.buildingId as string) === bid,
  )

  const synergyProductionMult = (synergyBonuses.globalProductionMultiplier ?? new Decimal(1))
    .mul(synergyBonuses.productionMultipliers[productId] ?? new Decimal(1))
  const synergySellMult = (synergyBonuses.sellMultipliers[productId] ?? new Decimal(1))
    .mul(synergyBonuses.globalSellMultiplier ?? new Decimal(1))

  const costResData = ALL_RESOURCES[building.costResource as string]
  const costEmoji = costResData ? tp(costResData.emoji) : '🪙'
  const { produces, consumes } = calcBuildingRates(
    data,
    bundle.pipelineConfig.stages,
    building.baseProduction,
    scopedUpgrades,
    bundle.baseSellRate,
    synergyProductionMult,
    synergySellMult,
  )

  const buyLabel = buyMode === 'max'
    ? (buyAmount > 0 ? `×${buyAmount}` : 'Max')
    : buyMode === 'next'
      ? `×${buyAmount}`
      : ''

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label={tp(data.name)}>
            <GameEmoji value={tp(data.emoji)} />
          </span>
          <div>
            <h3 className="font-semibold text-amber-900 text-sm">{tp(data.name)}</h3>
            <p className="text-xs text-amber-600">{tp(data.description)}</p>
          </div>
        </div>
        <span className="text-lg font-bold text-amber-800 bg-amber-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
          {building.count}
        </span>
      </div>

      {/* Production & consumption (total for all owned buildings) */}
      <div className="text-xs space-y-0.5 mt-2 mb-2">
        {produces.map((p) => {
          const resData = ALL_RESOURCES[p.resource as string]
          const total = p.amount.mul(building.count)
          return (
            <span key={`p-${p.resource as string}`} className="flex items-center gap-1 text-green-700">
              <span>+<NumberDisplay value={total} />/s</span>
              <span>{resData ? <GameEmoji value={tp(resData.emoji)} /> : ''} {resData ? tp(resData.name) : ''}</span>
            </span>
          )
        })}
        {consumes.map((c) => {
          const resData = ALL_RESOURCES[c.resource as string]
          const total = c.amount.mul(building.count)
          return (
            <span key={`c-${c.resource as string}`} className="flex items-center gap-1 text-red-500">
              <span>-<NumberDisplay value={total} />/s</span>
              <span>{resData ? <GameEmoji value={tp(resData.emoji)} /> : ''} {resData ? tp(resData.name) : ''}</span>
            </span>
          )
        })}
      </div>

      {/* Aura indicator */}
      {data.aura && (
        <div className="mb-2">
          <AuraBadge aura={data.aura} count={building.count} />
        </div>
      )}

      {/* Milestone dots */}
      {buildingMilestones.length > 0 && (
        <MilestoneDots milestones={buildingMilestones} buildingCount={building.count} />
      )}

      {/* Buy / Sell buttons */}
      <div className="flex items-center justify-between gap-2">
        {building.count > 0 && (
          <button
            onClick={() => sellBuilding(buildingId)}
            className="px-2 py-1.5 rounded-lg text-xs font-medium transition-colors
              text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer"
            title={t('building_card.sell_tooltip')}
          >
            {t('actions.sell')}
          </button>
        )}
        <button
          onClick={() => buyBuilding(buildingId)}
          disabled={!canAfford || buyAmount <= 0}
          className={`
            ml-auto px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            ${canAfford && buyAmount > 0
              ? 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {buyLabel && <span className="mr-1 text-amber-200 text-xs">{buyLabel}</span>}
          {cost ? <NumberDisplay value={cost} integer /> : '—'} <GameEmoji value={costEmoji} />
        </button>
      </div>
    </div>
  )
}
