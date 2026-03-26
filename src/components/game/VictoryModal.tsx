import { useState } from 'react'
import { useUpgradeStore } from '@/store/upgradeStore'
import { ULTIMATE_UPGRADE_ID } from '@/lib/synergies/synergyUpgrades'
import {useTranslation} from "react-i18next";

export function VictoryModal() {
  const { t } = useTranslation('common')
  const purchased = useUpgradeStore(
    (s) => s.upgrades[ULTIMATE_UPGRADE_ID as string]?.purchased ?? false,
  )
  const [dismissed, setDismissed] = useState(false)

  if (!purchased || dismissed) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative mx-4 max-w-lg w-full bg-gradient-to-b from-amber-100 to-amber-50 rounded-2xl shadow-2xl border-2 border-amber-400 overflow-hidden">
        {/* Saucisse planet */}
        <div className="text-center pt-8 pb-2">
          <span className="text-8xl block animate-spin-slow">🌭</span>
        </div>

        {/* Title */}
        <div className="text-center px-6 pb-4">
          <h2 className="text-3xl font-extrabold text-amber-900 mb-2">
            {t('victory.title')}
          </h2>
          <p className="text-amber-700 text-lg font-medium">
            {t('victory.saucisse')}
          </p>
        </div>

        {/* Message */}
        <div className="px-6 pb-6 space-y-3 text-center">
          <p className="text-amber-800">
            {t('victory.subtitle')}
          </p>
          <p className="text-amber-800">
            {t('victory.subtitle2')}
          </p>
          <p className="text-amber-600 text-sm italic mt-4">
            {t('victory.thanks')}
          </p>
          <p className="text-amber-500 text-xs">
            {t('app.footer')}
          </p>

          <button
            onClick={() => setDismissed(true)}
            className="mt-4 px-6 py-2 bg-amber-800 text-amber-50 rounded-lg font-semibold hover:bg-amber-700 transition-colors cursor-pointer"
          >
            {t('victory.continue')}
          </button>
        </div>

        {/* Floating saucisses decoration */}
        <div className="absolute top-2 left-4 text-2xl opacity-40 animate-bounce">🌭</div>
        <div className="absolute top-6 right-6 text-xl opacity-30 animate-bounce" style={{ animationDelay: '0.3s' }}>🌭</div>
        <div className="absolute bottom-4 left-8 text-lg opacity-25 animate-bounce" style={{ animationDelay: '0.6s' }}>🌭</div>
        <div className="absolute bottom-6 right-4 text-2xl opacity-35 animate-bounce" style={{ animationDelay: '0.9s' }}>🌭</div>
      </div>
    </div>
  )
}
