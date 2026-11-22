// Writes src/data/trip.active.json (git-ignored) — the one file the app imports.
// Source, in priority order:
//   1. TRIP_DATA_JSON env var (e.g. on Vercel)
//   2. TRIP_SOURCE=demo  → src/data/trip.demo.json, dates shifted relative to today
//   3. src/data/trip.local.json (your private trip; created from trip.example.json if missing)
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data");
const file = (name) => join(dataDir, name);
const active = file("trip.active.json");

/** "+7" → ISO date 7 days from today (local time). Plain ISO dates pass through. */
function resolveDates(data) {
  const now = new Date();
  const iso = (v) => {
    if (typeof v !== "string" || !/^[+-]\d+$/.test(v)) return v;
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + Number(v));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const rekey = (obj = {}) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [iso(k), v]));
  delete data._comment;
  data.trip.cities = data.trip.cities.map((c) => ({ ...c, start: iso(c.start), end: iso(c.end) }));
  data.plans = rekey(data.plans);
  data.saved = rekey(data.saved);
  return data;
}

let source;
if (process.env.TRIP_DATA_JSON) {
  writeFileSync(active, JSON.stringify(resolveDates(JSON.parse(process.env.TRIP_DATA_JSON)), null, 2));
  source = "TRIP_DATA_JSON";
} else if (process.env.TRIP_SOURCE === "demo") {
  writeFileSync(active, JSON.stringify(resolveDates(JSON.parse(readFileSync(file("trip.demo.json"), "utf8"))), null, 2));
  source = "trip.demo.json (dates relative to today)";
} else {
  if (!existsSync(file("trip.local.json"))) {
    copyFileSync(file("trip.example.json"), file("trip.local.json"));
    console.log("[trip-data] no trip.local.json — created it from trip.example.json");
  }
  writeFileSync(active, JSON.stringify(resolveDates(JSON.parse(readFileSync(file("trip.local.json"), "utf8"))), null, 2));
  source = "trip.local.json";
}
console.log(`[trip-data] using ${source}`);
