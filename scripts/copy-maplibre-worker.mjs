// MapLibre 6 loads its WebWorker from a URL next to the bundle, which Turbopack doesn't emit.
// Copy the installed worker into public/ so the app can point MapLibre at it (see paper-map.tsx).
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const pkg = dirname(require.resolve("maplibre-gl/package.json"));
const out = join(root, "public", "vendor");
mkdirSync(out, { recursive: true });
copyFileSync(join(pkg, "dist", "maplibre-gl-worker.mjs"), join(out, "maplibre-gl-worker.mjs"));
