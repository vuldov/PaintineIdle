import { useEffect } from 'react'
import Decimal from 'decimal.js'
import type { ResourceId, BuildingId } from '@/types'
import { useResourceStore } from '@/store/resourceStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { SAVE_KEY, AUTOSAVE_INTERVAL_MS, MAX_OFFLINE_SECONDS, GAME_VERSION } from '@/lib/constants'
import { calcProduction, calcClampedDelta } from '@/mechanics/productionMechanics'

// ─── Types de sérialisation ──────────────────────────────────────

interface SerializedResource {
  id: ResourceId
  amount: string
  perSecond: string
  totalEarned: string
  unlocked: boolean
}

interface SerializedBuilding {
  id: BuildingId
  count: number
  baseCost: string
  costResource: ResourceId
  costMultiplier: number
  baseProduction: string
  producedResource: ResourceId
  unlocked: boolean
}

interface SaveData {
  resources: Record<string, SerializedResource>
  buildings: Record<string, SerializedBuilding>
  upgrades?: Record<string, { purchased: boolean }>
  version: number
  lastSave: number
}

// ─── Sérialisation ───────────────────────────────────────────────

function serializeSave(): SaveData {
  const { resources } = useResourceStore.getState()
  const { buildings } = useBuildingStore.getState()
  const { upgrades } = useUpgradeStore.getState()

  const serializedResources: Record<string, SerializedResource> = {}
  for (const [id, resource] of Object.entries(resources)) {
    serializedResources[id] = {
      id: resource.id,
      amount: resource.amount.toString(),
      perSecond: resource.perSecond.toString(),
      totalEarned: resource.totalEarned.toString(),
      unlocked: resource.unlocked,
    }
  }

  const serializedBuildings: Record<string, SerializedBuilding> = {}
  for (const [id, building] of Object.entries(buildings)) {
    serializedBuildings[id] = {
      id: building.id,
      count: building.count,
      baseCost: building.baseCost.toString(),
      costResource: building.costResource,
      costMultiplier: building.costMultiplier,
      baseProduction: building.baseProduction.toString(),
      producedResource: building.producedResource,
      unlocked: building.unlocked,
    }
  }

  const serializedUpgrades: Record<string, { purchased: boolean }> = {}
  for (const [id, upgrade] of Object.entries(upgrades)) {
    serializedUpgrades[id] = { purchased: upgrade.purchased }
  }

  return {
    resources: serializedResources,
    buildings: serializedBuildings,
    upgrades: serializedUpgrades,
    version: GAME_VERSION,
    lastSave: Date.now(),
  }
}

function saveGame() {
  const data = serializeSave()
  localStorage.setItem(SAVE_KEY, JSON.stringify(data))
}

// ─── Désérialisation & chargement ────────────────────────────────

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return

  try {
    const data: SaveData = JSON.parse(raw)

    // Migration : si ancienne sauvegarde v1, on la supprime et on repart à zéro
    if (data.version < 2) {
      localStorage.removeItem(SAVE_KEY)
      return
    }

    // Restaurer les ressources
    const resourceState = useResourceStore.getState()
    const restoredResources = { ...resourceState.resources }
    for (const [id, serialized] of Object.entries(data.resources)) {
      const resourceId = id as ResourceId
      if (restoredResources[resourceId]) {
        restoredResources[resourceId] = {
          id: resourceId,
          amount: new Decimal(serialized.amount),
          perSecond: new Decimal(serialized.perSecond),
          totalEarned: new Decimal(serialized.totalEarned),
          unlocked: serialized.unlocked,
        }
      }
    }
    useResourceStore.setState({ resources: restoredResources })

    // Restaurer les bâtiments
    const buildingState = useBuildingStore.getState()
    const restoredBuildings = { ...buildingState.buildings }
    for (const [id, serialized] of Object.entries(data.buildings)) {
      const buildingId = id as BuildingId
      if (restoredBuildings[buildingId]) {
        restoredBuildings[buildingId] = {
          id: buildingId,
          count: serialized.count,
          baseCost: new Decimal(serialized.baseCost),
          costResource: serialized.costResource,
          costMultiplier: serialized.costMultiplier,
          baseProduction: new Decimal(serialized.baseProduction),
          producedResource: serialized.producedResource,
          unlocked: serialized.unlocked,
        }
      }
    }
    useBuildingStore.setState({ buildings: restoredBuildings })

    // Restaurer les upgrades
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

    // Progrès hors-ligne (simplifié : applique le net sur la durée)
    const offlineSeconds = Math.min(
      (Date.now() - data.lastSave) / 1000,
      MAX_OFFLINE_SECONDS
    )

    if (offlineSeconds > 1) {
      const resources = useResourceStore.getState().resources
      const buildings = useBuildingStore.getState().buildings
      const upgrades = useUpgradeStore.getState().upgrades

      const state = {
        resources,
        buildings,
        upgrades,
        prestige: {
          etoiles: resources.etoiles.amount,
          etoilesCettePartie: resources.etoiles.amount,
          totalPrestiges: 0,
          bonusMultiplier: resources.etoiles.amount.mul(0.1).add(1),
        },
        stats: {
          totalCroissantsProduits: resources.croissants.totalEarned,
          tempsDeJeu: 0,
          totalClics: 0,
          meilleurCroissantsParSeconde: resources.croissants.perSecond,
          dateDebut: Date.now(),
        },
        version: GAME_VERSION,
        lastSave: data.lastSave,
      }

      const result = calcProduction(state)
      const deltas = calcClampedDelta(result, resources, offlineSeconds)
      useResourceStore.getState().applyDeltas(deltas)
    }
  } catch {
    console.warn('Impossible de charger la sauvegarde, elle sera ignorée.')
  }
}

// ─── Hook ────────────────────────────────────────────────────────

export function useAutoSave() {
  useEffect(() => {
    loadGame()
  }, [])

  useEffect(() => {
    const interval = setInterval(saveGame, AUTOSAVE_INTERVAL_MS)

    const handleBeforeUnload = () => saveGame()
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      saveGame()
    }
  }, [])
}
