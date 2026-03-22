import Decimal from 'decimal.js'
import type { SupplierData, SupplierState, SupplierUpgradeData, SupplierUpgradeState, SupplierContractTier } from '@/types'
import { SUPPLIER_CONTRACT_TIERS } from '@/lib/constants'

// ─── Contract tier helpers ──────────────────────────────────────

/** Get the tier data for a given contract tier. */
export function getContractTierData(tier: SupplierContractTier) {
  return SUPPLIER_CONTRACT_TIERS[tier]
}

/** Compute the cost to upgrade a supplier to the given target tier. */
export function calcContractUpgradeCost(
  supplierData: SupplierData,
  targetTier: SupplierContractTier,
): Decimal {
  const tierData = SUPPLIER_CONTRACT_TIERS[targetTier]
  return supplierData.contractCost.mul(tierData.costMultiplier)
}

// ─── Effective stats (after upgrades) ─────────────────────────────

/** Compute the effective max rate for a supplier after contract tier and all purchased upgrades. */
export function calcEffectiveMaxRate(
  data: SupplierData,
  upgrades: Record<string, SupplierUpgradeData>,
  upgradeStates: Record<string, SupplierUpgradeState>,
  contractTier: SupplierContractTier = 0,
): Decimal {
  // Start with base rate multiplied by contract tier bonus
  const tierData = SUPPLIER_CONTRACT_TIERS[contractTier]
  let rate = data.baseMaxRate.mul(tierData.rateMultiplier)

  // Then apply individual upgrade multipliers on top
  for (const [id, upData] of Object.entries(upgrades)) {
    if (upData.targetSupplier !== data.id) continue
    if (!upgradeStates[id]?.purchased) continue
    if (upData.effectType === 'max_rate_bonus') {
      rate = rate.mul(upData.effectValue)
    }
  }
  return rate
}

/** Compute the effective cost/sec at full rate for a supplier after all purchased upgrades. */
export function calcEffectiveCostPerSecond(
  data: SupplierData,
  upgrades: Record<string, SupplierUpgradeData>,
  upgradeStates: Record<string, SupplierUpgradeState>,
): Decimal {
  let cost = data.baseCostPerSecond
  for (const [id, upData] of Object.entries(upgrades)) {
    if (upData.targetSupplier !== data.id) continue
    if (!upgradeStates[id]?.purchased) continue
    if (upData.effectType === 'cost_reduction') {
      cost = cost.mul(upData.effectValue)
    }
  }
  return cost
}

// ─── Per-supplier calculations ────────────────────────────────────

/** Production rate (units/sec) for a supplier at its current ratePercent. */
export function calcSupplierProduction(
  effectiveMaxRate: Decimal,
  state: SupplierState,
): Decimal {
  if (!state.unlocked || state.ratePercent <= 0) {
    return new Decimal(0)
  }
  return effectiveMaxRate.mul(state.ratePercent).div(100)
}

/**
 * Cost in paintine coins per second at current production rate.
 * Cost scales with actual production based on the BASE cost-per-unit ratio:
 *   costPerUnit = effectiveCost / baseMaxRate
 *   cost = costPerUnit × actualProduction
 * This means rate upgrades increase production WITHOUT increasing cost proportionally,
 * making each unit cheaper (the whole point of rate upgrades).
 */
export function calcSupplierCostPerSecond(
  effectiveCost: Decimal,
  baseMaxRate: Decimal,
  effectiveMaxRate: Decimal,
  state: SupplierState,
): Decimal {
  if (!state.unlocked || state.ratePercent <= 0 || baseMaxRate.isZero()) {
    return new Decimal(0)
  }
  const actualProduction = effectiveMaxRate.mul(state.ratePercent).div(100)
  const costPerUnit = effectiveCost.div(baseMaxRate)
  return costPerUnit.mul(actualProduction)
}

// ─── Aggregated tick calculation ─────────────────────────────────

export interface SupplierTickEntry {
  supplierId: string
  producedResource: string
  production: Decimal   // units produced this tick (after throttle)
  cost: Decimal         // coins spent this tick (after throttle)
}

export interface SupplierTickResult {
  entries: SupplierTickEntry[]
  /** Flat deltas to feed into resourceStore.applyDeltas(). */
  resourceDeltas: Record<string, Decimal>
  /** Total coins/sec before throttle (for UI display) */
  totalCostPerSecond: Decimal
  /** Per-supplier effective rates for UI display */
  effectiveRates: Record<string, { maxRate: Decimal; costPerSec: Decimal }>
}

/**
 * Calculate the combined effect of all active suppliers for one tick.
 *
 * Applies proportional throttling: if the total coin cost for the tick
 * exceeds available coins, all suppliers are scaled down equally.
 */
export function calcSupplierTick(
  suppliers: Record<string, SupplierState>,
  supplierData: Record<string, SupplierData>,
  supplierUpgrades: Record<string, SupplierUpgradeData>,
  upgradeStates: Record<string, SupplierUpgradeState>,
  availableCoins: Decimal,
  delta: number,
): SupplierTickResult {
  const entries: SupplierTickEntry[] = []
  const resourceDeltas: Record<string, Decimal> = {}
  const effectiveRates: Record<string, { maxRate: Decimal; costPerSec: Decimal }> = {}

  // 1. Compute raw per-second values for each active supplier
  let totalCostPerSecond = new Decimal(0)

  interface RawEntry {
    supplierId: string
    producedResource: string
    productionPerSec: Decimal
    costPerSec: Decimal
  }

  const rawEntries: RawEntry[] = []

  for (const [id, state] of Object.entries(suppliers)) {
    const data = supplierData[id]
    if (!data) continue

    const effectiveMax = calcEffectiveMaxRate(data, supplierUpgrades, upgradeStates, state.contractTier ?? 0)
    const effectiveCost = calcEffectiveCostPerSecond(data, supplierUpgrades, upgradeStates)

    // costPerSec at full effective rate: costPerUnit × effectiveMaxRate
    const costAtFullRate = effectiveCost.div(data.baseMaxRate).mul(effectiveMax)
    effectiveRates[id] = { maxRate: effectiveMax, costPerSec: costAtFullRate }

    const productionPerSec = calcSupplierProduction(effectiveMax, state)
    const costPerSec = calcSupplierCostPerSecond(effectiveCost, data.baseMaxRate, effectiveMax, state)

    if (productionPerSec.isZero()) continue

    rawEntries.push({
      supplierId: id,
      producedResource: data.producedResource as string,
      productionPerSec,
      costPerSec,
    })
    totalCostPerSecond = totalCostPerSecond.add(costPerSec)
  }

  // 2. Compute throttle factor
  const totalCostThisTick = totalCostPerSecond.mul(delta)
  let throttle = new Decimal(1)
  if (totalCostThisTick.gt(0) && totalCostThisTick.gt(availableCoins)) {
    throttle = availableCoins.div(totalCostThisTick)
  }

  // 3. Apply throttle and build results
  let totalCoinCost = new Decimal(0)

  for (const raw of rawEntries) {
    const production = raw.productionPerSec.mul(delta).mul(throttle)
    const cost = raw.costPerSec.mul(delta).mul(throttle)

    entries.push({
      supplierId: raw.supplierId,
      producedResource: raw.producedResource,
      production,
      cost,
    })

    const resId = raw.producedResource
    resourceDeltas[resId] = (resourceDeltas[resId] ?? new Decimal(0)).add(production)
    totalCoinCost = totalCoinCost.add(cost)
  }

  // Subtract coin cost
  if (totalCoinCost.gt(0)) {
    const coinsKey = 'pantins_coins'
    resourceDeltas[coinsKey] = (resourceDeltas[coinsKey] ?? new Decimal(0)).sub(totalCoinCost)
  }

  return { entries, resourceDeltas, totalCostPerSecond, effectiveRates }
}
