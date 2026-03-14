import Decimal from 'decimal.js'
import type { Building, GameState, ResourceId, Upgrade, UpgradeId } from '@/types'
import { SECONDARY_PRODUCTION, BASE_CLICK_POWER } from '@/lib/constants'

// ─── Coûts ───────────────────────────────────────────────────────

/**
 * Coût du n-ième achat d'un bâtiment (0-indexed : count = nb déjà possédés).
 * Applique la réduction de coût des upgrades si fournie.
 */
export function calcCost(building: Building, count: number, costReduction?: Decimal): Decimal {
  const base = building.baseCost.mul(
    Decimal.pow(building.costMultiplier, count)
  )
  return costReduction ? base.mul(costReduction) : base
}

/**
 * Coût pour acheter `amount` bâtiments d'un coup en partant de `count` bâtiments.
 * Formule de la somme géométrique.
 */
export function calcBulkCost(building: Building, count: number, amount: number): Decimal {
  if (amount <= 0) return new Decimal(0)

  const base = building.baseCost
  const r = new Decimal(building.costMultiplier)

  return base
    .mul(Decimal.pow(r, count))
    .mul(Decimal.pow(r, amount).sub(1))
    .div(r.sub(1))
}

// ─── Clic ────────────────────────────────────────────────────────

/**
 * Calcule le nombre de croissants produits par clic.
 * Prend en compte les upgrades de type click_multiplier et le prestige.
 */
export function calcClickPower(
  upgrades: Record<UpgradeId, Upgrade>,
  prestigeMultiplier: Decimal,
): Decimal {
  let power = BASE_CLICK_POWER

  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    if (upgrade.effect.type === 'click_multiplier') {
      power = power.mul(upgrade.effect.multiplier)
    }
  }

  return power.mul(prestigeMultiplier)
}

// ─── Réduction de coût ───────────────────────────────────────────

/**
 * Calcule le multiplicateur de réduction de coût cumulé des upgrades.
 */
export function calcCostReduction(upgrades: Record<UpgradeId, Upgrade>): Decimal {
  let reduction = new Decimal(1)

  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    if (upgrade.effect.type === 'cost_reduction') {
      reduction = reduction.mul(upgrade.effect.multiplier)
    }
  }

  return reduction
}

// ─── Production ──────────────────────────────────────────────────

/**
 * Calcule la production par seconde de chaque ressource en fonction de l'état du jeu.
 * Fonction pure — aucun side-effect.
 */
export function calcProduction(state: GameState): Record<ResourceId, Decimal> {
  const production: Record<ResourceId, Decimal> = {
    croissants: new Decimal(0),
    beurre: new Decimal(0),
    farine: new Decimal(0),
    reputation: new Decimal(0),
    etoiles: new Decimal(0),
  }

  // ── Collecter les multiplicateurs issus des upgrades ────────────

  const buildingMultipliers: Partial<Record<string, Decimal>> = {}
  let globalMultiplier = new Decimal(1)
  const resourceMultipliers: Partial<Record<ResourceId, Decimal>> = {}

  for (const upgrade of Object.values(state.upgrades)) {
    if (!upgrade.purchased) continue

    switch (upgrade.effect.type) {
      case 'building_multiplier': {
        const target = upgrade.effect.targetBuilding
        if (target) {
          const current = buildingMultipliers[target] ?? new Decimal(1)
          buildingMultipliers[target] = current.mul(upgrade.effect.multiplier)
        }
        break
      }
      case 'global_multiplier':
        globalMultiplier = globalMultiplier.mul(upgrade.effect.multiplier)
        break
      case 'resource_multiplier': {
        const target = upgrade.effect.targetResource
        if (target) {
          const current = resourceMultipliers[target] ?? new Decimal(1)
          resourceMultipliers[target] = current.mul(upgrade.effect.multiplier)
        }
        break
      }
    }
  }

  // ── Somme des productions de tous les bâtiments ────────────────

  for (const building of Object.values(state.buildings)) {
    if (building.count <= 0) continue

    const bMult = buildingMultipliers[building.id] ?? new Decimal(1)

    // Production principale
    const buildingProduction = building.baseProduction
      .mul(building.count)
      .mul(bMult)
      .mul(globalMultiplier)
    const resourceId = building.producedResource
    production[resourceId] = production[resourceId].add(buildingProduction)

    // Productions secondaires
    const secondaries = SECONDARY_PRODUCTION[building.id]
    if (secondaries) {
      for (const secondary of secondaries) {
        const secondaryAmount = secondary.perBuilding
          .mul(building.count)
          .mul(bMult)
          .mul(globalMultiplier)
        production[secondary.resource] = production[secondary.resource].add(secondaryAmount)
      }
    }
  }

  // ── Multiplicateurs par ressource ──────────────────────────────

  for (const [resId, mult] of Object.entries(resourceMultipliers)) {
    const resourceId = resId as ResourceId
    production[resourceId] = production[resourceId].mul(mult)
  }

  // ── Multiplicateur de prestige ─────────────────────────────────

  const prestigeMultiplier = state.prestige.bonusMultiplier
  for (const resourceId of Object.keys(production) as ResourceId[]) {
    if (resourceId === 'etoiles') continue
    production[resourceId] = production[resourceId].mul(prestigeMultiplier)
  }

  return production
}

// ─── Prestige ────────────────────────────────────────────────────

/**
 * Étoiles Michelin gagnées au prestige.
 */
export function calcEtoilesGagnees(totalCroissants: Decimal): Decimal {
  if (totalCroissants.lte(0)) return new Decimal(0)
  return Decimal.max(totalCroissants.div(1e6).sqrt().floor(), 0)
}

/**
 * Multiplicateur de production issu des étoiles accumulées. +10% par étoile.
 */
export function calcBonusPrestige(etoiles: Decimal): Decimal {
  return etoiles.mul(0.1).add(1)
}
