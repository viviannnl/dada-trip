"use client";

// Place-name → coordinates via Photon (OpenStreetMap, free, no key). Cached per browser.

export type LatLon = { lat: number; lon: number };

const CACHE_KEY = "dada-trip:geo:v1";
const MAX_KM = 60; // anything further than this from the city is probably a wrong match

let cache: Record<string, LatLon | null> | null = null;
const loadCache = () => {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    cache = {};
  }
  return cache!;
};
const saveCache = () => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

export function km(a: LatLon, b: LatLon) {
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r;
  const dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** For "A → B" transit places, the destination is the useful pin. */
export const placeQuery = (place: string) => place.split("→").pop()!.trim();

let queue: Promise<unknown> = Promise.resolve();

/** Sequential (polite to the free service) and cached. Resolves null when nothing sensible is found. */
export function geocode(query: string, near: LatLon): Promise<LatLon | null> {
  const key = `${query.toLowerCase()}|${near.lat.toFixed(2)},${near.lon.toFixed(2)}`;
  const c = loadCache();
  if (key in c) return Promise.resolve(c[key]);

  const job = queue.then(async () => {
    const url =
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1` +
      `&lat=${near.lat}&lon=${near.lon}&zoom=12&location_bias_scale=0.6`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocoder replied ${res.status}`);
    const j = (await res.json()) as { features: { geometry: { coordinates: [number, number] } }[] };
    const f = j.features[0];
    const hit = f ? { lon: f.geometry.coordinates[0], lat: f.geometry.coordinates[1] } : null;
    const ok = hit && km(hit, near) <= MAX_KM ? hit : null;
    c[key] = ok;
    saveCache();
    return ok;
  });
  queue = job.catch(() => {});
  return job;
}
