import { create } from 'zustand'
import Decimal from 'decimal.js'
import type { Resource, ResourceId, ProductId } from '@/types'
import { SHARED_RESOURCES } from '@/lib/products/shared'
import { PRODUCT_REGISTRY, getResourceScope } from '@/lib/products/registry'

// ─── Initial state builders ─────────────────────────────────────

function createGlobalResources(): Record<string, Resource> {
  const resources: Record<string, Resource> = {}
  for (const [id, data] of Object.entries(SHARED_RESOURCES)) {
    resources[id] = {
      id: data.id,
      amount: data.initialAmount,
      perSecond: new Decimal(0),
      totalEarned: new Decimal(0),
      unlocked: data.initiallyUnlocked,
    }
  }
  return resources
}

function createProductResources(): Record<ProductId, Record<string, Resource>> {
  const result = {} as Record<ProductId, Record<string, Resource>>
  for (const [productId, bundle] of Object.entries(PRODUCT_REGISTRY)) {
    const resources: Record<string, Resource> = {}
    for (const [id, data] of Object.entries(bundle.resources)) {
      resources[id] = {
        id: data.id,
        amount: data.initialAmount,
        perSecond: new Decimal(0),
        totalEarned: new Decimal(0),
        unlocked: data.initiallyUnlocked,
      }
    }
    result[productId as ProductId] = resources
  }
  return result
}

// ─── Interface ──────────────────────────────────────────────────

interface ResourceStore {
  globalResources: Record<string, Resource>
  productResources: Record<ProductId, Record<string, Resource>>

  /** Apply deltas (positive or negative) — routes to global or product */
  applyDeltas: (deltas: Record<string, Decimal>) => void

  /** Update perSecond display values */
  updatePerSecond: (net: Record<string, Decimal>) => void

  /** Spend a resource. Returns true if successful. */
  spendResource: (resourceId: ResourceId, amount: Decimal) => boolean

  /** Check if player can afford */
  canAfford: (resourceId: ResourceId, amount: Decimal) => boolean

  /** Add resource */
  addResource: (resourceId: ResourceId, amount: Decimal) => void

  /** Sell a product: remove finished product, add coins */
  sellProduct: (productResourceId: ResourceId, amount: Decimal, coins: Decimal) => void

  /** Unlock a resource */
  unlockResource: (resourceId: ResourceId) => void

  /** Get a resource by ID (looks in global then products) */
  getResource: (resourceId: ResourceId) => Resource | undefined

  /** Get all resources flattened */
  getAllResources: () => Record<string, Resource>

  /** Reset all resources to initial state */
  resetResources: () => void
}

// ─── Helpers ────────────────────────────────────────────────────

function findResource(
  globalResources: Record<string, Resource>,
  productResources: Record<ProductId, Record<string, Resource>>,
  resourceId: ResourceId,
): { location: 'global'; resource: Resource } | { location: 'product'; productId: ProductId; resource: Resource } | null {
  const rid = resourceId as string
  if (globalResources[rid]) {
    return { location: 'global', resource: globalResources[rid] }
  }
  for (const [productId, resources] of Object.entries(productResources)) {
    if (resources[rid]) {
      return { location: 'product', productId: productId as ProductId, resource: resources[rid] }
    }
  }
  return null
}

// ─── Store ──────────────────────────────────────────────────────

export const useResourceStore = create<ResourceStore>((set, get) => ({
  globalResources: createGlobalResources(),
  productResources: createProductResources(),

  applyDeltas: (deltas) => {
    set((state) => {
      const updatedGlobal = { ...state.globalResources }
      const updatedProducts = { ...state.productResources }
      // Clone product records on-demand
      const clonedProducts = new Set<ProductId>()

      for (const [id, delta] of Object.entries(deltas)) {
        if (delta.isZero()) continue

        const scope = getResourceScope(id as ResourceId)
        if (scope === 'global') {
          if (updatedGlobal[id]) {
            const resource = updatedGlobal[id]
            const newAmount = Decimal.max(resource.amount.add(delta), 0)
            const gained = delta.gt(0) ? delta : new Decimal(0)
            updatedGlobal[id] = {
              ...resource,
              amount: newAmount,
              totalEarned: resource.totalEarned.add(gained),
            }
          }
        } else {
          const productId = scope as ProductId
          if (!clonedProducts.has(productId)) {
            updatedProducts[productId] = { ...updatedProducts[productId] }
            clonedProducts.add(productId)
          }
          const productResources = updatedProducts[productId]
          if (productResources[id]) {
            const resource = productResources[id]
            const newAmount = Decimal.max(resource.amount.add(delta), 0)
            const gained = delta.gt(0) ? delta : new Decimal(0)
            productResources[id] = {
              ...resource,
              amount: newAmount,
              totalEarned: resource.totalEarned.add(gained),
            }
          }
        }
      }

      return { globalResources: updatedGlobal, productResources: updatedProducts }
    })
  },

  updatePerSecond: (net) => {
    set((state) => {
      const updatedGlobal = { ...state.globalResources }
      const updatedProducts = { ...state.productResources }
      const clonedProducts = new Set<ProductId>()

      for (const [id, perSecond] of Object.entries(net)) {
        const scope = getResourceScope(id as ResourceId)
        if (scope === 'global') {
          if (updatedGlobal[id]) {
            updatedGlobal[id] = { ...updatedGlobal[id], perSecond }
          }
        } else {
          const productId = scope as ProductId
          if (!clonedProducts.has(productId)) {
            updatedProducts[productId] = { ...updatedProducts[productId] }
            clonedProducts.add(productId)
          }
          if (updatedProducts[productId][id]) {
            updatedProducts[productId][id] = { ...updatedProducts[productId][id], perSecond }
          }
        }
      }

      return { globalResources: updatedGlobal, productResources: updatedProducts }
    })
  },

  spendResource: (resourceId, amount) => {
    const state = get()
    const found = findResource(state.globalResources, state.productResources, resourceId)
    if (!found || found.resource.amount.lt(amount)) return false

    const rid = resourceId as string

    set((s) => {
      if (found.location === 'global') {
        return {
          globalResources: {
            ...s.globalResources,
            [rid]: {
              ...s.globalResources[rid],
              amount: s.globalResources[rid].amount.sub(amount),
            },
          },
        }
      } else {
        const productId = found.productId
        return {
          productResources: {
            ...s.productResources,
            [productId]: {
              ...s.productResources[productId],
              [rid]: {
                ...s.productResources[productId][rid],
                amount: s.productResources[productId][rid].amount.sub(amount),
              },
            },
          },
        }
      }
    })
    return true
  },

  canAfford: (resourceId, amount) => {
    const state = get()
    const found = findResource(state.globalResources, state.productResources, resourceId)
    if (!found) return false
    return found.resource.amount.gte(amount)
  },

  addResource: (resourceId, amount) => {
    const rid = resourceId as string
    const scope = getResourceScope(resourceId)

    set((state) => {
      if (scope === 'global') {
        const resource = state.globalResources[rid]
        if (!resource) return state
        return {
          globalResources: {
            ...state.globalResources,
            [rid]: {
              ...resource,
              amount: resource.amount.add(amount),
              totalEarned: resource.totalEarned.add(amount),
            },
          },
        }
      } else {
        const productId = scope as ProductId
        const resource = state.productResources[productId]?.[rid]
        if (!resource) return state
        return {
          productResources: {
            ...state.productResources,
            [productId]: {
              ...state.productResources[productId],
              [rid]: {
                ...resource,
                amount: resource.amount.add(amount),
                totalEarned: resource.totalEarned.add(amount),
              },
            },
          },
        }
      }
    })
  },

  sellProduct: (productResourceId, amount, coins) => {
    const productRid = productResourceId as string
    const coinsRid = 'pantins_coins'
    const scope = getResourceScope(productResourceId)

    set((state) => {
      if (scope === 'global') return state // should not happen for product resources

      const productId = scope as ProductId
      const productRes = state.productResources[productId]?.[productRid]
      const coinsRes = state.globalResources[coinsRid]
      if (!productRes || !coinsRes) return state

      return {
        globalResources: {
          ...state.globalResources,
          [coinsRid]: {
            ...coinsRes,
            amount: coinsRes.amount.add(coins),
            totalEarned: coinsRes.totalEarned.add(coins),
          },
        },
        productResources: {
          ...state.productResources,
          [productId]: {
            ...state.productResources[productId],
            [productRid]: {
              ...productRes,
              amount: productRes.amount.sub(amount),
            },
          },
        },
      }
    })
  },

  unlockResource: (resourceId) => {
    const rid = resourceId as string
    const scope = getResourceScope(resourceId)

    set((state) => {
      if (scope === 'global') {
        if (!state.globalResources[rid]) return state
        return {
          globalResources: {
            ...state.globalResources,
            [rid]: { ...state.globalResources[rid], unlocked: true },
          },
        }
      } else {
        const productId = scope as ProductId
        if (!state.productResources[productId]?.[rid]) return state
        return {
          productResources: {
            ...state.productResources,
            [productId]: {
              ...state.productResources[productId],
              [rid]: { ...state.productResources[productId][rid], unlocked: true },
            },
          },
        }
      }
    })
  },

  getResource: (resourceId) => {
    const state = get()
    const found = findResource(state.globalResources, state.productResources, resourceId)
    return found?.resource
  },

  getAllResources: () => {
    const state = get()
    const all: Record<string, Resource> = { ...state.globalResources }
    for (const productResources of Object.values(state.productResources)) {
      Object.assign(all, productResources)
    }
    return all
  },

  resetResources: () => {
    set({
      globalResources: createGlobalResources(),
      productResources: createProductResources(),
    })
  },
}))
