import { create } from 'zustand'
import Decimal from 'decimal.js'
import type { CraftingRecipeId, CraftingTask, ProductId } from '@/types'
import { ALL_CRAFTING } from '@/lib/products/registry'
import { canStartCrafting, calcCraftingDuration } from '@/mechanics/craftingMechanics'
import { useResourceStore } from '@/store/resourceStore'
import { useUpgradeStore } from '@/store/upgradeStore'

// ─── Interface ───────────────────────────────────────────────────

interface CraftingStore {
  /** Active tasks per product (null if none) */
  activeTasks: Record<ProductId, CraftingTask | null>

  /** Start crafting for a specific product */
  startCrafting: (productId: ProductId, recipeId: CraftingRecipeId) => boolean

  /** Tick all active crafting tasks. Returns list of completed product IDs. */
  tickCrafting: (delta: number) => ProductId[]

  /** Get active task for a product */
  getActiveTask: (productId: ProductId) => CraftingTask | null

  /** Reset crafting tasks to initial state */
  resetCrafting: () => void
}

function createEmptyTasks(): Record<ProductId, CraftingTask | null> {
  return {
    croissants: null,
    pains_au_chocolat: null,
    curry_wurst: null,
    pizzas: null,
  }
}

// ─── Store ───────────────────────────────────────────────────────

export const useCraftingStore = create<CraftingStore>((set, get) => ({
  activeTasks: createEmptyTasks(),

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

    // Calculate effective duration
    const upgrades = useUpgradeStore.getState().upgrades
    const duration = calcCraftingDuration(recipe, upgrades)

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
        // Complete: give output
        const rid = task.recipeId as string
        const recipe = ALL_CRAFTING[rid]
        if (recipe) {
          useResourceStore.getState().addResource(recipe.output.resource, recipe.output.amount)
        }
        updatedTasks[productId as ProductId] = null
        completed.push(productId as ProductId)
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

  resetCrafting: () => {
    set({ activeTasks: createEmptyTasks() })
  },
}))
