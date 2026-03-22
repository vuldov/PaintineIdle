import Decimal from 'decimal.js'
import type {
  Building,
  ResourceId,
  Upgrade,
  ProductBundle,
  PipelineStageConfig,
  BuildingData,
  SynergyBonuses,
} from '@/types'
import { getDefaultSynergyBonuses } from './synergyMechanics'

// ─── Building rates (for display) ──────────────────────────────

export interface RateInfo {
  resource: ResourceId
  amount: Decimal
}

export interface BuildingRates {
  produces: RateInfo[]
  consumes: RateInfo[]
}

/**
 * Calculate effective production and consumption rates per building unit.
 * Includes sell multiplier, resource multipliers, and synergy bonuses when provided.
 * Data-driven: uses the pipeline config from the bundle.
 * Pure function.
 */
export function calcBuildingRates(
  buildingData: BuildingData,
  pipelineStages: PipelineStageConfig[],
  baseProduction: Decimal,
  upgrades: Record<string, Upgrade>,
  baseSellRate?: Decimal,
  extraMultiplier?: Decimal,
  extraSellMultiplier?: Decimal,
): BuildingRates {
  let bMult = new Decimal(1)
  let globalMult = extraMultiplier ?? new Decimal(1)
  let sellMult = baseSellRate ?? new Decimal(1)
  const sellSynergyMult = extraSellMultiplier ?? new Decimal(1)
  const resourceMultipliers: Record<string, Decimal> = {}

  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    if (upgrade.effect.type === 'building_multiplier' && (upgrade.effect.targetBuilding as string) === (buildingData.id as string)) {
      bMult = bMult.mul(upgrade.effect.multiplier)
    }
    if (upgrade.effect.type === 'global_multiplier') {
      globalMult = globalMult.mul(upgrade.effect.multiplier)
    }
    if (upgrade.effect.type === 'sell_multiplier') {
      sellMult = sellMult.mul(upgrade.effect.multiplier)
    }
    if (upgrade.effect.type === 'resource_multiplier') {
      const target = upgrade.effect.targetResource as string | undefined
      if (target) {
        resourceMultipliers[target] = (resourceMultipliers[target] ?? new Decimal(1)).mul(upgrade.effect.multiplier)
      }
    }
    // Handle buildingProductionMultiplier on any upgrade type (milestone dual-effects)
    if (upgrade.effect.buildingProductionMultiplier && (upgrade.effect.targetBuilding as string) === (buildingData.id as string)) {
      bMult = bMult.mul(upgrade.effect.buildingProductionMultiplier)
    }
  }

  const effectiveProd = baseProduction.mul(bMult).mul(globalMult)

  const produces: RateInfo[] = []
  const consumes: RateInfo[] = []

  // Find the matching pipeline stage for this building's role
  const matchingStage = pipelineStages.find(s => s.role === buildingData.pipelineRole)

  if (matchingStage) {
    for (const p of matchingStage.produces) {
      let amount = effectiveProd.mul(p.ratio)
      // Vente stage: apply sell multiplier to coins production
      if (buildingData.pipelineRole === 'vente' && (p.resource as string) === 'pantins_coins' && baseSellRate) {
        amount = amount.mul(sellMult).div(baseSellRate).mul(sellSynergyMult)
      }
      // Apply resource multipliers
      const resMult = resourceMultipliers[p.resource as string]
      if (resMult) amount = amount.mul(resMult)
      produces.push({ resource: p.resource, amount })
    }
    for (const c of matchingStage.consumes) {
      consumes.push({ resource: c.resource, amount: effectiveProd.mul(c.ratio) })
    }
  }

  return { produces, consumes }
}

// ─── Cost calculations ──────────────────────────────────────────

export function calcCost(building: Building, count: number, costReduction?: Decimal): Decimal {
  const base = building.baseCost.mul(Decimal.pow(building.costMultiplier, count))
  return costReduction ? base.mul(costReduction) : base
}

export function calcBulkCost(building: Building, count: number, amount: number, costReduction?: Decimal): Decimal {
  if (amount <= 0) return new Decimal(0)
  const base = building.baseCost
  const r = new Decimal(building.costMultiplier)
  const raw = base.mul(Decimal.pow(r, count)).mul(Decimal.pow(r, amount).sub(1)).div(r.sub(1))
  return costReduction ? raw.mul(costReduction) : raw
}

/** How many buildings can be bought with a given budget */
export function calcMaxAffordable(building: Building, count: number, budget: Decimal, costReduction?: Decimal): number {
  const base = costReduction ? building.baseCost.mul(costReduction) : building.baseCost
  const r = new Decimal(building.costMultiplier)
  // Geometric series inversion: budget = base * r^count * (r^n - 1) / (r - 1)
  // => r^n = budget * (r-1) / (base * r^count) + 1
  // => n = log_r(budget * (r-1) / (base * r^count) + 1)
  const firstCost = base.mul(Decimal.pow(r, count))
  if (firstCost.gt(budget)) return 0
  const inner = budget.mul(r.sub(1)).div(firstCost).add(1)
  if (inner.lte(0)) return 0
  const n = inner.log(r.toNumber())
  return Math.max(0, Math.floor(n.toNumber()))
}

// ─── Cost reduction from upgrades ───────────────────────────────

export function calcCostReduction(upgrades: Record<string, Upgrade>): Decimal {
  let reduction = new Decimal(1)
  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    if (upgrade.effect.type === 'cost_reduction') {
      reduction = reduction.mul(upgrade.effect.multiplier)
    }
  }
  return reduction
}

// ─── Sell multiplier ────────────────────────────────────────────

function calcSellMultiplier(upgrades: Record<string, Upgrade>, baseSellRate: Decimal): Decimal {
  let mult = baseSellRate
  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    if (upgrade.effect.type === 'sell_multiplier') {
      mult = mult.mul(upgrade.effect.multiplier)
    }
  }
  return mult
}

// ─── Production pipeline ────────────────────────────────────────

/** A pipeline stage that consumes resources to produce others */
export interface PipelineStage {
  consumes: Record<string, Decimal>  // /s
  produces: Record<string, Decimal>  // /s
}

export interface ProductionResult {
  /** Free production (regen) -- never throttled */
  freeProduction: Record<string, Decimal>
  /** Pipeline stages: each throttled independently */
  stages: PipelineStage[]
  /** Net for display (free + stages, WITHOUT throttle) */
  net: Record<string, Decimal>
}

function addTo(record: Record<string, Decimal>, key: string, value: Decimal) {
  record[key] = (record[key] ?? new Decimal(0)).add(value)
}

/**
 * Calculate production for a single product. Data-driven via ProductBundle.
 * Pure function -- no store imports, no side-effects.
 */
export function calcProductionForProduct(
  bundle: ProductBundle,
  buildings: Record<string, Building>,
  upgrades: Record<string, Upgrade>,
  synergyBonuses?: SynergyBonuses,
): ProductionResult {
  const synergy = synergyBonuses ?? getDefaultSynergyBonuses()
  const productId = bundle.definition.id
  const freeProduction: Record<string, Decimal> = {}

  // Initialize to zero for all known resources in this product + global
  // (We'll accumulate into these)

  // Build per-stage accumulators
  const stageAccumulators: PipelineStage[] = bundle.pipelineConfig.stages.map(() => ({
    consumes: {},
    produces: {},
  }))

  // ── Upgrade multipliers ───────────────────────────────────
  const buildingMultipliers: Record<string, Decimal> = {}
  let globalMultiplier = new Decimal(1)
  const resourceMultipliers: Record<string, Decimal> = {}

  for (const upgrade of Object.values(upgrades)) {
    if (!upgrade.purchased) continue
    switch (upgrade.effect.type) {
      case 'building_multiplier': {
        const target = upgrade.effect.targetBuilding as string | undefined
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
        const target = upgrade.effect.targetResource as string | undefined
        if (target) {
          const current = resourceMultipliers[target] ?? new Decimal(1)
          resourceMultipliers[target] = current.mul(upgrade.effect.multiplier)
        }
        break
      }
      default:
        break
    }
    // Handle buildingProductionMultiplier on any upgrade type (milestone dual-effects)
    if (upgrade.effect.buildingProductionMultiplier) {
      const target = upgrade.effect.targetBuilding as string | undefined
      if (target) {
        const current = buildingMultipliers[target] ?? new Decimal(1)
        buildingMultipliers[target] = current.mul(upgrade.effect.buildingProductionMultiplier)
      }
    }
  }

  const sellMultiplier = calcSellMultiplier(upgrades, bundle.baseSellRate)

  // ── Synergy multipliers ─────────────────────────────────────
  // Apply global production multiplier from synergies
  globalMultiplier = globalMultiplier.mul(synergy.globalProductionMultiplier)
  // Apply per-product production multiplier from synergies
  const productSynergyMult = synergy.productionMultipliers[productId] ?? new Decimal(1)
  globalMultiplier = globalMultiplier.mul(productSynergyMult)
  // Compute sell synergy multiplier for this product
  const sellSynergyMult = (synergy.sellMultipliers[productId] ?? new Decimal(1))
    .mul(synergy.globalSellMultiplier)
  // ── Passive regen -> free ──────────────────────────────────
  for (const [resId, regen] of Object.entries(bundle.passiveRegen)) {
    addTo(freeProduction, resId, regen)
  }

  // ── Buildings ──────────────────────────────────────────────
  for (const building of Object.values(buildings)) {
    if (building.count <= 0) continue

    const bid = building.id as string
    const buildingData = bundle.buildings[bid]
    if (!buildingData) continue

    const bMult = buildingMultipliers[bid] ?? new Decimal(1)
    const totalMult = bMult.mul(globalMultiplier)
    const baseProd = building.baseProduction.mul(building.count).mul(totalMult)

    // Find which pipeline stage this building belongs to
    const stageIndex = bundle.pipelineConfig.stages.findIndex(
      s => s.role === buildingData.pipelineRole
    )

    if (stageIndex >= 0) {
      const stageConfig = bundle.pipelineConfig.stages[stageIndex]
      const accumulator = stageAccumulators[stageIndex]

      // Apply consumes/produces based on config ratios
      for (const c of stageConfig.consumes) {
        addTo(accumulator.consumes, c.resource as string, baseProd.mul(c.ratio))
      }
      for (const p of stageConfig.produces) {
        addTo(accumulator.produces, p.resource as string, baseProd.mul(p.ratio))
      }

      // Special case for vente: the "sells" use the sell multiplier on coins production
      if (buildingData.pipelineRole === 'vente') {
        // Override the coins production with sell multiplier + synergy sell multiplier
        const coinsKey = 'pantins_coins'
        if (accumulator.produces[coinsKey]) {
          // Remove the base production and re-add with sell multiplier * synergy sell
          const baseCoins = baseProd.mul(stageConfig.produces.find(p => (p.resource as string) === coinsKey)?.ratio ?? new Decimal(1))
          accumulator.produces[coinsKey] = (accumulator.produces[coinsKey] ?? new Decimal(0)).sub(baseCoins).add(baseCoins.mul(sellMultiplier).div(bundle.baseSellRate).mul(sellSynergyMult))
        }
        // Free produces from vente stage
        if (stageConfig.freeProduces) {
          for (const fp of stageConfig.freeProduces) {
            addTo(freeProduction, fp.resource as string, baseProd.mul(fp.ratio))
          }
        }
      }
    }
  }

  // ── Resource multipliers ───────────────────────────────────
  for (const [resId, mult] of Object.entries(resourceMultipliers)) {
    if (freeProduction[resId]) {
      freeProduction[resId] = freeProduction[resId].mul(mult)
    }
    for (const stage of stageAccumulators) {
      if (stage.produces[resId]) {
        stage.produces[resId] = stage.produces[resId].mul(mult)
      }
    }
  }

  // ── Net (for display, without throttle) ────────────────────
  const net: Record<string, Decimal> = {}
  for (const [key, val] of Object.entries(freeProduction)) {
    addTo(net, key, val)
  }
  for (const stage of stageAccumulators) {
    for (const [key, val] of Object.entries(stage.produces)) {
      addTo(net, key, val)
    }
    for (const [key, val] of Object.entries(stage.consumes)) {
      net[key] = (net[key] ?? new Decimal(0)).sub(val)
    }
  }

  return { freeProduction, stages: stageAccumulators, net }
}

// ─── Multi-product total production ─────────────────────────────

export interface TotalProductionResult {
  /** Per-product results */
  perProduct: Record<string, ProductionResult>
  /** Aggregated net across all products (for perSecond display) */
  totalNet: Record<string, Decimal>
  /** Aggregated free production across all products */
  totalFreeProduction: Record<string, Decimal>
  /** All stages from all products */
  allStages: Array<{ productId: string; stage: PipelineStage }>
}

/**
 * Calculate total production across all unlocked products.
 */
export function calcTotalProduction(
  unlockedProducts: string[],
  bundles: Record<string, ProductBundle>,
  allBuildings: Record<string, Record<string, Building>>,
  allUpgrades: Record<string, Upgrade>,
  synergyBonuses?: SynergyBonuses,
): TotalProductionResult {
  const perProduct: Record<string, ProductionResult> = {}
  const totalNet: Record<string, Decimal> = {}
  const totalFreeProduction: Record<string, Decimal> = {}
  const allStages: Array<{ productId: string; stage: PipelineStage }> = []

  for (const productId of unlockedProducts) {
    const bundle = bundles[productId]
    if (!bundle) continue

    const buildings = allBuildings[productId] ?? {}

    // Filter upgrades that belong to this product or are global
    const scopedUpgrades: Record<string, Upgrade> = {}
    for (const [uid, upgrade] of Object.entries(allUpgrades)) {
      if (upgrade.scope === productId || upgrade.scope === 'global') {
        scopedUpgrades[uid] = upgrade
      }
    }

    const result = calcProductionForProduct(bundle, buildings, scopedUpgrades, synergyBonuses)
    perProduct[productId] = result

    // Aggregate nets
    for (const [key, val] of Object.entries(result.net)) {
      addTo(totalNet, key, val)
    }

    // Aggregate free production
    for (const [key, val] of Object.entries(result.freeProduction)) {
      addTo(totalFreeProduction, key, val)
    }

    // Collect stages
    for (const stage of result.stages) {
      allStages.push({ productId, stage })
    }
  }

  return { perProduct, totalNet, totalFreeProduction, allStages }
}

// ─── Clamped delta ──────────────────────────────────────────────

/**
 * Apply production with per-stage throttling.
 * Works with the aggregated TotalProductionResult.
 */
export function calcClampedDelta(
  totalResult: TotalProductionResult,
  resources: Record<string, { amount: Decimal }>,
  delta: number,
): Record<string, Decimal> {
  const d = new Decimal(delta)
  const deltas: Record<string, Decimal> = {}

  // 1. Free production -- always applied
  for (const [key, val] of Object.entries(totalResult.totalFreeProduction)) {
    deltas[key] = val.mul(d)
  }

  // 2. Simulated stock (current + free production this tick)
  const simStock: Record<string, Decimal> = {}
  for (const [key, res] of Object.entries(resources)) {
    simStock[key] = res.amount.add(deltas[key] ?? new Decimal(0))
  }
  // Also ensure we have entries for everything in deltas
  for (const key of Object.keys(deltas)) {
    if (!simStock[key]) {
      simStock[key] = deltas[key]
    }
  }

  // 3. Each pipeline stage: independent throttle
  for (const { stage } of totalResult.allStages) {
    let throttle = new Decimal(1)
    for (const [rid, consumed] of Object.entries(stage.consumes)) {
      if (!consumed || consumed.isZero()) continue
      const needed = consumed.mul(d)
      const available = Decimal.max(simStock[rid] ?? new Decimal(0), 0)
      const ratio = Decimal.min(available.div(needed), 1)
      throttle = Decimal.min(throttle, ratio)
    }

    // Apply throttled consumption
    for (const [rid, consumed] of Object.entries(stage.consumes)) {
      if (!consumed || consumed.isZero()) continue
      const effective = consumed.mul(d).mul(throttle)
      deltas[rid] = (deltas[rid] ?? new Decimal(0)).sub(effective)
      simStock[rid] = (simStock[rid] ?? new Decimal(0)).sub(effective)
    }

    // Apply throttled production
    for (const [rid, produced] of Object.entries(stage.produces)) {
      if (!produced || produced.isZero()) continue
      const effective = produced.mul(d).mul(throttle)
      deltas[rid] = (deltas[rid] ?? new Decimal(0)).add(effective)
      simStock[rid] = (simStock[rid] ?? new Decimal(0)).add(effective)
    }
  }

  return deltas
}

