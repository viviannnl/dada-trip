// Makes sure src/data/trip.local.json exists before dev/build/typecheck.
// - TRIP_DATA_JSON env var set (e.g. on Vercel) → write it to the local file.
// - Local file missing (fresh clone) → copy the committed example.
// - Otherwise leave your private trip file alone.
import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data");
const local = join(dataDir, "trip.local.json");
const example = join(dataDir, "trip.example.json");

if (process.env.TRIP_DATA_JSON) {
  JSON.parse(process.env.TRIP_DATA_JSON); // fail loudly on bad JSON
  writeFileSync(local, process.env.TRIP_DATA_JSON);
  console.log("[trip-data] wrote trip.local.json from TRIP_DATA_JSON");
} else if (!existsSync(local)) {
  copyFileSync(example, local);
  console.log("[trip-data] no trip.local.json — copied trip.example.json (placeholder trip)");
}
