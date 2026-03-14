import { useEffect } from 'react'
import Decimal from 'decimal.js'
import type { ResourceId, BuildingId } from '@/types'
import { useResourceStore } from '@/store/resourceStore'
import { useBuildingStore } from '@/store/buildingStore'
import { SAVE_KEY, AUTOSAVE_INTERVAL_MS, MAX_OFFLINE_SECONDS } from '@/lib/constants'
import { calcProduction } from '@/mechanics/productionMechanics'

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
  resources: Record<ResourceId, SerializedResource>
  buildings: Record<BuildingId, SerializedBuilding>
  version: number
  lastSave: number
}

// ─── Sérialisation ───────────────────────────────────────────────

function serializeSave(): SaveData {
  const { resources } = useResourceStore.getState()
  const { buildings } = useBuildingStore.getState()

  const serializedResources = {} as Record<ResourceId, SerializedResource>
  for (const [id, resource] of Object.entries(resources)) {
    serializedResources[id as ResourceId] = {
      id: resource.id,
      amount: resource.amount.toString(),
      perSecond: resource.perSecond.toString(),
      totalEarned: resource.totalEarned.toString(),
      unlocked: resource.unlocked,
    }
  }

  const serializedBuildings = {} as Record<BuildingId, SerializedBuilding>
  for (const [id, building] of Object.entries(buildings)) {
    serializedBuildings[id as BuildingId] = {
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

  return {
    resources: serializedResources,
    buildings: serializedBuildings,
    version: 1,
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

    // Progrès hors-ligne
    const offlineSeconds = Math.min(
      (Date.now() - data.lastSave) / 1000,
      MAX_OFFLINE_SECONDS
    )

    if (offlineSeconds > 1) {
      // Assembler un état minimal pour calcProduction
      const state = {
        resources: useResourceStore.getState().resources,
        buildings: useBuildingStore.getState().buildings,
        upgrades: {},
        prestige: {
          etoiles: useResourceStore.getState().resources.etoiles.amount,
          etoilesCettePartie: useResourceStore.getState().resources.etoiles.amount,
          totalPrestiges: 0,
          bonusMultiplier: useResourceStore.getState().resources.etoiles.amount.mul(0.1).add(1),
        },
        stats: {
          totalCroissantsProduits: useResourceStore.getState().resources.croissants.totalEarned,
          tempsDeJeu: 0,
          totalClics: 0,
          meilleurCroissantsParSeconde: useResourceStore.getState().resources.croissants.perSecond,
          dateDebut: Date.now(),
        },
        version: 1,
        lastSave: data.lastSave,
      }

      const production = calcProduction(state)
      useResourceStore.getState().addResources(production, offlineSeconds)
    }
  } catch {
    console.warn('Impossible de charger la sauvegarde, elle sera ignorée.')
  }
}

// ─── Hook ────────────────────────────────────────────────────────

/**
 * Autosave toutes les 30 secondes en localStorage.
 * Charge la sauvegarde au montage et applique le progrès hors-ligne.
 */
export function useAutoSave() {
  // Charger la sauvegarde au montage
  useEffect(() => {
    loadGame()
  }, [])

  // Autosave périodique
  useEffect(() => {
    const interval = setInterval(() => {
      saveGame()
    }, AUTOSAVE_INTERVAL_MS)

    // Sauvegarder aussi avant de quitter la page
    const handleBeforeUnload = () => {
      saveGame()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      saveGame() // Sauvegarder au démontage
    }
  }, [])
}
