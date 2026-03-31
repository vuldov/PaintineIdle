import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'
import { useResourceStore } from '@/store/resourceStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useCraftingStore } from '@/store/craftingStore'
import { useProduct } from './ProductContext'
import { canStartCrafting, calcSellValue } from '@/mechanics/craftingMechanics'
import { NumberDisplay } from '@/components/ui/NumberDisplay'
import { ALL_RESOURCES } from '@/lib/products/registry'
import type { CraftingRecipeId, Resource } from '@/types'
import { MILESTONE_THRESHOLDS } from '@/types'
import { GameEmoji } from '@/components/ui/GameEmoji'

// ─── Crafting button ────────────────────────────────────────────

function CraftingButton({ recipeId }: { recipeId: CraftingRecipeId }) {
  const { productId, bundle } = useProduct()
  const { t: tp } = useTranslation(`products/${productId}`)
  const rid = recipeId as string
  const recipe = bundle.craftingRecipes[rid]

  const globalResources = useResourceStore((state) => state.globalResources)
  const productResources = useResourceStore((state) => state.productResources)
  const activeTask = useCraftingStore((state) => state.activeTasks[productId])
  const startCrafting = useCraftingStore((state) => state.startCrafting)

  // Automation: check if linked building exists and count purchased milestones
  const linkedBid = recipe?.linkedBuildingId as string | undefined
  const buildingCount = useBuildingStore((state) =>
    linkedBid ? state.buildings[productId]?.[linkedBid]?.count ?? 0 : 0
  )
  const upgrades = useUpgradeStore((state) => state.upgrades)

  const isAutomated = buildingCount > 0
  const purchasedMilestones = linkedBid
    ? MILESTONE_THRESHOLDS.filter(t =>
        upgrades[`milestone_${linkedBid}_${t}`]?.purchased
      ).length
    : 0

  // Animation duration: 4s base, speeds up with milestones (down to 0.8s at 10/10)
  const animDuration = isAutomated ? Math.max(4 - purchasedMilestones * 0.32, 0.8) : 0

  if (!recipe) return null

  // Merge resources for canStartCrafting check (inline, not in selector)
  const allResources: Record<string, Resource> = { ...globalResources }
  for (const res of Object.values(productResources)) {
    Object.assign(allResources, res)
  }

  const isActive = activeTask?.recipeId === recipeId
  const isBusy = activeTask !== null
  const hasInputs = canStartCrafting(recipe, allResources)
  const canStart = !isBusy && hasInputs

  const progress = isActive ? activeTask.progress : 0

  return (
    <div className={`relative rounded-xl border p-4 shadow-sm overflow-hidden ${
      isAutomated ? 'border-amber-300 bg-amber-50/40' : 'border-amber-200 bg-white'
    }`}>
      {/* Automation shimmer animation */}
      {isAutomated && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.12) 40%, rgba(251,191,36,0.25) 50%, rgba(251,191,36,0.12) 60%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: `shimmer ${animDuration}s ease-in-out infinite`,
          }}
        />
      )}

      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-2xl ${isAutomated ? 'animate-[spin_3s_linear_infinite]' : ''}`} style={isAutomated ? { animationDuration: `${animDuration * 2}s` } : undefined}>
            <GameEmoji value={tp(recipe.emoji)} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-amber-900 text-sm">{tp(recipe.name)}</h3>
              {isAutomated && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200/60 text-amber-700 font-medium whitespace-nowrap">
                  Auto {purchasedMilestones > 0 && `x${purchasedMilestones}`}
                </span>
              )}
            </div>
            <p className="text-xs text-amber-600">
              {recipe.inputs.map((inp, i) => {
                const resData = ALL_RESOURCES[inp.resource as string]
                return (
                  <span key={inp.resource as string}>
                    {i > 0 && ' + '}
                    <NumberDisplay value={inp.amount} /> {resData ? <GameEmoji value={tp(resData.emoji)} /> : ''}
                  </span>
                )
              })}
              {' \u2192 '}
              <NumberDisplay value={recipe.output.amount} /> {(() => { const r = ALL_RESOURCES[recipe.output.resource as string]; return r ? <GameEmoji value={tp(r.emoji)} /> : '' })()}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-amber-400 rounded-full transition-[width] duration-200"
            style={{ width: `${Math.round(Math.min(progress * 100, 100))}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => startCrafting(productId, recipeId)}
            disabled={!canStart}
            className={`
              flex-1 py-2 rounded-lg text-sm font-medium transition-colors
              ${canStart
                ? 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 cursor-pointer'
                : isActive
                  ? 'bg-amber-300 text-amber-800 cursor-wait'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isActive ? `${tp(recipe.verb)}... ${Math.floor(progress * 100)}%` : tp(recipe.verb)}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Sell button ────────────────────────────────────────────────

function SellButton() {
  const { t } = useTranslation('common')
  const { productId, bundle } = useProduct()
  const { t: tp } = useTranslation(`products/${productId}`)
  const finishedId = bundle.finishedProductId
  const finishedRid = finishedId as string

  const finishedResource = useResourceStore((state) => state.productResources[productId]?.[finishedRid])
  const productAmount = finishedResource?.amount ?? new Decimal(0)
  const sellProduct = useResourceStore((state) => state.sellProduct)
  const upgrades = useUpgradeStore((state) => state.upgrades)

  // Filter upgrades to this product's scope
  const scopedUpgrades = Object.fromEntries(
    Object.entries(upgrades).filter(([, u]) => u.scope === productId || u.scope === 'global')
  )

  const hasProduct = productAmount.gte(1)
  const sellAmount = hasProduct ? productAmount.floor() : new Decimal(0)
  const sellValue = calcSellValue(sellAmount, scopedUpgrades, bundle.baseSellRate)

  const finishedResData = ALL_RESOURCES[finishedRid]
  const finishedEmoji = finishedResData ? tp(finishedResData.emoji) : tp(bundle.definition.emoji)

  const handleSell = () => {
    if (!hasProduct) return
    const currentAmount = useResourceStore.getState().productResources[productId]?.[finishedRid]?.amount
    if (!currentAmount || currentAmount.lt(1)) return
    const current = currentAmount.floor()
    const currentUpgrades = useUpgradeStore.getState().upgrades
    const currentScopedUpgrades = Object.fromEntries(
      Object.entries(currentUpgrades).filter(([, u]) => u.scope === productId || u.scope === 'global')
    )
    const value = calcSellValue(current, currentScopedUpgrades, bundle.baseSellRate)
    sellProduct(finishedId, current, value)
  }

  return (
    <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">💰</span>
        <div>
          <h3 className="font-semibold text-green-900 text-sm">{t('actions.sell')}</h3>
          <p className="text-xs text-green-600">
            {t('sell_panel.sell_for_coins', { product: tp(bundle.definition.name).toLowerCase() })}
          </p>
        </div>
      </div>

      <button
        onClick={handleSell}
        disabled={!hasProduct}
        className={`
          w-full py-2 rounded-lg text-sm font-medium transition-colors
          ${hasProduct
            ? 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {hasProduct
          ? <>Vendre <NumberDisplay value={sellAmount} integer /> <GameEmoji value={finishedEmoji} /> {'\u2192'} <NumberDisplay value={sellValue} integer /> 🪙</>
          : t('sell_panel.no_product', { product: tp(bundle.definition.name).toLowerCase() })
        }
      </button>
    </div>
  )
}

// ─── Panel ──────────────────────────────────────────────────────

export function CraftingPanel() {
  const { t } = useTranslation('common')
  const { bundle } = useProduct()

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-amber-800">{t('sections.workshop')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bundle.craftingOrder.map((id) => (
          <CraftingButton key={id as string} recipeId={id} />
        ))}
        <SellButton />
      </div>
    </div>
  )
}
