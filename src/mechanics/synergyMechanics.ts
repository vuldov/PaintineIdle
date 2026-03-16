/**
 * Synergy mechanics — pure functions only.
 * Calculates all synergy bonuses from building auras, upgrade effects, and combos.
 * No store imports, no side-effects.
 */
import Decimal from 'decimal.js'
import type { ProductId, Building, BuildingData, Upgrade } from '@/types'
import type { SynergyBonuses, ComboBoulangerie } from '@/types/synergies'

// ─── Default (neutral) synergy bonuses ───────────────────────────

/**
 * Returns a SynergyBonuses object with all neutral values.
 * Used for backward compatibility when synergies are not computed.
 */
export function getDefaultSynergyBonuses(): SynergyBonuses {
  return {
    productionMultipliers: {},
    globalProductionMultiplier: new Decimal(1),
    sellMultipliers: {},
    globalSellMultiplier: new Decimal(1),
    craftingSpeedMultipliers: {},
    ingredientMultipliers: {},
    activeCombos: [],
  }
}

// ─── Helpers ────────────────────────────────────────────────────

function addToMult(record: Record<string, Decimal>, key: string, bonus: Decimal): void {
  record[key] = (record[key] ?? new Decimal(1)).add(bonus)
}

// ─── Main calculation ───────────────────────────────────────────

export interface SynergyCalcInput {
  /** All buildings across all products, keyed by building ID string */
  allBuildings: Record<string, Building>
  /** All building data definitions, keyed by building ID string */
  allBuildingData: Record<string, BuildingData>
  /** All purchased upgrades (already filtered to only purchased ones) */
  purchasedUpgrades: Upgrade[]
  /** Products that are actively producing (have at least 1 building with count > 0 in cuisson or full_pipeline) */
  activeProductIds: ProductId[]
  /** Combo definitions to evaluate */
  comboDefinitions: ComboBoulangerie[]
  /** Total building count across all products (for scaling upgrades) */
  totalBuildingCount: number
  /** Total purchased upgrade count (for scaling upgrades) */
  totalUpgradeCount: number
  /** For cross-product upgrades that reference resource totalEarned */
  resourceTotals: Record<string, Decimal>
}

/**
 * Calculate all synergy bonuses from building auras, upgrades, and combos.
 * Pure function.
 */
export function calcSynergyBonuses(input: SynergyCalcInput): SynergyBonuses {
  const result = getDefaultSynergyBonuses()

  // ── 1. Building auras ──────────────────────────────────────
  for (const [bid, building] of Object.entries(input.allBuildings)) {
    if (building.count <= 0) continue
    const data = input.allBuildingData[bid]
    if (!data?.aura) continue

    const aura = data.aura
    const bonus = aura.bonusPerBuilding.mul(building.count)

    switch (aura.effectType) {
      case 'crafting_speed_bonus': {
        if (aura.targetRecipe) {
          // Specific recipe
          addToMult(result.craftingSpeedMultipliers, aura.targetRecipe, bonus)
        } else {
          // Global crafting speed — add to a special '_global' key
          addToMult(result.craftingSpeedMultipliers, '_global', bonus)
        }
        break
      }
      case 'production_bonus': {
        if (aura.targetProduct) {
          addToMult(result.productionMultipliers, aura.targetProduct, bonus)
        } else {
          // Global production
          result.globalProductionMultiplier = result.globalProductionMultiplier.add(bonus)
        }
        break
      }
      case 'global_production_bonus': {
        result.globalProductionMultiplier = result.globalProductionMultiplier.add(bonus)
        break
      }
      case 'sell_price_bonus': {
        if (aura.targetProduct) {
          addToMult(result.sellMultipliers, aura.targetProduct, bonus)
        } else {
          // Global sell
          result.globalSellMultiplier = result.globalSellMultiplier.add(bonus)
        }
        break
      }
      case 'ingredient_generation_bonus': {
        if (aura.targetResource) {
          addToMult(result.ingredientMultipliers, aura.targetResource, bonus)
        } else {
          // Global ingredient generation
          addToMult(result.ingredientMultipliers, '_global', bonus)
        }
        break
      }
      case 'all_speed_bonus': {
        // Boosts both crafting speed and production globally
        addToMult(result.craftingSpeedMultipliers, '_global', bonus)
        result.globalProductionMultiplier = result.globalProductionMultiplier.add(bonus)
        break
      }
      case 'cross_product_bonus': {
        if (aura.crossProductTarget) {
          addToMult(result.productionMultipliers, aura.crossProductTarget, bonus)
        }
        break
      }
    }
  }

  // ── 2. Purchased upgrade synergy effects ───────────────────
  for (const upgrade of input.purchasedUpgrades) {
    const effect = upgrade.effect

    switch (effect.type) {
      case 'specialization': {
        // scalingBonus: based on building count / divisor
        if (effect.scalingBonus) {
          const sb = effect.scalingBonus
          let count = 0
          if (sb.scalingBuildingId) {
            const building = input.allBuildings[sb.scalingBuildingId as string]
            count = building?.count ?? 0
          }
          const divisor = sb.scalingDivisor ?? 1
          const scaledBonus = sb.bonusPerUnit.mul(Math.floor(count / divisor))

          switch (sb.bonusType) {
            case 'global':
              result.globalProductionMultiplier = result.globalProductionMultiplier.add(scaledBonus)
              break
            case 'production':
              // The multiplier from the upgrade itself handles the per-product boost
              break
            case 'sell':
              result.globalSellMultiplier = result.globalSellMultiplier.add(scaledBonus)
              break
          }
        }
        break
      }

      case 'cross_product_synergy': {
        if (effect.crossProductEffect) {
          const cpe = effect.crossProductEffect
          // Look up source value
          let sourceValue = new Decimal(0)
          if (cpe.sourceResource) {
            sourceValue = input.resourceTotals[cpe.sourceResource] ?? new Decimal(0)
          } else if (cpe.sourceProduct) {
            // Use building count from source product buildings
            // Sum all building counts for that product
            let buildingCount = 0
            for (const [bid, building] of Object.entries(input.allBuildings)) {
              const data = input.allBuildingData[bid]
              if (data && data.scope === cpe.sourceProduct) {
                buildingCount += building.count
              }
            }
            sourceValue = new Decimal(buildingCount)
          }

          const divisor = cpe.scalingDivisor ?? 1
          const scaledValue = sourceValue.div(divisor).floor()
          const bonus = cpe.bonusPerUnit.mul(scaledValue)

          if (bonus.gt(0)) {
            if (cpe.bonusType === 'sell') {
              addToMult(result.sellMultipliers, cpe.targetProduct, bonus)
            } else if (cpe.bonusType === 'production') {
              addToMult(result.productionMultipliers, cpe.targetProduct, bonus)
            }
          }
        }
        break
      }

      case 'scaling': {
        if (effect.scalingEffect) {
          const se = effect.scalingEffect
          let sourceCount = 0

          switch (se.source) {
            case 'total_buildings':
              sourceCount = input.totalBuildingCount
              break
            case 'total_upgrades':
              sourceCount = input.totalUpgradeCount
              break
            case 'building_count':
              if (se.sourceBuildingId) {
                const building = input.allBuildings[se.sourceBuildingId as string]
                sourceCount = building?.count ?? 0
              }
              break
          }

          const divisor = se.scalingDivisor ?? 1
          const scaledCount = Math.floor(sourceCount / divisor)
          const bonus = se.bonusPerUnit.mul(scaledCount)

          if (bonus.gt(0)) {
            switch (se.bonusType) {
              case 'global_production':
                result.globalProductionMultiplier = result.globalProductionMultiplier.add(bonus)
                break
              case 'sell':
                result.globalSellMultiplier = result.globalSellMultiplier.add(bonus)
                break
            }
          }
        }
        break
      }

    }
  }

  // ── 3. Combo evaluation ────────────────────────────────────
  const activeSet = new Set<string>(input.activeProductIds)

  for (const combo of input.comboDefinitions) {
    const allPresent = combo.requiredProducts.every(p => activeSet.has(p))
    if (!allPresent) continue

    result.activeCombos.push(combo)

    switch (combo.bonusType) {
      case 'sell':
        result.globalSellMultiplier = result.globalSellMultiplier.add(combo.bonusMultiplier)
        break
      case 'production':
        result.globalProductionMultiplier = result.globalProductionMultiplier.add(combo.bonusMultiplier)
        break
      case 'global':
        result.globalProductionMultiplier = result.globalProductionMultiplier.add(combo.bonusMultiplier)
        result.globalSellMultiplier = result.globalSellMultiplier.add(combo.bonusMultiplier)
        break
    }
  }

  return result
}
