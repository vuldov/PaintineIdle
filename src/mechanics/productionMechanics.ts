import Decimal from 'decimal.js'
import type { Building, BuildingId, GameState, ResourceId, Upgrade, UpgradeId } from '@/types'
import {
  BUILDINGS_DATA,
  PETRISSAGE_BEURRE_RATIO,
  PETRISSAGE_FARINE_RATIO,
  CUISSON_PATE_RATIO,
  VENTE_CROISSANT_RATIO,
} from '@/lib/buildings'
import { BASE_INGREDIENT_REGEN } from '@/lib/resources'
import { BASE_SELL_RATE } from '@/lib/crafting'

// ─── Taux de production par bâtiment (pour affichage) ────────────

export interface RateInfo {
  resource: ResourceId
  amount: Decimal
}

export interface BuildingRates {
  produces: RateInfo[]
  consumes: RateInfo[]
}

/**
 * Calcule la production et consommation effectives par unité de bâtiment,
 * en tenant compte des upgrades (building_multiplier + global_multiplier).
 * Fonction pure — utilisable dans les composants ET les tests.
 */
export function calcBuildingRates(
  buildingId: BuildingId,
  baseProduction: Decimal,
  upgrades: Record<UpgradeId, Upgrade>,
): BuildingRates {
  const data = BUILDINGS_DATA[buildingId]

  let bMult = new Decimal(1)
  let globalMult = new Decimal(1)
  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    if (upgrade.effect.type === 'building_multiplier' && upgrade.effect.targetBuilding === buildingId) {
      bMult = bMult.mul(upgrade.effect.multiplier)
    }
    if (upgrade.effect.type === 'global_multiplier') {
      globalMult = globalMult.mul(upgrade.effect.multiplier)
    }
  }

  const effectiveProd = baseProduction.mul(bMult).mul(globalMult)

  const produces: RateInfo[] = []
  const consumes: RateInfo[] = []

  switch (data.pipelineRole) {
    case 'petrissage':
      produces.push({ resource: 'pate', amount: effectiveProd })
      consumes.push({ resource: 'beurre', amount: effectiveProd.mul(PETRISSAGE_BEURRE_RATIO) })
      consumes.push({ resource: 'farine', amount: effectiveProd.mul(PETRISSAGE_FARINE_RATIO) })
      break
    case 'cuisson':
      produces.push({ resource: 'croissants', amount: effectiveProd })
      consumes.push({ resource: 'pate', amount: effectiveProd.mul(CUISSON_PATE_RATIO) })
      break
    case 'vente':
      produces.push({ resource: 'pantins_coins', amount: effectiveProd.mul(VENTE_CROISSANT_RATIO) })
      consumes.push({ resource: 'croissants', amount: effectiveProd.mul(VENTE_CROISSANT_RATIO) })
      break
    case 'ingredients':
      produces.push({ resource: 'beurre', amount: effectiveProd })
      produces.push({ resource: 'farine', amount: effectiveProd.mul(1.5) })
      break
    case 'full_pipeline':
      produces.push({ resource: 'croissants', amount: effectiveProd })
      break
  }

  return { produces, consumes }
}

// ─── Coûts ───────────────────────────────────────────────────────

export function calcCost(building: Building, count: number, costReduction?: Decimal): Decimal {
  const base = building.baseCost.mul(Decimal.pow(building.costMultiplier, count))
  return costReduction ? base.mul(costReduction) : base
}

export function calcBulkCost(building: Building, count: number, amount: number): Decimal {
  if (amount <= 0) return new Decimal(0)
  const base = building.baseCost
  const r = new Decimal(building.costMultiplier)
  return base.mul(Decimal.pow(r, count)).mul(Decimal.pow(r, amount).sub(1)).div(r.sub(1))
}

// ─── Réduction de coût ───────────────────────────────────────────

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

// ─── Multiplicateur de vente ─────────────────────────────────────

function calcSellMultiplier(upgrades: Record<UpgradeId, Upgrade>): Decimal {
  let mult = BASE_SELL_RATE
  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    if (upgrade.effect.type === 'sell_multiplier') {
      mult = mult.mul(upgrade.effect.multiplier)
    }
  }
  return mult
}

// ─── Production pipeline ─────────────────────────────────────────

/** Une étape du pipeline qui consomme des ressources pour en produire d'autres */
export interface PipelineStage {
  consumes: Partial<Record<ResourceId, Decimal>>  // /s
  produces: Partial<Record<ResourceId, Decimal>>   // /s
}

export interface ProductionResult {
  /** Production libre (regen, ingrédients, full_pipeline) — jamais throttlée */
  freeProduction: Record<ResourceId, Decimal>
  /** Étapes pipeline : chaque étape est throttlée indépendamment */
  stages: PipelineStage[]
  /** Net pour l'affichage (free + stages, SANS throttle) */
  net: Record<ResourceId, Decimal>
}

function emptyRecord(): Record<ResourceId, Decimal> {
  return {
    croissants: new Decimal(0),
    beurre: new Decimal(0),
    farine: new Decimal(0),
    pate: new Decimal(0),
    pantins_coins: new Decimal(0),
    reputation: new Decimal(0),
    etoiles: new Decimal(0),
  }
}

/**
 * Calcule la production : sépare la production libre des étapes pipeline.
 * Fonction pure — aucun side-effect.
 */
export function calcProduction(state: GameState): ProductionResult {
  const freeProduction = emptyRecord()

  // Stages accumulés
  const petrissageStage: PipelineStage = { consumes: {}, produces: {} }
  const cuissonStage: PipelineStage = { consumes: {}, produces: {} }
  const venteStage: PipelineStage = { consumes: {}, produces: {} }

  // ── Multiplicateurs des upgrades ─────────────────────────────
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

  const sellMultiplier = calcSellMultiplier(state.upgrades)

  // ── Régénération passive → free ────────────────────────────
  for (const [resId, regen] of Object.entries(BASE_INGREDIENT_REGEN)) {
    if (regen) {
      freeProduction[resId as ResourceId] = freeProduction[resId as ResourceId].add(regen)
    }
  }

  // ── Bâtiments ──────────────────────────────────────────────
  for (const building of Object.values(state.buildings)) {
    if (building.count <= 0) continue

    const bMult = buildingMultipliers[building.id] ?? new Decimal(1)
    const totalMult = bMult.mul(globalMultiplier)
    const baseProd = building.baseProduction.mul(building.count).mul(totalMult)
    const data = BUILDINGS_DATA[building.id]

    switch (data.pipelineRole) {
      case 'petrissage': {
        addTo(petrissageStage.produces, 'pate', baseProd)
        addTo(petrissageStage.consumes, 'beurre', baseProd.mul(PETRISSAGE_BEURRE_RATIO))
        addTo(petrissageStage.consumes, 'farine', baseProd.mul(PETRISSAGE_FARINE_RATIO))
        break
      }
      case 'cuisson': {
        addTo(cuissonStage.produces, 'croissants', baseProd)
        addTo(cuissonStage.consumes, 'pate', baseProd.mul(CUISSON_PATE_RATIO))
        break
      }
      case 'vente': {
        const croissantsSold = baseProd.mul(VENTE_CROISSANT_RATIO)
        addTo(venteStage.consumes, 'croissants', croissantsSold)
        addTo(venteStage.produces, 'pantins_coins', croissantsSold.mul(sellMultiplier))
        freeProduction.reputation = freeProduction.reputation.add(baseProd.mul(0.1))
        break
      }
      case 'ingredients': {
        freeProduction.beurre = freeProduction.beurre.add(baseProd)
        freeProduction.farine = freeProduction.farine.add(baseProd.mul(1.5))
        break
      }
      case 'full_pipeline': {
        freeProduction.croissants = freeProduction.croissants.add(baseProd)
        freeProduction.reputation = freeProduction.reputation.add(baseProd.mul(0.05))
        break
      }
    }
  }

  // ── Multiplicateurs par ressource ──────────────────────────
  for (const [resId, mult] of Object.entries(resourceMultipliers)) {
    const rid = resId as ResourceId
    freeProduction[rid] = freeProduction[rid].mul(mult)
    // Aussi appliquer aux stages
    for (const stage of [petrissageStage, cuissonStage, venteStage]) {
      if (stage.produces[rid]) {
        stage.produces[rid] = stage.produces[rid]!.mul(mult)
      }
    }
  }

  // ── Prestige ───────────────────────────────────────────────
  const pm = state.prestige.bonusMultiplier
  for (const rid of Object.keys(freeProduction) as ResourceId[]) {
    if (rid === 'etoiles') continue
    freeProduction[rid] = freeProduction[rid].mul(pm)
  }
  for (const stage of [petrissageStage, cuissonStage, venteStage]) {
    for (const rid of Object.keys(stage.produces) as ResourceId[]) {
      if (rid === 'etoiles') continue
      stage.produces[rid] = stage.produces[rid]!.mul(pm)
    }
    for (const rid of Object.keys(stage.consumes) as ResourceId[]) {
      if (rid === 'etoiles') continue
      stage.consumes[rid] = stage.consumes[rid]!.mul(pm)
    }
  }

  const stages = [petrissageStage, cuissonStage, venteStage]

  // ── Net (pour affichage, sans throttle) ────────────────────
  const net = { ...freeProduction }
  for (const stage of stages) {
    for (const [rid, val] of Object.entries(stage.produces)) {
      net[rid as ResourceId] = net[rid as ResourceId].add(val!)
    }
    for (const [rid, val] of Object.entries(stage.consumes)) {
      net[rid as ResourceId] = net[rid as ResourceId].sub(val!)
    }
  }

  return { freeProduction, stages, net }
}

function addTo(record: Partial<Record<ResourceId, Decimal>>, key: ResourceId, value: Decimal) {
  record[key] = (record[key] ?? new Decimal(0)).add(value)
}

// ─── Clamped delta ───────────────────────────────────────────────

/**
 * Applique la production avec clamping par étape du pipeline.
 * Chaque étape est throttlée indépendamment : si le fournil manque
 * de pâte il s'arrête, mais le pétrin continue de tourner.
 */
export function calcClampedDelta(
  result: ProductionResult,
  resources: Record<ResourceId, { amount: Decimal }>,
  delta: number,
): Record<ResourceId, Decimal> {
  const d = new Decimal(delta)
  const deltas = emptyRecord()

  // 1. Production libre — toujours appliquée
  for (const rid of Object.keys(deltas) as ResourceId[]) {
    deltas[rid] = result.freeProduction[rid].mul(d)
  }

  // 2. Simuler le stock courant (stock actuel + free production ce tick)
  const simStock = emptyRecord()
  for (const rid of Object.keys(simStock) as ResourceId[]) {
    simStock[rid] = resources[rid].amount.add(deltas[rid])
  }

  // 3. Chaque étape pipeline : throttle indépendant
  for (const stage of result.stages) {
    // Calculer le ratio de throttle pour cette étape
    let throttle = new Decimal(1)
    for (const [rid, consumed] of Object.entries(stage.consumes)) {
      if (!consumed || consumed.isZero()) continue
      const needed = consumed.mul(d)
      const available = Decimal.max(simStock[rid as ResourceId], 0)
      const ratio = Decimal.min(available.div(needed), 1)
      throttle = Decimal.min(throttle, ratio)
    }

    // Appliquer la consommation throttlée
    for (const [rid, consumed] of Object.entries(stage.consumes)) {
      if (!consumed || consumed.isZero()) continue
      const effective = consumed.mul(d).mul(throttle)
      deltas[rid as ResourceId] = deltas[rid as ResourceId].sub(effective)
      simStock[rid as ResourceId] = simStock[rid as ResourceId].sub(effective)
    }

    // Appliquer la production throttlée
    for (const [rid, produced] of Object.entries(stage.produces)) {
      if (!produced || produced.isZero()) continue
      const effective = produced.mul(d).mul(throttle)
      deltas[rid as ResourceId] = deltas[rid as ResourceId].add(effective)
      simStock[rid as ResourceId] = simStock[rid as ResourceId].add(effective)
    }
  }

  return deltas
}

// ─── Prestige ────────────────────────────────────────────────────

export function calcEtoilesGagnees(totalCroissants: Decimal): Decimal {
  if (totalCroissants.lte(0)) return new Decimal(0)
  return Decimal.max(totalCroissants.div(1e6).sqrt().floor(), 0)
}

export function calcBonusPrestige(etoiles: Decimal): Decimal {
  return etoiles.mul(0.1).add(1)
}
