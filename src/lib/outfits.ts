// Curated outfit library (static — no AI in Phase 1). Picked by temperature, rain and the date.

import type { DayWeather } from "./weather";

export type Temp = "freezing" | "cold" | "mild";

export type Outfit = {
  id: string;
  name: string;
  pieces: string[];
  tag: string;
  temps: Temp[];
  rainproof: boolean;
  only?: string; // "MM-DD": only suggest on that date
};

export const OUTFITS: Outfit[] = [
  {
    id: "wet-flaneur",
    name: "The Wet Flâneur",
    pieces: ["Waterproof trench over a chunky knit", "Merino base layer", "Straight dark denim", "Lug-sole leather boots", "Red wool scarf"],
    tag: "Rain-proof",
    temps: ["cold", "mild"],
    rainproof: true,
  },
  {
    id: "gallery-hours",
    name: "Gallery Hours",
    pieces: ["Long wool coat", "Oversized blazer", "Striped long-sleeve tee", "Wide wool trousers", "Leather sneakers"],
    tag: "Museum day",
    temps: ["cold", "mild"],
    rainproof: false,
  },
  {
    id: "wine-at-eight",
    name: "Wine at Eight",
    pieces: ["Long black coat", "Silk slip skirt", "Opaque tights", "Knee boots", "Tiny gold hoops"],
    tag: "After dark",
    temps: ["cold", "mild"],
    rainproof: false,
  },
  {
    id: "canal-frost",
    name: "Canal Frost",
    pieces: ["Long puffer", "Thermal leggings under trousers", "Beanie & leather gloves", "Waterproof boots", "Thick wool socks"],
    tag: "Below 4°",
    temps: ["freezing"],
    rainproof: true,
  },
  {
    id: "market-layers",
    name: "Market Layers",
    pieces: ["Quilted liner jacket", "Chunky cardigan", "Corduroy trousers", "Chelsea boots", "Mittens on a string (no shame)"],
    tag: "Walk all day",
    temps: ["freezing", "cold"],
    rainproof: false,
  },
  {
    id: "drizzle-standard",
    name: "Drizzle Standard",
    pieces: ["Waxed jacket", "Grey hoodie underneath", "Black straight jeans", "Rubber-sole loafers", "Compact umbrella"],
    tag: "Grey-sky default",
    temps: ["cold", "mild"],
    rainproof: true,
  },
  {
    id: "noel-stroll",
    name: "Noël Stroll",
    pieces: ["Camel coat", "Cream roll-neck", "Pleated midi skirt", "Thick tights", "Loafers with wool socks"],
    tag: "Christmas Day",
    temps: ["freezing", "cold", "mild"],
    rainproof: false,
    only: "12-25",
  },
  {
    id: "oud-nieuw",
    name: "Oud & Nieuw",
    pieces: ["Sequin top under a long coat", "Wide black trousers", "Flat boots for the crowds", "Ear plugs (fireworks!)", "Hat you can lose"],
    tag: "NYE only",
    temps: ["freezing", "cold", "mild"],
    rainproof: false,
    only: "12-31",
  },
  {
    id: "mild-spell",
    name: "Mild Spell",
    pieces: ["Wool overshirt", "Heavy white tee", "Pleated trousers", "Suede sneakers", "Silk scarf"],
    tag: "Above 10°",
    temps: ["mild"],
    rainproof: false,
  },
];

export const tempBand = (high: number): Temp => (high < 4 ? "freezing" : high < 10 ? "cold" : "mild");

export function pickOutfits(w: DayWeather | null, date: string, n = 3): Outfit[] {
  const md = date.slice(5);
  const band = w ? tempBand(w.high) : "cold";
  const wet = (w?.precip ?? 0) >= 50;
  const score = (o: Outfit) =>
    (o.only === md ? 100 : 0) + (o.temps.includes(band) ? 10 : 0) + (wet && o.rainproof ? 5 : 0) - (o.temps.length > 2 ? 1 : 0);
  return OUTFITS.filter((o) => !o.only || o.only === md)
    .sort((a, b) => score(b) - score(a))
    .slice(0, n);
}
