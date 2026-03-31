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
- **Des milestones** auto-générés à chaque palier de bâtiment

## Pipeline de production

Chaque produit déclare un **pipeline** avec des étapes (ex. `pétrissage → cuisson → vente`). Chaque étape consomme les ressources intermédiaires en amont et produit celles en aval. La production est limitée par la ressource la plus lente (logique de bottleneck).

## Synergies

Quand plusieurs produits sont actifs, des bonus de synergie se débloquent :
- **Auras** : chaque bâtiment apporte un bonus passif (production, vente, crafting, cross-produit...)
- **Combos Boulangerie** :
  - **Duo classique** (Croissants + Chocolatines) : +10% vente
  - **Trio boulangerie** (+ Curry Wurst) : +20% production
  - **Empire complet** (les 4 produits) : +50% vente
- **Upgrades de synergie** : spécialisation, cross-produit, scaling — des améliorations transversales

## Mécaniques principales

- **Crafting** : transformez les ingrédients bruts en produits intermédiaires puis finis (manuel ou auto-craft)
- **Bâtiments** : automatisez chaque étape de la chaîne, avec des coûts exponentiels et achat en masse
- **Fournisseurs** : signez des contrats (5 tiers : Artisanal → Import mondial) avec un slider de débit 0-100%
- **Milestones** : paliers de bâtiments (1, 5, 10, 25, 50, 75, 100, 150, 200, 250) avec des bonus permanents
- **Upgrades** : multiplicateurs de production, vitesse de crafting, réduction de coûts, synergies cross-produit
- **Progression offline** : calcul au chargement, jusqu'à 8h max
- **Sauvegarde automatique** toutes les 30s (IndexedDB) + export/import base64

## Game loop

Le loop tourne via `requestAnimationFrame` (~60 fps). Quand l'onglet est en arrière-plan, bascule automatique sur un `setInterval` de 1s. Delta cappé à 1s (2s en background).

Chaque tick :
1. Avancer les crafts en cours
2. Calculer les synergies (auras + upgrades + combos)
3. Calculer la production totale de tous les produits débloqués
4. Appliquer les deltas de ressources (clampés, jamais négatifs)
5. Tick des contrats fournisseurs
6. Mettre à jour les taux /seconde affichés
7. Vérifier les déblocages (bâtiments, ressources, produits)

## Écran de bienvenue

Une modale d'accueil s'affiche au premier lancement, expliquant le but du jeu et les mécaniques de base. Elle ne réapparaît plus après fermeture (flag `localStorage`).

## Écran de victoire

Une modale de victoire s'affiche quand le joueur achète l'upgrade ultime de synergie, marquant la fin de la partie.

## Sauvegarde

| Paramètre | Valeur |
|-----------|--------|
| Stockage | IndexedDB (`paintine_idle`) avec fallback localStorage |
| Autosave | Toutes les 30 secondes + au `beforeunload` |
| Offline max | 8 heures |
| Version actuelle | 9 (saves < v8 supprimées) |
| Export/Import | Base64 via la modale Paramètres |
| Hard reset | Wipe complet + suppression de la save |

## Formatage des nombres

Convention française via `formatNumber()` :
- `< 1 000` → entier avec espace fine (`1 234`)
- `>= 1 000` → abrégé avec virgule (`1,23M`)
- Suffixes : K, M, Md, B, T, Qa, Qi, Sx, Sp, Oc, No, Dc
- Au-delà → notation scientifique (`1,23e42`)

## Paramètres

Accessible via l'icône engrenage :
- **Sauvegarde** — save manuelle, export, import, hard reset
- **Langue** — sélecteur (seul le français est actif pour l'instant)
- **Cheats** — panneau de dev caché, accessible via `showCheats()` dans la console du navigateur

## Stack technique

| Dépendance | Version | Rôle |
|------------|---------|------|
| React | 19 | UI framework |
| TypeScript | ~5.9 | Typage |
| Zustand | 5 | State management (un store par domaine) |
| Vite | 8 | Build et dev server |
| Tailwind CSS | 4 | Styling |
| Decimal.js | 10 | Arithmétique de précision pour toutes les valeurs de jeu |
| i18next | 25 | Internationalisation |
| idb | 8 | Wrapper IndexedDB pour la persistence |
| Vitest | 4 | Tests unitaires |

## Lancer le projet

```bash
# Installation
npm install

# Développement
npm run dev

# Build production
npm run build

# Preview du build
npm run preview

# Lint
npm run lint

# Tests
npm run test

# Tests en watch mode
npm run test:watch
```

## Structure du projet

```
src/
├── types/              # Interfaces TypeScript (Resource, Building, Upgrade...)
├── mechanics/          # Fonctions pures : calculs, formules, synergies (+ tests)
├── store/              # Stores Zustand (resource, building, upgrade, crafting, product, supplier, synergy, toast)
├── hooks/              # useGameLoop, useAutoSave
├── components/
│   ├── ui/             # Composants génériques (GameEmoji, NumberDisplay, ToastContainer)
│   └── game/           # Composants métier (BatimentCard, CraftingPanel, ResourceBar, SupplierPanel, SynergyPanel, WelcomeModal, VictoryModal...)
├── lib/
│   ├── products/       # Bundles par produit (croissants, chocolatines, curry_wurst, pizzas)
│   ├── synergies/      # Combos et upgrades de synergie
│   ├── milestones/     # Génération automatique des milestones
│   ├── formatNumber.ts # Formateur de nombres FR
│   ├── constants.ts    # Constantes globales (version, timers, tiers)
│   └── storage.ts      # Couche de persistence IndexedDB/localStorage
└── i18n/               # Traductions (FR uniquement pour l'instant)
    └── locales/fr/
        ├── common.json
        ├── settings.json
        ├── synergies.json
        ├── milestones.json
        └── products/   # Un fichier par produit
```

## Déploiement

```bash
npm run build   # → /dist (site statique)
```

Déployé sur un VPS OVH via Nginx. Pas de backend — toutes les données sont côté client (IndexedDB).

## Auteur

Fait avec ❤ par Lucas Antonelli
