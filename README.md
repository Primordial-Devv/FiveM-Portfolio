# FiveM Portfolio

Portfolio FiveM construit avec SvelteKit (Svelte 5, runes) et TypeScript.

## Stack

- SvelteKit + Svelte 5 + TypeScript
- Tailwind CSS 4 (plugins typography et forms)
- shadcn-svelte (preset Vega, icônes Lucide) sur bits-ui
- Threlte (`@threlte/core`, `@threlte/extras`) + three.js
- mode-watcher pour le thème clair/sombre, svelte-sonner pour les toasts
- State manager : classes runes dans `src/lib/state`, partagées via le contexte Svelte
- ESLint, Prettier, Vitest (unitaires en Node, composants en navigateur via Playwright)

## Direction artistique

Dark mode forcé, inspiré de Nyx et des ressources Siku (banking, hud, inventory).

- Accent froid `#6cb6f6` (hover `#8ac8fb`, texte `#9ed0fb`), violet secondaire `#a18cff` pour les dégradés
- Fond `rgb(11, 12, 14)`, surfaces et bordures en blanc translucide, panneaux glass avec `backdrop-filter`
- Inter Variable, base 15px / 1.6, mono tabulaire pour les chiffres
- Tokens `--sk-*` et classes `sk-panel`, `sk-glass`, `sk-row`, `sk-tile`, `sk-field`, `sk-btn`, `sk-chip`, `sk-badge`, `sk-label`, `sk-eyebrow`, `sk-title`, `sk-mono`, `sk-scroll`, `sk-haze`, `sk-pulse`, `sk-in`, `sk-gradient-text`, `sk-gradient-border` dans `src/routes/layout.css`
- Utilitaires Tailwind générés : `text-sk-*`, `bg-sk-*`, `border-sk-*`, `shadow-glow`, `shadow-glass`, `shadow-panel`, `rounded-panel`, `rounded-tile`, `rounded-control`, `rounded-badge`
- Fond de page en couches (dégradés, grille 56px, grain, vignette) dans `src/lib/components/layout/Background.svelte`

## Scène 3D

La scène principale (workstation) vit dans `src/lib/scene` et sert de hero.

- `MainScene.svelte` : Canvas Threlte (DPR plafonné à 1.5, ombres PCF soft, tone mapping ACES), assemble caméra, éclairage, pièce, workstation, racks et chaise
- `camera/anchors.ts` et `camera/MainCamera.svelte` : ancres caméra nommées, prêtes pour les futurs déplacements
- `Lighting.svelte` : environment map générée (RoomEnvironment), key light directionnelle avec ombres, fill, rim froid, deux lumières pratiques, contact shadows
- `props/` : un composant par objet (Desk, Riser, Monitor(s), Keyboard, Mouse, DeskMat, PC, ServerRack, Chair, Accessories)
- `materials/index.ts` : matériaux PBR partagés entre tous les props, `materials/floor-texture.ts` génère la texture de dalles du sol
- `layout.ts` : dimensions et position du bureau, du riser et de la pièce
- `refs.svelte.ts` : registre des meshes importants (écrans, props) pour les futurs hotspots et RenderTextures
- Touches du clavier, unités serveur et LEDs sont instanciées. Le layout des touches est dans `props/keyboard-layout.ts`

Mode debug avec OrbitControls : ouvrir la page avec `?debug` dans l'URL.

## Commandes

```sh
bun install
bun run dev
bun run build
bun run preview
bun run check
bun run lint
bun run format
bun run test
```

## Ajouter un composant shadcn-svelte

```sh
bunx shadcn-svelte@latest add <component>
```

## Structure

- `src/routes` : pages et layout, CSS global dans `src/routes/layout.css`
- `src/lib/components/ui` : composants shadcn-svelte
- `src/lib/components/scene` : scènes Threlte
- `src/lib/components/layout` : header, toggle de thème
- `src/lib/state` : state manager (runes + contexte)

Alias d'import : `#lib` pointe vers `src/lib`.
