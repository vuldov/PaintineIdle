# Paintine Idle 🌭

Un idle game gastronomique dans lequel vous bâtissez un empire culinaire mondial, un produit à la fois.

## Le concept

Vous commencez avec un modeste fournil et quelques croissants. En accumulant des ressources, vous débloquez de nouvelles chaînes de production — chocolatines, curry wurst, pizzas — chacune avec ses propres ingrédients, bâtiments, fournisseurs et améliorations.

Plus votre empire grandit, plus les synergies entre produits se multiplient, jusqu'à... la domination gastronomique totale.

## Produits

| Produit | Description |
|---------|-------------|
| 🥐 **Croissants** | Votre premier produit. Beurre, farine, pâte feuilletée — les classiques. |
| 🍫 **Chocolatines** | Beurre doux, chocolat pâtissier, pâte levée feuilletée. |
| 🌭 **Curry Wurst** | Saucisses végé, épices, ketchup, frites — street food berlinoise. |
| 🍕 **Pizzas** | Tomates, basilic, mozzarella, pâte — la tradition napolitaine. |

Chaque produit possède :
- **Des ingrédients** à accumuler (régénération passive + fournisseurs)
- **Un atelier** avec des recettes de crafting (transformation des ingrédients)
- **Des bâtiments** qui automatisent la production
- **Des fournisseurs** sous contrat pour approvisionner en ingrédients
- **Des améliorations** qui boostent la production et les ventes

## Synergies

Quand plusieurs produits sont actifs, des bonus de synergie se débloquent :
- **Auras** : chaque bâtiment apporte un bonus passif aux autres chaînes
- **Combos** : avoir 2, 3 ou 4 produits actifs donne des multiplicateurs globaux
- **Upgrades de synergie** : des améliorations transversales qui renforcent tout l'empire

## Mécaniques principales

- **Crafting** : transformez les ingrédients bruts en produits intermédiaires puis en produits finis
- **Bâtiments** : automatisez chaque étape de la chaîne, avec des coûts exponentiels
- **Fournisseurs** : signez des contrats pour un flux continu d'ingrédients
- **Milestones** : des paliers de bâtiments (1, 5, 10, 25...) débloquent des bonus permanents
- **Progression offline** : le jeu calcule votre progression quand vous êtes absent (jusqu'à 8h)
- **Sauvegarde automatique** toutes les 30 secondes + export/import manuel

## Stack technique

- **React 19** + **TypeScript**
- **Zustand** pour le state management
- **Vite** pour le build
- **Tailwind CSS 4** pour le styling
- **Decimal.js** pour les grands nombres
- **i18next** pour l'internationalisation
- **Vitest** pour les tests

## Lancer le projet

```bash
# Installation
npm install

# Développement
npm run dev

# Build production
npm run build

# Tests
npm test
```

## Structure du projet

```
src/
├── types/          # Interfaces TypeScript (Resource, Building, Upgrade...)
├── mechanics/      # Fonctions pures : calculs, formules, synergies
├── store/          # Stores Zustand (resource, building, upgrade, product...)
├── hooks/          # Hooks React (useGameLoop, useAutoSave)
├── components/
│   ├── ui/         # Composants génériques (NumberDisplay, ToastContainer)
│   └── game/       # Composants métier (BatimentCard, ResourceBar, UpgradePanel...)
├── lib/            # Utilitaires, définitions de produits, formules de coût
│   ├── products/   # Bundles par produit (croissants, pizzas, etc.)
│   └── synergies/  # Combos et upgrades de synergie
└── i18n/           # Traductions (FR)
```

## Auteur

Fait avec ❤ par Lucas Antonelli
