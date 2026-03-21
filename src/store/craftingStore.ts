import { create } from 'zustand'
import Decimal from 'decimal.js'
import type { CraftingRecipeId, CraftingTask, ProductId } from '@/types'
import { ALL_CRAFTING } from '@/lib/products/registry'
import { canStartCrafting, calcCraftingDuration } from '@/mechanics/craftingMechanics'
import { calcMilestoneCraftingRatioBonus, calcMilestoneCraftingDurationMultiplier, isMilestoneAutoCraftUnlocked } from '@/mechanics/milestoneMechanics'
import { useResourceStore } from '@/store/resourceStore'
import { useUpgradeStore } from '@/store/upgradeStore'

// ─── Interface ───────────────────────────────────────────────────

interface CraftingStore {
  /** Active tasks per product (null if none) */
  activeTasks: Record<ProductId, CraftingTask | null>

  /** Auto-craft enabled per recipe */
  autoCraft: Record<string, boolean>

  /** Start crafting for a specific product */
  startCrafting: (productId: ProductId, recipeId: CraftingRecipeId) => boolean

  /** Tick all active crafting tasks. Returns list of completed product IDs. */
  tickCrafting: (delta: number) => ProductId[]

  /** Get active task for a product */
  getActiveTask: (productId: ProductId) => CraftingTask | null

  /** Toggle auto-craft for a recipe */
  toggleAutoCraft: (recipeId: CraftingRecipeId) => void

  /** Reset crafting tasks to initial state */
  resetCrafting: () => void
}

function createEmptyTasks(): Record<ProductId, CraftingTask | null> {
  return {
    croissants: null,
    pains_au_chocolat: null,
    chocolatines: null,
    pizzas: null,
  }
}

/**
 * Get the milestone-adjusted duration and ratio for a recipe.
 * Now checks purchased upgrades instead of raw building counts.
 */
function getMilestoneCraftingModifiers(recipeId: string): { durationMult: Decimal; ratioBonus: Decimal; autoCraftUnlocked: boolean } {
  const recipe = ALL_CRAFTING[recipeId]
  if (!recipe || !recipe.linkedBuildingId) {
    return { durationMult: new Decimal(1), ratioBonus: new Decimal(1), autoCraftUnlocked: false }
  }

  const bid = recipe.linkedBuildingId as string
  const upgrades = useUpgradeStore.getState().upgrades

  return {
    durationMult: calcMilestoneCraftingDurationMultiplier(upgrades, bid),
    ratioBonus: calcMilestoneCraftingRatioBonus(upgrades, bid),
    autoCraftUnlocked: isMilestoneAutoCraftUnlocked(upgrades, bid),
  }
}

// ─── Store ───────────────────────────────────────────────────────

export const useCraftingStore = create<CraftingStore>((set, get) => ({
  activeTasks: createEmptyTasks(),
  autoCraft: {},

  startCrafting: (productId, recipeId) => {
    const currentTask = get().activeTasks[productId]
    if (currentTask !== null) return false

    const rid = recipeId as string
    const recipe = ALL_CRAFTING[rid]
    if (!recipe) return false

    // Check resources
    const allResources = useResourceStore.getState().getAllResources()
    if (!canStartCrafting(recipe, allResources)) return false

    // Deduct inputs
    const resourceStore = useResourceStore.getState()
    for (const input of recipe.inputs) {
      resourceStore.spendResource(input.resource, input.amount)
    }

    // Calculate effective duration (upgrades + milestone duration reduction)
    const upgrades = useUpgradeStore.getState().upgrades
    const baseDuration = calcCraftingDuration(recipe, upgrades)
    const { durationMult } = getMilestoneCraftingModifiers(rid)
    const duration = new Decimal(baseDuration).mul(durationMult).toNumber()

    set((state) => ({
      activeTasks: {
        ...state.activeTasks,
        [productId]: {
          recipeId,
          progress: 0,
          totalSeconds: Math.max(duration, 0.1),
        },
      },
    }))

    return true
  },

  tickCrafting: (delta) => {
    const tasks = get().activeTasks
    const completed: ProductId[] = []
    const updatedTasks = { ...tasks }

    for (const [productId, task] of Object.entries(tasks)) {
      if (!task) continue

      const newProgress = task.progress + delta / task.totalSeconds

      if (newProgress >= 1) {
        // Complete: give output with milestone ratio bonus
        const rid = task.recipeId as string
        const recipe = ALL_CRAFTING[rid]
        if (recipe) {
          const { ratioBonus } = getMilestoneCraftingModifiers(rid)
          const adjustedAmount = recipe.output.amount.mul(ratioBonus)
          useResourceStore.getState().addResource(recipe.output.resource, adjustedAmount)
        }
        updatedTasks[productId as ProductId] = null
        completed.push(productId as ProductId)

        // Auto-craft: if enabled and milestone unlocked, try to restart
        const autoCraftEnabled = get().autoCraft[rid]
        if (autoCraftEnabled && recipe) {
          const { autoCraftUnlocked } = getMilestoneCraftingModifiers(rid)
          if (autoCraftUnlocked) {
            const allResources = useResourceStore.getState().getAllResources()
            if (canStartCrafting(recipe, allResources)) {
              const resourceStore = useResourceStore.getState()
              for (const input of recipe.inputs) {
                resourceStore.spendResource(input.resource, input.amount)
              }
              const upgrades = useUpgradeStore.getState().upgrades
              const baseDuration = calcCraftingDuration(recipe, upgrades)
              const { durationMult } = getMilestoneCraftingModifiers(rid)
              const duration = new Decimal(baseDuration).mul(durationMult).toNumber()
              updatedTasks[productId as ProductId] = {
                recipeId: task.recipeId,
                progress: 0,
                totalSeconds: Math.max(duration, 0.1),
              }
            }
          }
        }
      } else {
        updatedTasks[productId as ProductId] = {
          ...task,
          progress: newProgress,
        }
      }
    }

    set({ activeTasks: updatedTasks })
    return completed
  },

  getActiveTask: (productId) => {
    return get().activeTasks[productId]
  },

  toggleAutoCraft: (recipeId) => {
    const rid = recipeId as string
    set((state) => ({
      autoCraft: {
        ...state.autoCraft,
        [rid]: !state.autoCraft[rid],
      },
    }))
  },

  resetCrafting: () => {
    set({ activeTasks: createEmptyTasks(), autoCraft: {} })
  },
}))
