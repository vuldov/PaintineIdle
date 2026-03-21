import Decimal from 'decimal.js'
import { useResourceStore } from '@/store/resourceStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { useCraftingStore } from '@/store/craftingStore'
import { useProduct } from './ProductContext'
import { canStartCrafting, calcSellValue } from '@/mechanics/craftingMechanics'
import { isMilestoneAutoCraftUnlocked } from '@/mechanics/milestoneMechanics'
import { NumberDisplay } from '@/components/ui/NumberDisplay'
import { ALL_RESOURCES } from '@/lib/products/registry'
import type { CraftingRecipeId, Resource } from '@/types'

// ─── Crafting button ────────────────────────────────────────────

function CraftingButton({ recipeId }: { recipeId: CraftingRecipeId }) {
  const { productId, bundle } = useProduct()
  const rid = recipeId as string
  const recipe = bundle.craftingRecipes[rid]

  const globalResources = useResourceStore((state) => state.globalResources)
  const productResources = useResourceStore((state) => state.productResources)
  const activeTask = useCraftingStore((state) => state.activeTasks[productId])
  const startCrafting = useCraftingStore((state) => state.startCrafting)
  const autoCraft = useCraftingStore((state) => state.autoCraft[rid] ?? false)
  const toggleAutoCraft = useCraftingStore((state) => state.toggleAutoCraft)
  const upgrades = useUpgradeStore((state) => state.upgrades)

  if (!recipe) return null

  // Check if auto-craft milestone is unlocked
  const linkedBid = recipe.linkedBuildingId as string | undefined
  const autoUnlocked = linkedBid ? isMilestoneAutoCraftUnlocked(upgrades, linkedBid) : false

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
    <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{recipe.emoji}</span>
        <div>
          <h3 className="font-semibold text-amber-900 text-sm">{recipe.name}</h3>
          <p className="text-xs text-amber-600">
            {recipe.inputs.map((inp, i) => {
              const resData = ALL_RESOURCES[inp.resource as string]
              return (
                <span key={inp.resource as string}>
                  {i > 0 && ' + '}
                  <NumberDisplay value={inp.amount} /> {resData?.emoji}
                </span>
              )
            })}
            {' \u2192 '}
            <NumberDisplay value={recipe.output.amount} /> {ALL_RESOURCES[recipe.output.resource as string]?.emoji}
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
          {isActive ? `${recipe.verb}... ${Math.floor(progress * 100)}%` : recipe.verb}
        </button>

        {/* Auto-craft toggle — visible only when milestone unlocked */}
        {autoUnlocked && (
          <button
            onClick={() => toggleAutoCraft(recipeId)}
            title={autoCraft ? 'Desactiver le crafting automatique' : 'Activer le crafting automatique'}
            className={`
              shrink-0 w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-colors cursor-pointer
              ${autoCraft
                ? 'bg-green-100 border-green-400 text-green-700'
                : 'bg-gray-50 border-gray-300 text-gray-400 hover:border-amber-300 hover:text-amber-600'
              }
            `}
          >
            <span className="text-base">{autoCraft ? '🔄' : '⏸️'}</span>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Sell button ────────────────────────────────────────────────

function SellButton() {
  const { productId, bundle } = useProduct()
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

  const finishedEmoji = ALL_RESOURCES[finishedRid]?.emoji ?? bundle.definition.emoji

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
          <h3 className="font-semibold text-green-900 text-sm">Vendre</h3>
          <p className="text-xs text-green-600">
            Vendez vos {bundle.definition.name.toLowerCase()} pour des Paintines Coins
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
          ? <>Vendre <NumberDisplay value={sellAmount} /> {finishedEmoji} {'\u2192'} <NumberDisplay value={sellValue} /> 🪙</>
          : `Aucun(e) ${bundle.definition.name.toLowerCase()} a vendre`
        }
      </button>
    </div>
  )
}

// ─── Panel ──────────────────────────────────────────────────────

export function CraftingPanel() {
  const { bundle } = useProduct()

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-amber-800">Atelier</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bundle.craftingOrder.map((id) => (
          <CraftingButton key={id as string} recipeId={id} />
        ))}
        <SellButton />
      </div>
    </div>
  )
}
