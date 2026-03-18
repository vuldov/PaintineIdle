import { create } from 'zustand'
import type { SupplierId, SupplierState, SupplierUpgradeId, SupplierUpgradeState, ProductId } from '@/types'
import { PANTINS_COINS_ID } from '@/types'
import { PRODUCT_REGISTRY, ALL_SUPPLIERS, ALL_SUPPLIER_UPGRADES } from '@/lib/products/registry'
import { useResourceStore } from './resourceStore'

// ─── Initial state ──────────────────────────────────────────────

function createInitialSuppliers(): Record<string, SupplierState> {
  const result: Record<string, SupplierState> = {}
  for (const bundle of Object.values(PRODUCT_REGISTRY)) {
    for (const [id, data] of Object.entries(bundle.suppliers)) {
      result[id] = {
        id: data.id,
        unlocked: false,
        active: false,
        ratePercent: 100,
      }
    }
  }
  return result
}

function createInitialSupplierUpgrades(): Record<string, SupplierUpgradeState> {
  const result: Record<string, SupplierUpgradeState> = {}
  for (const bundle of Object.values(PRODUCT_REGISTRY)) {
    for (const [id, data] of Object.entries(bundle.supplierUpgrades)) {
      result[id] = {
        id: data.id,
        purchased: false,
      }
    }
  }
  return result
}

// ─── Interface ──────────────────────────────────────────────────

interface SupplierStore {
  suppliers: Record<string, SupplierState>
  supplierUpgrades: Record<string, SupplierUpgradeState>

  /** Buy the contract for a supplier (one-time cost in paintine coins). */
  buyContract: (id: SupplierId) => boolean

  /** Toggle a supplier on/off. Multiple can be active simultaneously. */
  toggleSupplier: (id: SupplierId) => void

  /** Set the rate percentage (0–100) for a supplier. */
  setRate: (id: SupplierId, percent: number) => void

  /** Buy a supplier upgrade (costs an intermediate resource). */
  buySupplierUpgrade: (id: SupplierUpgradeId) => boolean

  /** Get all suppliers for a given product. */
  getSuppliersForProduct: (productId: ProductId) => Record<string, SupplierState>

  /** Reset to initial state. */
  resetSuppliers: () => void
}

// ─── Store ──────────────────────────────────────────────────────

export const useSupplierStore = create<SupplierStore>((set, get) => ({
  suppliers: createInitialSuppliers(),
  supplierUpgrades: createInitialSupplierUpgrades(),

  buyContract: (id) => {
    const sid = id as string
    const data = ALL_SUPPLIERS[sid]
    if (!data) return false

    const state = get().suppliers[sid]
    if (!state || state.unlocked) return false

    const resourceStore = useResourceStore.getState()
    const success = resourceStore.spendResource(PANTINS_COINS_ID, data.contractCost)
    if (!success) return false

    set((s) => ({
      suppliers: {
        ...s.suppliers,
        [sid]: { ...s.suppliers[sid], unlocked: true },
      },
    }))
    return true
  },

  toggleSupplier: (id) => {
    const sid = id as string
    const state = get().suppliers[sid]
    if (!state || !state.unlocked) return

    set((s) => ({
      suppliers: {
        ...s.suppliers,
        [sid]: { ...s.suppliers[sid], active: !s.suppliers[sid].active },
      },
    }))
  },

  setRate: (id, percent) => {
    const sid = id as string
    const clamped = Math.max(0, Math.min(100, Math.round(percent / 10) * 10))

    set((s) => {
      if (!s.suppliers[sid]) return s
      return {
        suppliers: {
          ...s.suppliers,
          [sid]: { ...s.suppliers[sid], ratePercent: clamped },
        },
      }
    })
  },

  buySupplierUpgrade: (id) => {
    const uid = id as string
    const data = ALL_SUPPLIER_UPGRADES[uid]
    if (!data) return false

    const state = get().supplierUpgrades[uid]
    if (!state || state.purchased) return false

    const resourceStore = useResourceStore.getState()
    const success = resourceStore.spendResource(data.costResource, data.cost)
    if (!success) return false

    set((s) => ({
      supplierUpgrades: {
        ...s.supplierUpgrades,
        [uid]: { ...s.supplierUpgrades[uid], purchased: true },
      },
    }))
    return true
  },

  getSuppliersForProduct: (productId) => {
    const bundle = PRODUCT_REGISTRY[productId]
    if (!bundle) return {}
    const state = get().suppliers
    const result: Record<string, SupplierState> = {}
    for (const id of Object.keys(bundle.suppliers)) {
      if (state[id]) result[id] = state[id]
    }
    return result
  },

  resetSuppliers: () => {
    set({
      suppliers: createInitialSuppliers(),
      supplierUpgrades: createInitialSupplierUpgrades(),
    })
  },
}))
