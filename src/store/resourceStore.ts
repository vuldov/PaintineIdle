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
      amount: data.initialAmount,
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

  /** Applique un delta (positif ou négatif) à chaque ressource */
  applyDeltas: (deltas: Record<ResourceId, Decimal>) => void

  /** Met à jour les perSecond affichées */
  updatePerSecond: (net: Record<ResourceId, Decimal>) => void

  /** Dépense une ressource. Retourne true si succès. */
  spendResource: (resourceId: ResourceId, amount: Decimal) => boolean

  /** Vérifie si le joueur a assez d'une ressource */
  canAfford: (resourceId: ResourceId, amount: Decimal) => boolean

  /** Ajoute une quantité à une ressource */
  addResource: (resourceId: ResourceId, amount: Decimal) => void

  /** Vend des croissants : retire les croissants et ajoute les pantins_coins */
  sellCroissants: (croissants: Decimal, coins: Decimal) => void

  /** Débloque une ressource */
  unlockResource: (resourceId: ResourceId) => void

  /** Remet les ressources à zéro (prestige) */
  resetResources: () => void
}

// ─── Store ───────────────────────────────────────────────────────

export const useResourceStore = create<ResourceStore>((set, get) => ({
  resources: createInitialResources(),

  applyDeltas: (deltas) => {
    set((state) => {
      const updated = { ...state.resources }
      for (const [id, delta] of Object.entries(deltas)) {
        const resourceId = id as ResourceId
        if (delta.isZero()) continue
        const resource = updated[resourceId]
        const newAmount = Decimal.max(resource.amount.add(delta), 0)
        const gained = delta.gt(0) ? delta : new Decimal(0)
        updated[resourceId] = {
          ...resource,
          amount: newAmount,
          totalEarned: resource.totalEarned.add(gained),
        }
      }
      return { resources: updated }
    })
  },

  updatePerSecond: (net) => {
    set((state) => {
      const updated = { ...state.resources }
      for (const [id, perSecond] of Object.entries(net)) {
        const resourceId = id as ResourceId
        updated[resourceId] = { ...updated[resourceId], perSecond }
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

  addResource: (resourceId, amount) => {
    set((state) => {
      const resource = state.resources[resourceId]
      return {
        resources: {
          ...state.resources,
          [resourceId]: {
            ...resource,
            amount: resource.amount.add(amount),
            totalEarned: resource.totalEarned.add(amount),
          },
        },
      }
    })
  },

  sellCroissants: (croissants, coins) => {
    set((state) => {
      const c = state.resources.croissants
      const p = state.resources.pantins_coins
      return {
        resources: {
          ...state.resources,
          croissants: { ...c, amount: c.amount.sub(croissants) },
          pantins_coins: { ...p, amount: p.amount.add(coins), totalEarned: p.totalEarned.add(coins) },
        },
      }
    })
  },

  unlockResource: (resourceId) => {
    set((state) => ({
      resources: {
        ...state.resources,
        [resourceId]: { ...state.resources[resourceId], unlocked: true },
      },
    }))
  },

  resetResources: () => {
    set({ resources: createInitialResources() })
  },
}))
