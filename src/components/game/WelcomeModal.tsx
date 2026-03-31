import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const WELCOME_KEY = 'croissant_idle_welcome_shown'

export function WelcomeModal() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(() => !localStorage.getItem(WELCOME_KEY))

  if (!open) return null

  const handleDismiss = () => {
    localStorage.setItem(WELCOME_KEY, '1')
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative max-w-md w-full bg-gradient-to-b from-amber-100 to-amber-50 rounded-2xl shadow-2xl border-2 border-amber-400 overflow-hidden">

        {/* Header */}
        <div className="text-center pt-8 pb-4 px-6">
          <div className="flex justify-center items-center gap-4 mb-3">
            <img
              src="/images/saucisse.png"
              alt="Saucisse"
              className="w-16 h-16 animate-wiggle"
            />
            <img
                src="/images/currywurst.png"
                alt="Saucisse cuite"
                className="w-16 h-16"
            />
            <img
              src="/images/saucisse_cuite.png"
              alt="Saucisse cuite"
              className="w-16 h-16 animate-wiggle-reverse"
            />
          </div>
          <h2 className="text-2xl font-extrabold text-amber-900">
            {t('welcome.title')}
          </h2>
          <p className="text-amber-700 mt-2 text-sm leading-relaxed">
            {t('welcome.intro')}
          </p>
        </div>

        {/* How to play */}
        <div className="px-6 pb-6">
          <h3 className="text-amber-900 font-bold text-sm uppercase tracking-wide mb-3">
            {t('welcome.how_to_play')}
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-amber-800 text-sm">
              <span className="text-base">🏭</span>
              <span dangerouslySetInnerHTML={{ __html: t('welcome.tip_buildings') }} />
            </li>
            <li className="flex items-start gap-2 text-amber-800 text-sm">
              <span className="text-base">⚡</span>
              <span dangerouslySetInnerHTML={{ __html: t('welcome.tip_upgrades') }} />
            </li>
            <li className="flex items-start gap-2 text-amber-800 text-sm">
              <span className="text-base">🤝</span>
              <span dangerouslySetInnerHTML={{ __html: t('welcome.tip_suppliers') }} />
            </li>
            <li className="flex items-start gap-2 text-amber-800 text-sm">
              <span className="text-base">🔓</span>
              <span dangerouslySetInnerHTML={{ __html: t('welcome.tip_unlock') }} />
            </li>
          </ul>

          <button
            onClick={handleDismiss}
            className="mt-6 w-full py-3 bg-amber-800 text-amber-50 rounded-xl font-bold text-base hover:bg-amber-700 active:scale-95 transition-all cursor-pointer"
          >
            {t('welcome.cta')}
          </button>
        </div>
      </div>
    </div>
  )
}
