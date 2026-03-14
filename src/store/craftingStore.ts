import { create } from 'zustand'
import type { CraftingRecipeId, CraftingTask } from '@/types'
import { CRAFTING_RECIPES } from '@/lib/constants'
import { canStartCrafting, calcCraftingDuration } from '@/mechanics/craftingMechanics'
import { useResourceStore } from '@/store/resourceStore'
import { useUpgradeStore } from '@/store/upgradeStore'

// ─── Interface ───────────────────────────────────────────────────

interface CraftingStore {
  /** Tâche en cours (null si rien) */
  activeTask: CraftingTask | null

  /** Lance une fabrication manuelle. Déduit les inputs immédiatement. */
  startCrafting: (recipeId: CraftingRecipeId) => boolean

  /** Appelé par le game loop : avance la barre de progression.
   *  Retourne true si la tâche vient de se terminer (output donné). */
  tickCrafting: (delta: number) => boolean

  /** Reset (prestige) */
  resetCrafting: () => void
}

// ─── Store ───────────────────────────────────────────────────────

export const useCraftingStore = create<CraftingStore>((set, get) => ({
  activeTask: null,

  startCrafting: (recipeId) => {
    // Déjà en train de crafter ?
    if (get().activeTask !== null) return false

    const resources = useResourceStore.getState().resources
    if (!canStartCrafting(recipeId, resources)) return false

    // Déduire les inputs
    const recipe = CRAFTING_RECIPES[recipeId]
    const resourceStore = useResourceStore.getState()
    for (const input of recipe.inputs) {
      resourceStore.spendResource(input.resource, input.amount)
    }

    // Calculer la durée effective
    const upgrades = useUpgradeStore.getState().upgrades
    const duration = calcCraftingDuration(recipe, upgrades)

    set({
      activeTask: {
        recipeId,
        progress: 0,
        totalSeconds: duration,
      },
    })

    return true
  },

  tickCrafting: (delta) => {
    const task = get().activeTask
    if (!task) return false

    const newProgress = task.progress + delta / task.totalSeconds

    if (newProgress >= 1) {
      // Terminé ! Donner l'output
      const recipe = CRAFTING_RECIPES[task.recipeId]
      useResourceStore.getState().addResource(recipe.output.resource, recipe.output.amount)

      set({ activeTask: null })
      return true
    }

    set({
      activeTask: {
        ...task,
        progress: newProgress,
      },
    })
    return false
  },

  resetCrafting: () => {
    set({ activeTask: null })
  },
}))
