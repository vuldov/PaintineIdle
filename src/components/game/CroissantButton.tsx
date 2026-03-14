import Decimal from 'decimal.js'
import { useResourceStore } from '@/store/resourceStore'
import { useUpgradeStore } from '@/store/upgradeStore'
import { NumberDisplay } from '@/components/ui/NumberDisplay'
import { calcClickPower } from '@/mechanics/productionMechanics'

export function CroissantButton() {
  const clickCroissant = useResourceStore((state) => state.clickCroissant)
  const amount = useResourceStore((state) => state.resources.croissants.amount)
  const perSecond = useResourceStore((state) => state.resources.croissants.perSecond)
  const upgrades = useUpgradeStore((state) => state.upgrades)

  // Prestige multiplier (pour l'instant toujours 1)
  const prestigeMultiplier = new Decimal(1)
  const clickPower = calcClickPower(upgrades, prestigeMultiplier)

  const handleClick = () => {
    const currentUpgrades = useUpgradeStore.getState().upgrades
    const power = calcClickPower(currentUpgrades, prestigeMultiplier)
    clickCroissant(power)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleClick}
        className="
          w-36 h-36 rounded-full
          bg-amber-400 hover:bg-amber-500 active:bg-amber-600
          active:scale-95 hover:scale-105
          transition-all duration-100
          shadow-lg hover:shadow-xl active:shadow-md
          text-7xl
          cursor-pointer
          select-none
        "
        aria-label="Produire un croissant"
      >
        🥐
      </button>
      <div className="text-center">
        <p className="text-3xl font-bold text-amber-900">
          <NumberDisplay value={amount} />
        </p>
        <p className="text-sm text-amber-700">croissants</p>
        <p className="text-xs text-amber-500 mt-1">
          +<NumberDisplay value={clickPower} /> par clic · <NumberDisplay value={perSecond} />/s
        </p>
      </div>
    </div>
  )
}
