import { useCallback, useEffect, useRef } from 'react'
import type { ResourceId } from '@/types'
import type Decimal from 'decimal.js'
import { calcProduction } from '@/mechanics/productionMechanics'
import { useResourceStore } from '@/store/resourceStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { BUILDING_ORDER, RESOURCE_UNLOCK_THRESHOLDS } from '@/lib/constants'

/**
 * Assemble un GameState complet à partir des stores pour les fonctions pures de mechanics.
 */
function getGameState() {
  const { resources } = useResourceStore.getState()
  const { buildings } = useBuildingStore.getState()
  const { upgrades } = useUpgradeStore.getState()

  return {
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
    version: 1,
    lastSave: Date.now(),
  }
}

/**
 * Vérifie et débloque les bâtiments et ressources selon les seuils atteints.
 */
function checkUnlocks() {
  const { resources, unlockResource } = useResourceStore.getState()
  const { buildings, unlockBuilding } = useBuildingStore.getState()
  const totalCroissants = resources.croissants.totalEarned

  // Déblocage des bâtiments
  for (const id of BUILDING_ORDER) {
    const building = buildings[id]
    if (building.unlocked) continue
    if (totalCroissants.gte(building.baseCost.div(2))) {
      unlockBuilding(id)
    }
  }

  // Déblocage des ressources secondaires
  for (const [resourceId, condition] of Object.entries(RESOURCE_UNLOCK_THRESHOLDS)) {
    if (!condition) continue
    if (resources[resourceId as ResourceId].unlocked) continue
    const source = resources[condition.resource]
    if (source.totalEarned.gte(condition.amount)) {
      unlockResource(resourceId as ResourceId)
    }
  }
}

/**
 * Game loop principal via requestAnimationFrame.
 * Delta time en secondes, cappé à 1s pour éviter les sauts.
 */
export function useGameLoop() {
  const lastTimeRef = useRef<number>(0)
  const rafRef = useRef<number>(0)

  const tick = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp
      rafRef.current = requestAnimationFrame(tick)
      return
    }

    const rawDelta = (timestamp - lastTimeRef.current) / 1000
    const delta = Math.min(rawDelta, 1)
    lastTimeRef.current = timestamp

    // Calculer la production
    const state = getGameState()
    const production: Record<ResourceId, Decimal> = calcProduction(state)

    // Mettre à jour les ressources
    const { addResources, updatePerSecond } = useResourceStore.getState()
    addResources(production, delta)
    updatePerSecond(production)

    // Vérifier les déblocages
    checkUnlocks()

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [tick])
}
