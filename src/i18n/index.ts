import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import commonFr from './locales/fr/common.json'
import settingsFr from './locales/fr/settings.json'
import synergiesFr from './locales/fr/synergies.json'
import milestonesFr from './locales/fr/milestones.json'
import croissantsFr from './locales/fr/products/croissants.json'
import painsAuChocolatFr from './locales/fr/products/pains_au_chocolat.json'
import curryWurstFr from './locales/fr/products/curry_wurst.json'
import pizzasFr from './locales/fr/products/pizzas.json'

i18n.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'fr',
  defaultNS: 'common',
  ns: [
    'common',
    'settings',
    'synergies',
    'milestones',
    'products/croissants',
    'products/pains_au_chocolat',
    'products/curry_wurst',
    'products/pizzas',
  ],
  resources: {
    fr: {
      common: commonFr,
      settings: settingsFr,
      synergies: synergiesFr,
      milestones: milestonesFr,
      'products/croissants': croissantsFr,
      'products/pains_au_chocolat': painsAuChocolatFr,
      'products/curry_wurst': curryWurstFr,
      'products/pizzas': pizzasFr,
    },
  },
  fallbackNS: 'common',
  interpolation: { escapeValue: false },
})

export default i18n
