import Decimal from 'decimal.js'
import { useResourceStore } from '@/store/resourceStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { useCraftingStore } from '@/store/craftingStore'
import { canStartCrafting, calcSellValue } from '@/mechanics/craftingMechanics'
import { NumberDisplay } from '@/components/ui/NumberDisplay'
import { CRAFTING_RECIPES, CRAFTING_ORDER } from '@/lib/crafting'
import { RESOURCES_DATA } from '@/lib/resources'
import type { CraftingRecipeId } from '@/types'

// ─── Bouton de fabrication ───────────────────────────────────────

function CraftingButton({ recipeId }: { recipeId: CraftingRecipeId }) {
  const recipe = CRAFTING_RECIPES[recipeId]
  const resources = useResourceStore((state) => state.resources)
  const activeTask = useCraftingStore((state) => state.activeTask)
  const startCrafting = useCraftingStore((state) => state.startCrafting)

  const isActive = activeTask?.recipeId === recipeId
  const isBusy = activeTask !== null
  const hasInputs = canStartCrafting(recipeId, resources)
  const canStart = !isBusy && hasInputs

  const progress = isActive ? activeTask.progress : 0

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{recipe.emoji}</span>
        <div>
          <h3 className="font-semibold text-amber-900 text-sm">{recipe.name}</h3>
          <p className="text-xs text-amber-600">
            {recipe.inputs.map((inp, i) => (
              <span key={inp.resource}>
                {i > 0 && ' + '}
                <NumberDisplay value={inp.amount} /> {RESOURCES_DATA[inp.resource].emoji}
              </span>
            ))}
            {' → '}
            <NumberDisplay value={recipe.output.amount} /> {RESOURCES_DATA[recipe.output.resource].emoji}
          </p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-amber-400 rounded-full"
          style={{ width: `${Math.round(Math.min(progress * 100, 100))}%` }}
        />
      </div>

      <button
        onClick={() => startCrafting(recipeId)}
        disabled={!canStart}
        className={`
          w-full py-2 rounded-lg text-sm font-medium transition-colors
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
    </div>
  )
}

// ─── Bouton de vente ─────────────────────────────────────────────

function SellButton() {
  const croissants = useResourceStore((state) => state.resources.croissants.amount)
  const sellCroissants = useResourceStore((state) => state.sellCroissants)
  const upgrades = useUpgradeStore((state) => state.upgrades)

  const hasCroissants = croissants.gte(1)
  const sellAmount = hasCroissants ? croissants.floor() : new Decimal(0)
  const sellValue = calcSellValue(sellAmount, upgrades, new Decimal(1))

  const handleSell = () => {
    if (!hasCroissants) return
    const current = useResourceStore.getState().resources.croissants.amount.floor()
    if (current.lt(1)) return
    const value = calcSellValue(current, useUpgradeStore.getState().upgrades, new Decimal(1))
    sellCroissants(current, value)
  }

  return (
    <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">💰</span>
        <div>
          <h3 className="font-semibold text-green-900 text-sm">Vendre</h3>
          <p className="text-xs text-green-600">
            Vendez vos croissants pour des Paintines Coins
          </p>
        </div>
      </div>

      <button
        onClick={handleSell}
        disabled={!hasCroissants}
        className={`
          w-full py-2 rounded-lg text-sm font-medium transition-colors
          ${hasCroissants
            ? 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {hasCroissants
          ? <>Vendre <NumberDisplay value={sellAmount} /> 🥐 → <NumberDisplay value={sellValue} /> 🪙</>
          : 'Aucun croissant à vendre'
        }
      </button>
    </div>
  )
}

// ─── Panel complet ───────────────────────────────────────────────

export function CraftingPanel() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-amber-800">Atelier</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CRAFTING_ORDER.map((id) => (
          <CraftingButton key={id} recipeId={id} />
        ))}
        <SellButton />
      </div>
    </div>
  )
}
