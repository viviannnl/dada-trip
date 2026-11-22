# Europe, Unfolded.

**A travel planner disguised as an experimental art magazine.**

Dada collage and *Ray Gun*-era editorial layout on top of a real, working trip planner: itinerary,
weather, outfits, maps and a pre-departure checklist. The art direction comes first; the features live
inside it.

> Surface chaos, underlying order — headlines can rotate, overlap and bleed off the page, but dates,
> buttons and checklists always stay legible and keyboard-usable.

---

## Quick start

Requires Node 20+.

```bash
npm install
npm run dev:demo     # "Issue Nº 00 — The Dada Grand Tour", a fully populated demo trip
# or
npm run dev          # your own trip (see "Planning your own trip" below)
```

Open <http://localhost:3000>. No API keys or accounts are needed.

## What's inside

| Section | What it does |
|---|---|
| **Cover** | Oversized masthead, live countdown, ransom-note route ("Re-cut the collage" reshuffles it), editable stays per city, photo clippings |
| **Route map** | Newsprint-styled map, city rubber stamps joined by a red dashed line, leg distances |
| **Itinerary** | Day strip coloured by city; per-day plan with add / edit / delete, drag-or-arrow reorder, unfoldable notes, travel-day and holiday labels |
| **Day map** | Numbered pins in plan order with a dashed path and your stay; drag a pin to correct it, tap one to jump to its card |
| **Weather** | Real forecast within 16 days; beyond that, the 10-year average for that exact date |
| **Outfits** | Curated looks chosen by temperature, rain and date (no AI); pin a look to a day |
| **Checklist** | Categories, add / delete, a big progress headline, *DONE* stamps |

**Interactions:** a once-per-session intro slammed together from cut-out letters, direction-aware page
transitions (pages tear out and drop in), sideways day turns, ransom-letter loaders, black-and-white photos
that develop into colour on hover, wobbling stamps. All motion respects `prefers-reduced-motion`.

## The demo issue

`npm run dev:demo` loads *The Dada Grand Tour*: Zürich → Berlin → Amsterdam → Paris, following the Dada
movement. It has 43 activities with notes, pinned outfits, stays and a half-finished checklist.

- Dates are **relative to today** (the trip always departs in 7 days), so the countdown looks right and the
  first days get a real weather forecast whenever you demo.
- Coordinates are pre-baked, so every map renders instantly.
- Demo edits are stored separately from your own trip's.

## Planning your own trip

Your trip lives in **`src/data/trip.local.json`**, which is git-ignored, so real cities and dates never get
committed. It's created from `src/data/trip.example.json` the first time you install.

```jsonc
{
  "trip": {
    "id": "my-trip",
    "issue": "01",
    "season": "Spring 27",
    "cities": [
      {
        "slug": "rome", "name": "Rome", "country": "Italy",
        "lat": 41.9028, "lon": 12.4964,
        "start": "2027-04-10", "end": "2027-04-14",      // arrival / departure
        "stay": { "name": "", "address": "", "checkIn": "" },
        "stampColor": "red"                               // red | blue | olive
      }
    ]
  },
  "plans": { "2027-04-10": [{ "id": "a1", "time": "", "title": "Arrive", "place": "Rome", "kind": "transit" }] },
  "tasks": [{ "id": "t1", "label": "Passport valid", "category": "Documents", "done": false }]
}
```

- Activity `kind`: `food` · `art` · `walk` · `transit` · `night`
- Task `category`: `Documents` · `Transport` · `Stay` · `Clothing` · `Essentials`
- Dates can also be offsets like `"+7"` (7 days from today).

Restart `npm run dev` after editing the file. Everything you change **in the app** (plans, stays, pins,
ticked tasks) is saved in your browser's localStorage, per trip. "Reset this issue" in the cover footer
wipes it.

> Data is per browser in Phase 1, so plans made on your laptop won't appear on your phone.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` | Run or build with your own trip |
| `npm run dev:demo` / `build:demo` | Run or build with the demo issue |
| `npm run lint` | ESLint |
| `npm run ensure-data` | Regenerates `src/data/trip.active.json` and copies the MapLibre worker (runs automatically on install / dev / build) |
| `node scripts/bake-demo-geo.mjs` | Looks up coordinates for demo places after you edit them (check the output for wrong pins) |
| `node scripts/process-images.mjs <manifest.json>` | Turns downloaded scans into the processed images in `public/images/` |

### Where the trip data comes from

The app imports a single generated, git-ignored file, `src/data/trip.active.json`, built by
`scripts/ensure-trip-data.mjs` from the first match:

1. `TRIP_DATA_JSON` environment variable (e.g. on Vercel)
2. `TRIP_SOURCE=demo` → `src/data/trip.demo.json`
3. `src/data/trip.local.json`

## Tech

Next.js 16 (App Router, Cache Components) · React 19.3 (`<ViewTransition>`) · TypeScript · Tailwind CSS 4 ·
Motion · MapLibre GL 6 · lucide-react

| Service | Used for | Key needed |
|---|---|---|
| [Open-Meteo](https://open-meteo.com) | Forecast + historical climate | No |
| [OpenFreeMap](https://openfreemap.org) | Vector map tiles (restyled as newsprint) | No |
| [Photon](https://photon.komoot.io) (OpenStreetMap) | Turning place names into map pins | No |

Only place names are sent to Photon; results are cached in the browser.

### Project layout

```
src/
  app/                 routes: / → /trip/[id] (cover), /itinerary, /checklist
  components/          print.tsx (ransom type, torn paper, stamps, tape), clipping.tsx (photo clippings),
                       paper-map.tsx, day-map.tsx, route-map.tsx, transitions.tsx, intro-splash.tsx, …
  lib/
    trip.ts            trip model + date helpers
    store.ts           localStorage store (per trip id)
    weather.ts         forecast / climate hook
    outfits.ts         curated outfit library + picker
    geo.ts             geocoding with cache
    map-style.ts       newsprint restyle of the basemap
    images.ts          picture manifest + credits
  data/                trip.example.json, trip.demo.json (committed) · trip.local.json, trip.active.json (ignored)
scripts/               data generation, MapLibre worker copy, demo geocoding, image processing
public/images/         processed city photos and fashion plates (b/w + colour)
```

## Design system

- **Colour tokens** in `src/app/globals.css`: paper, newsprint, kraft, ink, red, Hausmann blue, olive. Light
  theme only, on purpose: it's a printed object.
- **Type:** Bodoni Moda (headlines), Anton (posters), Archivo (body), Space Mono (labels), Special Elite
  (typewriter notes).
- **Print devices:** photocopy grain, torn-paper `clip-path`s, halftone dots, tape and SVG rubber stamps,
  all made in CSS/SVG.
- Every bit of "randomness" is **seeded** (`src/lib/seeded.ts`), so server and client render the same collage.

## Picture credits

All pictures are public domain or CC0:

- **Cities:** Photochrom prints, c. 1890–1900, Library of Congress / Detroit Publishing Co.
- **Outfits:** fashion plates from *Gazette du Bon Ton* and *Journal des Dames et des Modes*, 1913–1924,
  Rijksmuseum Amsterdam (CC0), plus one by Charles Martin (public domain).

The full list with source links is in `src/lib/images.ts` and under "Picture credits" in the app's footer.

## Browser support

Modern Chromium, Safari and Firefox. Page transitions use the View Transitions API; browsers without it just
switch pages instantly. Maps need WebGL; if it isn't available, a fallback message with a retry button is shown.

## Roadmap

- **Archive:** stamps collected per city, completed days, trip progress
- Sync across devices (Supabase)
- Deploy a shareable demo on Vercel
