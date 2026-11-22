// One-off: look up coordinates for every place in src/data/trip.demo.json (via Photon / OSM)
// and write them back, so the demo maps render instantly. Re-run after editing demo places:
//   node scripts/bake-demo-geo.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const file = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "trip.demo.json");
const data = JSON.parse(readFileSync(file, "utf8"));
const n = (o) => Number(String(o).replace("+", ""));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const cityFor = (off) => [...data.trip.cities].reverse().find((c) => n(c.start) <= n(off)) ?? data.trip.cities[0];

async function locate(q, city) {
  const query = q.toLowerCase().includes(city.name.toLowerCase()) ? q : `${q}, ${city.name}`;
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1&lat=${city.lat}&lon=${city.lon}&zoom=12&location_bias_scale=0.6`;
  let j;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "dada-trip-demo-baker" } });
    await sleep(1100); // be polite: ~1 request per second
    if (res.ok) {
      j = await res.json();
      break;
    }
    if (attempt === 4) throw new Error(`Photon kept failing (${res.status}) for "${query}"`);
    await sleep(4000 * (attempt + 1));
  }
  const f = j.features?.[0];
  if (!f) return null;
  const [lon, lat] = f.geometry.coordinates;
  return { lat: +lat.toFixed(6), lon: +lon.toFixed(6) };
}

for (const c of data.trip.cities) {
  if (c.stay.lat != null) continue;
  const hit = await locate(c.stay.address, c);
  if (hit) Object.assign(c.stay, hit);
  console.log(`stay  ${c.name.padEnd(10)} ${hit ? `${hit.lat},${hit.lon}` : "MISS"}  ${c.stay.address}`);
}

for (const [off, items] of Object.entries(data.plans)) {
  const city = cityFor(off);
  for (const a of items) {
    if (!a.place || a.lat != null || a.geo) continue;
    const hit = await locate(a.place.split("→").pop().trim(), city);
    if (hit) Object.assign(a, hit);
    else a.geo = "miss";
    writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
    console.log(`${off.padEnd(4)} ${city.name.padEnd(10)} ${hit ? `${hit.lat},${hit.lon}` : "MISS"}  ${a.place}`);
  }
}

writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
