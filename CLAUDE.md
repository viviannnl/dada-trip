@AGENTS.md

# dada-trip — "EUROPE, UNFOLDED."

Role: direct

An experimental-editorial (Dada / Ray Gun / zine) travel planner for Vivian's Europe trip.
Principle: **visual-first, functionality-backed** — the art direction leads, real product
features live inside it. Never let it drift into "a dashboard with Dada pictures on top".

## Rules
- Surface chaos, underlying order: decoration may rotate/overlap/overflow; nav, buttons,
  dates and checklist text must stay legible and keyboard-usable.
- All colors/fonts come from tokens in `src/app/globals.css` (`@theme`). No literal hexes in components.
- Randomness must be seeded (`src/lib/seeded.ts`) so SSR and client render match.
- Respect `prefers-reduced-motion`.
- Phase 1 scope: no AI, no uploads. User edits persist to localStorage (`src/lib/store.ts`).
- **Real trip data is private**: it lives in git-ignored `src/data/trip.local.json`. Never commit it or copy
  real cities/dates into tracked files. `src/data/trip.example.json` is the public placeholder;
  `scripts/ensure-trip-data.mjs` (postinstall/predev/prebuild) copies it when the local file is missing,
  or writes `TRIP_DATA_JSON` env (for deploys).
