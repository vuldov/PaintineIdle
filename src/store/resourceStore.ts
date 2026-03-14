import { create } from 'zustand'
import Decimal from 'decimal.js'
import type { Resource, ResourceId } from '@/types'
import { RESOURCES_DATA } from '@/lib/constants'

// ─── État initial des ressources ─────────────────────────────────

function createInitialResources(): Record<ResourceId, Resource> {
  const resources = {} as Record<ResourceId, Resource>
  for (const [id, data] of Object.entries(RESOURCES_DATA)) {
    const resourceId = id as ResourceId
    resources[resourceId] = {
      id: resourceId,
      amount: new Decimal(0),
      perSecond: new Decimal(0),
      totalEarned: new Decimal(0),
      unlocked: data.initiallyUnlocked,
    }
  }
  return resources
}

// ─── Interface du store ──────────────────────────────────────────

interface ResourceStore {
  resources: Record<ResourceId, Resource>

  /** Produit des croissants manuellement (clic), reçoit la puissance calculée */
  clickCroissant: (power: Decimal) => void

  /** Ajoute des ressources selon la production par seconde × delta */
  addResources: (production: Record<ResourceId, Decimal>, delta: number) => void

  /** Met à jour les perSecond affichées */
  updatePerSecond: (production: Record<ResourceId, Decimal>) => void

  /** Dépense une ressource. Retourne true si succès. */
  spendResource: (resourceId: ResourceId, amount: Decimal) => boolean

  /** Vérifie si le joueur a assez d'une ressource */
  canAfford: (resourceId: ResourceId, amount: Decimal) => boolean

  /** Débloque une ressource */
  unlockResource: (resourceId: ResourceId) => void

  /** Remet les ressources à zéro (prestige) */
  resetResources: () => void
}

// ─── Store ───────────────────────────────────────────────────────

export const useResourceStore = create<ResourceStore>((set, get) => ({
  resources: createInitialResources(),

  clickCroissant: (power) => {
    set((state) => {
      const croissants = state.resources.croissants
      return {
        resources: {
          ...state.resources,
          croissants: {
            ...croissants,
            amount: croissants.amount.add(power),
            totalEarned: croissants.totalEarned.add(power),
          },
        },
      }
    })
  },

  addResources: (production, delta) => {
    set((state) => {
      const updated = { ...state.resources }
      for (const [id, perSecond] of Object.entries(production)) {
        const resourceId = id as ResourceId
        const gained = perSecond.mul(delta)
        if (gained.isZero()) continue

        const resource = updated[resourceId]
        updated[resourceId] = {
          ...resource,
          amount: resource.amount.add(gained),
          totalEarned: resource.totalEarned.add(Decimal.max(gained, 0)),
        }
      }
      return { resources: updated }
    })
  },

  updatePerSecond: (production) => {
    set((state) => {
      const updated = { ...state.resources }
      for (const [id, perSecond] of Object.entries(production)) {
        const resourceId = id as ResourceId
        updated[resourceId] = {
          ...updated[resourceId],
          perSecond,
        }
      }
      return { resources: updated }
    })
  },

  spendResource: (resourceId, amount) => {
    const resource = get().resources[resourceId]
    if (resource.amount.lt(amount)) return false

    set((state) => ({
      resources: {
        ...state.resources,
        [resourceId]: {
          ...state.resources[resourceId],
          amount: state.resources[resourceId].amount.sub(amount),
        },
      },
    }))
    return true
  },

  canAfford: (resourceId, amount) => {
    return get().resources[resourceId].amount.gte(amount)
  },

  unlockResource: (resourceId) => {
    set((state) => ({
      resources: {
        ...state.resources,
        [resourceId]: {
          ...state.resources[resourceId],
          unlocked: true,
        },
      },
    }))
  },

  resetResources: () => {
    set({ resources: createInitialResources() })
  },
}))
