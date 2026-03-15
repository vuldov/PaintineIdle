import { useCallback, useEffect, useRef } from 'react'
import type { ResourceId } from '@/types'
import { calcProduction, calcClampedDelta } from '@/mechanics/productionMechanics'
import { useResourceStore } from '@/store/resourceStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { useCraftingStore } from '@/store/craftingStore'
import { BUILDING_ORDER, BUILDING_UNLOCK_THRESHOLDS } from '@/lib/buildings'
import { RESOURCE_UNLOCK_THRESHOLDS } from '@/lib/resources'

/**
 * Assemble un GameState à partir des stores.
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
    version: 2,
    lastSave: Date.now(),
  }
}

/**
 * Vérifie et débloque bâtiments et ressources.
 */
function checkUnlocks() {
  const { resources, unlockResource } = useResourceStore.getState()
  const { buildings, unlockBuilding } = useBuildingStore.getState()

  // Déblocage des bâtiments
  for (const id of BUILDING_ORDER) {
    if (buildings[id].unlocked) continue
    const threshold = BUILDING_UNLOCK_THRESHOLDS[id]
    if (!threshold) continue
    if (resources[threshold.resource].totalEarned.gte(threshold.amount)) {
      unlockBuilding(id)
    }
  }

  // Déblocage des ressources
  for (const [resourceId, condition] of Object.entries(RESOURCE_UNLOCK_THRESHOLDS)) {
    if (!condition) continue
    if (resources[resourceId as ResourceId].unlocked) continue
    if (resources[condition.resource].totalEarned.gte(condition.amount)) {
      unlockResource(resourceId as ResourceId)
    }
  }
}

/**
 * Game loop principal via requestAnimationFrame.
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

    // 1. Avancer le crafting manuel
    useCraftingStore.getState().tickCrafting(delta)

    // 2. Production automatique (bâtiments)
    const state = getGameState()
    const result = calcProduction(state)
    const deltas = calcClampedDelta(result, state.resources, delta)

    const { applyDeltas, updatePerSecond } = useResourceStore.getState()
    applyDeltas(deltas)
    updatePerSecond(result.net)

    // 3. Déblocages
    checkUnlocks()

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(rafRef.current) }
  }, [tick])
}
