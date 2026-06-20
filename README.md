# Bingo React TS

Un composant de bingo personnalisable : grille 4x4 ou 5x5, phrases tirées au
hasard depuis un fichier JSON, validation/dévalidation des cases au clic, et
un mode "rejouer" qui remélange tout.

## Démarrage rapide

Le projet est un setup Vite + React + TypeScript prêt à l'emploi.

```bash
npm install
npm run dev
```

Puis ouvre l'URL affichée dans le terminal (en général
`http://localhost:5173`). Pour générer une version de production :

```bash
npm run build
npm run preview   # pour servir le build localement
```

Tout a été testé de bout en bout (install, dev, build) avec Node récent ;
si tu as une vieille version de Node, mets à jour si `npm install` échoue.

## Fichiers

- `phrases.json` — la liste des phrases candidates. Modifie ce fichier pour
  changer le contenu du bingo (une chaîne par phrase, format JSON array).
- `Bingo.tsx` — le composant principal.
- `Bingo.css` — les styles (classes préfixées `bingo-` pour éviter les
  collisions).
- `App.tsx` — exemple minimal d'intégration.

## Installation dans un autre projet existant

Si tu veux réutiliser le composant ailleurs (pas le projet fourni ici) :

1. Copie `phrases.json`, `Bingo.tsx` et `Bingo.css` dans ton dossier `src`
   (ou `src/components`).
2. Si tu utilises Vite/CRA, l'import JSON fonctionne nativement. Avec un
   autre bundler, vérifie que le support JSON est activé
   (`resolveJsonModule: true` dans `tsconfig.json`, déjà fait dans ce
   projet).
3. Importe et utilise le composant :

```tsx
import Bingo from "./Bingo";

<Bingo />
```

## Props

```ts
interface BingoProps {
  phrases?: string[];   // par défaut: contenu de phrases.json
  defaultSize?: 4 | 5;   // par défaut: 5
}
```

Tu peux donc passer une autre liste de phrases sans toucher au JSON :

```tsx
<Bingo phrases={["A", "B", "C", "D", ...]} defaultSize={4} />
```

## Comportement

- **Choix de la taille** : boutons `4x4` / `5x5`. Changer la taille avant le
  début de partie régénère automatiquement la grille. Les boutons sont
  désactivés une fois la partie lancée (pour éviter de casser l'état en
  plein jeu).
- **Mélanger** : régénère une grille aléatoire (nouvelles phrases tirées
  du pool, nouvel ordre) sans démarrer la partie.
- **Lancer la partie** : fige la grille actuelle et active le clic sur les
  cases.
- **Clic sur une case** : bascule entre "validée" (colorée) et "normale".
  Tu peux donc valider puis dévalider une case par erreur.
- **Rejouer** : régénère une grille (mélange + nouvelles phrases) ET reset
  toutes les cases cochées, puis repasse en mode "avant-partie" (il faut
  recliquer sur "Lancer la partie").
- **Mode nuit** : bouton 🌙/☀️ en haut à droite. Le choix est mémorisé dans
  le navigateur (`localStorage`) et respecte la préférence système au
  premier chargement.
- **Lignes/colonnes/diagonales complétées** : dès qu'une case complète une
  ligne, une colonne ou une des deux diagonales, une animation de
  confettis se déclenche, un son de victoire est joué, et le compteur
  "X ligne(s) complète(s)" à côté du statut s'incrémente. Si tu décoches
  une case qui casse une ligne complétée, le compteur redescend
  immédiatement (c'est recalculé en direct, pas juste incrémenté).

## Son de victoire

Le projet ne contient pas de fichier audio par défaut : "Legends Never
Die" est une chanson protégée par des droits d'auteur (League of
Legends / Worlds) que je ne peux ni fournir ni générer.

Deux options :

1. **Ne rien faire** : un petit son de victoire synthétisé (4 notes via
   Web Audio API) est joué automatiquement à la place, aucune dépendance
   externe nécessaire.
2. **Utiliser ton propre fichier** : dépose ton `.ogg`/`.mp3` dans
   `public/` (ex: `public/legends-never-die.ogg`) puis passe son chemin
   en prop :

   ```tsx
   <Bingo victorySoundUrl="/legends-never-die.ogg" />
   ```

   C'est déjà configuré ainsi dans `App.tsx` fourni — il suffit d'ajouter
   le fichier dans `public/` pour que ça marche (voir
   `public/AUDIO_README.txt`).

## Anti-doublons

Les phrases ne sont jamais répétées dans une même grille. La grille pioche
des phrases **uniques** dans `phrases.json` :

- 4x4 → 16 phrases nécessaires
- 5x5 → 25 phrases nécessaires

Le fichier fourni contient 25 phrases, donc les deux tailles fonctionnent
sans aucune répétition. Si tu retires des phrases au point de tomber
sous le nombre nécessaire, la grille sera simplement plus petite que prévu
(cases manquantes) plutôt que de dupliquer une phrase — un avertissement
s'affiche dans la console en mode dev (`npm run dev`) pour te prévenir.

## Détails d'implémentation

- Le tirage aléatoire utilise un Fisher-Yates shuffle classique.
- La grille ne contient jamais de phrase dupliquée (voir section
  "Anti-doublons" plus haut).
- La détection de ligne/colonne/diagonale est recalculée à chaque clic à
  partir de l'état réel des cases cochées (pas d'incrémentation
  approximative), donc cocher/décocher reste toujours cohérent avec le
  compteur affiché.
- Le thème clair/sombre s'applique via l'attribut `data-bingo-theme` sur
  `<html>` et des variables CSS custom — aucune dépendance à une lib de
  theming.
- Aucune dépendance externe : juste React + TypeScript (le son de secours
  utilise l'API Web Audio native du navigateur).
