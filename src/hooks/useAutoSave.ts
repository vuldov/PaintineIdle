import { useEffect } from 'react'
import Decimal from 'decimal.js'
import type { ProductId } from '@/types'
import { useResourceStore } from '@/store/resourceStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { useProductStore } from '@/store/productStore'
import { useCraftingStore } from '@/store/craftingStore'
import { useSupplierStore } from '@/store/supplierStore'
import { AUTOSAVE_INTERVAL_MS, MAX_OFFLINE_SECONDS, GAME_VERSION, PRODUCT_REGISTRY } from '@/lib/constants'
import { calcTotalProduction, calcClampedDelta } from '@/mechanics/productionMechanics'
import { loadSaveData, writeSaveData, deleteSaveData } from '@/lib/storage'

// ─── Serialization types ────────────────────────────────────────

interface SerializedResource {
  id: string
  amount: string
  perSecond: string
  totalEarned: string
  unlocked: boolean
}

interface SerializedBuilding {
  id: string
  count: number
  baseCost: string
  costResource: string
  costMultiplier: number
  baseProduction: string
  producedResource: string
  unlocked: boolean
}

interface SerializedSupplier {
  id: string
  unlocked: boolean
  ratePercent: number
  contractTier?: number
}

interface SaveDataV3 {
  globalResources: Record<string, SerializedResource>
  productResources: Record<string, Record<string, SerializedResource>>
  buildings: Record<string, Record<string, SerializedBuilding>>
  upgrades: Record<string, { purchased: boolean }>
  suppliers?: Record<string, SerializedSupplier>
  supplierUpgrades?: Record<string, { purchased: boolean }>
  unlockedProducts: string[]
  activeProduct: string
  version: number
  lastSave: number
}


// ─── Serialization ──────────────────────────────────────────────

function serializeResource(resource: { id: { toString(): string }; amount: { toString(): string }; perSecond: { toString(): string }; totalEarned: { toString(): string }; unlocked: boolean }): SerializedResource {
  return {
    id: String(resource.id),
    amount: resource.amount.toString(),
    perSecond: resource.perSecond.toString(),
    totalEarned: resource.totalEarned.toString(),
    unlocked: resource.unlocked,
  }
}

function serializeBuilding(building: { id: { toString(): string }; count: number; baseCost: { toString(): string }; costResource: { toString(): string }; costMultiplier: number; baseProduction: { toString(): string }; producedResource: { toString(): string }; unlocked: boolean }): SerializedBuilding {
  return {
    id: String(building.id),
    count: building.count,
    baseCost: building.baseCost.toString(),
    costResource: String(building.costResource),
    costMultiplier: building.costMultiplier,
    baseProduction: building.baseProduction.toString(),
    producedResource: String(building.producedResource),
    unlocked: building.unlocked,
  }
}

function serializeSave(): SaveDataV3 {
  const { globalResources, productResources } = useResourceStore.getState()
  const { buildings } = useBuildingStore.getState()
  const { upgrades } = useUpgradeStore.getState()
  const { unlockedProducts, activeProduct } = useProductStore.getState()

  const serializedGlobal: Record<string, SerializedResource> = {}
  for (const [id, resource] of Object.entries(globalResources)) {
    serializedGlobal[id] = serializeResource(resource)
  }

  const serializedProductResources: Record<string, Record<string, SerializedResource>> = {}
  for (const [productId, resources] of Object.entries(productResources)) {
    serializedProductResources[productId] = {}
    for (const [id, resource] of Object.entries(resources)) {
      serializedProductResources[productId][id] = serializeResource(resource)
    }
  }

  const serializedBuildings: Record<string, Record<string, SerializedBuilding>> = {}
  for (const [productId, productBuildings] of Object.entries(buildings)) {
    serializedBuildings[productId] = {}
    for (const [id, building] of Object.entries(productBuildings)) {
      serializedBuildings[productId][id] = serializeBuilding(building)
    }
  }

  const serializedUpgrades: Record<string, { purchased: boolean }> = {}
  for (const [id, upgrade] of Object.entries(upgrades)) {
    serializedUpgrades[id] = { purchased: upgrade.purchased }
  }

  const { suppliers, supplierUpgrades } = useSupplierStore.getState()
  const serializedSuppliers: Record<string, SerializedSupplier> = {}
  for (const [id, supplier] of Object.entries(suppliers)) {
    serializedSuppliers[id] = {
      id: supplier.id as string,
      unlocked: supplier.unlocked,
      ratePercent: supplier.ratePercent,
      contractTier: supplier.contractTier ?? 0,
    }
  }

  const serializedSupplierUpgrades: Record<string, { purchased: boolean }> = {}
  for (const [id, upState] of Object.entries(supplierUpgrades)) {
    serializedSupplierUpgrades[id] = { purchased: upState.purchased }
  }

  return {
    globalResources: serializedGlobal,
    productResources: serializedProductResources,
    buildings: serializedBuildings,
    upgrades: serializedUpgrades,
    suppliers: serializedSuppliers,
    supplierUpgrades: serializedSupplierUpgrades,
    unlockedProducts: [...unlockedProducts],
    activeProduct,
    version: GAME_VERSION,
    lastSave: Date.now(),
  }
}

// ─── Save state tracking ────────────────────────────────────────

let _lastSaveTimestamp = 0

export function getLastSaveTimestamp(): number {
  return _lastSaveTimestamp
}

export function saveGame(): boolean {
  try {
    const data = serializeSave()
    const json = JSON.stringify(data)
    // Fire-and-forget async write — serialization is the expensive part
    // and is already done synchronously above
    writeSaveData(json).catch((err) =>
      console.error('[AutoSave] Erreur ecriture IndexedDB:', err),
    )
    _lastSaveTimestamp = Date.now()
    return true
  } catch (err) {
    console.error('[AutoSave] Erreur lors de la sauvegarde:', err)
    return false
  }
}

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function fromBase64(b64: string): string {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

export function exportSave(): string {
  const data = serializeSave()
  return toBase64(JSON.stringify(data))
}

export async function importSave(base64: string): Promise<boolean> {
  try {
    const json = fromBase64(base64)
    const rawData = JSON.parse(json) as { version?: number }

    if (!rawData.version || rawData.version < 8) return false

    const data = rawData as SaveDataV3

    // Reset stores first, then restore from imported data
    useResourceStore.getState().resetResources()
    useBuildingStore.getState().resetBuildings()
    useUpgradeStore.getState().resetUpgrades()
    useCraftingStore.getState().resetCrafting()
    useProductStore.setState({
      unlockedProducts: ['croissants'] as ProductId[],
      activeProduct: 'croissants' as ProductId,
      viewMode: 'product',
    })

    restoreFromSaveData(data)

    // Persist the imported state
    await writeSaveData(JSON.stringify(serializeSave()))
    return true
  } catch {
    return false
  }
}

export async function hardResetGame() {
  useResourceStore.getState().resetResources()
  useBuildingStore.getState().resetBuildings()
  useUpgradeStore.getState().resetUpgrades()
  useCraftingStore.getState().resetCrafting()
  useSupplierStore.getState().resetSuppliers()
  useProductStore.setState({
    unlockedProducts: ['croissants'] as ProductId[],
    activeProduct: 'croissants' as ProductId,
    viewMode: 'product',
  })
  await deleteSaveData()
  // Persist the clean state immediately
  saveGame()
}

// ─── Safe Decimal parsing ────────────────────────────────────────

function safeDecimal(value: unknown): Decimal {
  if (value == null || value === '' || value === 'NaN' || value === 'Infinity') {
    return new Decimal(0)
  }
  try {
    const d = new Decimal(value as string)
    return d.isNaN() || !d.isFinite() ? new Decimal(0) : d
  } catch {
    return new Decimal(0)
  }
}

// ─── Load ───────────────────────────────────────────────────────

function restoreFromSaveData(data: SaveDataV3) {
  // Restore global resources
  const resourceState = useResourceStore.getState()
  const restoredGlobal = { ...resourceState.globalResources }
  for (const [id, serialized] of Object.entries(data.globalResources)) {
    if (restoredGlobal[id]) {
      restoredGlobal[id] = {
        id: restoredGlobal[id].id,
        amount: safeDecimal(serialized.amount),
        perSecond: safeDecimal(serialized.perSecond),
        totalEarned: safeDecimal(serialized.totalEarned),
        unlocked: serialized.unlocked,
      }
    }
  }

  // Restore product resources
  const restoredProducts = { ...resourceState.productResources }
  for (const [productId, resources] of Object.entries(data.productResources ?? {})) {
    const pid = productId as ProductId
    if (!restoredProducts[pid]) continue
    restoredProducts[pid] = { ...restoredProducts[pid] }
    for (const [id, serialized] of Object.entries(resources)) {
      if (restoredProducts[pid][id]) {
        restoredProducts[pid][id] = {
          id: restoredProducts[pid][id].id,
          amount: safeDecimal(serialized.amount),
          perSecond: safeDecimal(serialized.perSecond),
          totalEarned: safeDecimal(serialized.totalEarned),
          unlocked: serialized.unlocked,
        }
      }
    }
  }

  useResourceStore.setState({
    globalResources: restoredGlobal,
    productResources: restoredProducts,
  })

  // Restore buildings
  const buildingState = useBuildingStore.getState()
  const restoredBuildings = { ...buildingState.buildings }
  for (const [productId, buildings] of Object.entries(data.buildings ?? {})) {
    const pid = productId as ProductId
    if (!restoredBuildings[pid]) continue
    restoredBuildings[pid] = { ...restoredBuildings[pid] }
    for (const [id, serialized] of Object.entries(buildings)) {
      if (restoredBuildings[pid][id]) {
        restoredBuildings[pid][id] = {
          id: restoredBuildings[pid][id].id,
          count: serialized.count,
          baseCost: safeDecimal(serialized.baseCost),
          costResource: restoredBuildings[pid][id].costResource,
          costMultiplier: serialized.costMultiplier,
          baseProduction: safeDecimal(serialized.baseProduction),
          producedResource: restoredBuildings[pid][id].producedResource,
          unlocked: serialized.unlocked,
        }
      }
    }
  }
  useBuildingStore.setState({ buildings: restoredBuildings })

  // Restore upgrades
  if (data.upgrades) {
    const upgradeState = useUpgradeStore.getState()
    const restoredUpgrades = { ...upgradeState.upgrades }
    for (const [id, serialized] of Object.entries(data.upgrades)) {
      if (restoredUpgrades[id]) {
        restoredUpgrades[id] = {
          ...restoredUpgrades[id],
          purchased: serialized.purchased,
        }
      }
    }
    useUpgradeStore.setState({ upgrades: restoredUpgrades })
  }

  // Restore suppliers
  if (data.suppliers) {
    const supplierState = useSupplierStore.getState()
    const restoredSuppliers = { ...supplierState.suppliers }
    for (const [id, serialized] of Object.entries(data.suppliers)) {
      if (restoredSuppliers[id]) {
        restoredSuppliers[id] = {
          ...restoredSuppliers[id],
          unlocked: serialized.unlocked,
          ratePercent: serialized.ratePercent,
          contractTier: (serialized.contractTier ?? 0) as import('@/types').SupplierContractTier,
        }
      }
    }
    useSupplierStore.setState({ suppliers: restoredSuppliers })
  }

  // Restore supplier upgrades
  if (data.supplierUpgrades) {
    const supplierState = useSupplierStore.getState()
    const restoredUpgrades = { ...supplierState.supplierUpgrades }
    for (const [id, serialized] of Object.entries(data.supplierUpgrades)) {
      if (restoredUpgrades[id]) {
        restoredUpgrades[id] = {
          ...restoredUpgrades[id],
          purchased: serialized.purchased,
        }
      }
    }
    useSupplierStore.setState({ supplierUpgrades: restoredUpgrades })
  }

  // Restore product store
  if (data.unlockedProducts) {
    useProductStore.setState({
      unlockedProducts: data.unlockedProducts as ProductId[],
      activeProduct: (data.activeProduct as ProductId) ?? 'croissants',
    })
  }

  // Offline progress
  const offlineSeconds = Math.min(
    (Date.now() - data.lastSave) / 1000,
    MAX_OFFLINE_SECONDS,
  )

  if (offlineSeconds > 1) {
    const { unlockedProducts } = useProductStore.getState()
    const buildingStoreState = useBuildingStore.getState()
    const { upgrades } = useUpgradeStore.getState()
    const resourceStoreState = useResourceStore.getState()

    const totalResult = calcTotalProduction(
      unlockedProducts,
      PRODUCT_REGISTRY,
      buildingStoreState.buildings,
      upgrades,
    )

    const allResources = resourceStoreState.getAllResources()
    const deltas = calcClampedDelta(totalResult, allResources, offlineSeconds)
    useResourceStore.getState().applyDeltas(deltas)
  }
}

async function loadGame() {
  try {
    const raw = await loadSaveData()
    if (!raw) return

    const rawData = JSON.parse(raw) as { version?: number }

    // Handle old versions -- too old, discard (v7 changed building structure)
    // v8 saves are compatible (contractTier defaults to 0 via migration)
    const MIN_COMPATIBLE_VERSION = 8
    if (!rawData.version || rawData.version < MIN_COMPATIBLE_VERSION) {
      await deleteSaveData()
      return
    }

    const data = rawData as SaveDataV3

    restoreFromSaveData(data)
    _lastSaveTimestamp = data.lastSave || Date.now()
  } catch {
    console.warn('Impossible de charger la sauvegarde, elle sera ignoree.')
  }
}

// ─── Hook ────────────────────────────────────────────────────────

let _gameLoaded = false

export function useAutoSave() {
  useEffect(() => {
    loadGame().then(() => {
      _gameLoaded = true
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (_gameLoaded) saveGame()
    }, AUTOSAVE_INTERVAL_MS)

    const handleBeforeUnload = () => {
      if (_gameLoaded) saveGame()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (_gameLoaded) saveGame()
    }
  }, [])
}
