// Turns downloaded public-domain scans into Dada-ready assets in public/images/.
//   node scripts/process-images.mjs <manifest.json>
// manifest: [{ "kind": "city", "key": "paris", "src": "/abs/path.jpg", "crop": 0.04 },
//            { "kind": "outfit", "key": "wet-flaneur", "src": "/abs/path.jpg", "box": [l, t, r, b] }]
//
// city   → <key>-bw.webp (grainy high-contrast newsprint) + <key>-color.webp (faded photochrom)
// outfit → cropped to the figure (manual "box") and cut out with a wobbly scissor-cut mask:
//          <key>-bw.webp + <key>-color.webp with transparency
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (kind) => join(root, "public", "images", kind === "city" ? "cities" : "outfits");

const manifest = JSON.parse(readFileSync(process.argv[2], "utf8"));

async function city({ key, src, crop = 0.04 }) {
  const img = sharp(src);
  const { width, height } = await img.metadata();
  const dx = Math.round(width * crop);
  const dy = Math.round(height * crop);
  const base = img.extract({ left: dx, top: dy, width: width - 2 * dx, height: height - 2 * dy - Math.round(height * 0.03) }).resize({ width: 900 });
  await base
    .clone()
    .grayscale()
    .normalize()
    .linear(1.35, -38)
    .sharpen({ sigma: 1.2 })
    .webp({ quality: 72 })
    .toFile(join(out("city"), `${key}-bw.webp`));
  await base.clone().modulate({ saturation: 0.85 }).webp({ quality: 74 }).toFile(join(out("city"), `${key}-color.webp`));
}

/** Deterministic wobbly polygon: a rectangle cut by hand with scissors (one corner snipped off). */
function scissorMask(w, h, seed) {
  let a = seed >>> 0;
  const rnd = () => ((a = (a * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const j = (n) => (rnd() - 0.5) * n;
  const pts = [];
  const steps = 7;
  const m = Math.min(w, h) * 0.012;
  for (let i = 0; i <= steps; i++) pts.push([(w * i) / steps + j(m), m + j(m * 1.6)]); // top
  for (let i = 1; i <= steps; i++) pts.push([w - m + j(m * 1.6), (h * i) / steps + j(m)]); // right
  for (let i = steps - 1; i >= 0; i--) pts.push([(w * i) / steps + j(m), h - m + j(m * 1.6)]); // bottom
  for (let i = steps - 1; i >= 1; i--) pts.push([m + j(m * 1.6), (h * i) / steps + j(m)]); // left
  // snip the top-right corner
  const cut = Math.min(w, h) * (0.08 + rnd() * 0.06);
  pts[steps] = [w - cut, m];
  pts.splice(steps + 1, 0, [w - m, cut]);
  const d = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><polygon points="${d}" fill="#fff"/></svg>`);
}

/** Crop a fashion plate to its figure (box = [left, top, right, bottom] as fractions) and scissor-cut it. */
async function outfit({ key, src, box = [0.05, 0.05, 0.95, 0.85] }) {
  const img = sharp(src);
  const { width, height } = await img.metadata();
  const [l, t, r, b] = box;
  const cropped = await img
    .extract({ left: Math.round(l * width), top: Math.round(t * height), width: Math.round((r - l) * width), height: Math.round((b - t) * height) })
    .resize({ height: 720 })
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = cropped.info;
  const mask = scissorMask(w, h, [...key].reduce((s, c) => s * 31 + c.charCodeAt(0), 7));
  const cut = await sharp(cropped.data).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  await sharp(cut).modulate({ saturation: 0.9 }).webp({ quality: 80, alphaQuality: 90 }).toFile(join(out("outfit"), `${key}-color.webp`));
  await sharp(cut)
    .grayscale()
    .normalize()
    .linear(1.3, -30)
    .webp({ quality: 78, alphaQuality: 90 })
    .toFile(join(out("outfit"), `${key}-bw.webp`));
  return { kept: Math.round(((r - l) * (b - t)) * 100) };
}

mkdirSync(out("city"), { recursive: true });
mkdirSync(out("outfit"), { recursive: true });
for (const item of manifest) {
  const r = item.kind === "city" ? await city(item) : await outfit(item);
  console.log(`${item.kind.padEnd(6)} ${item.key.padEnd(18)} ok ${r ? `(figure = ${r.kept}% of frame)` : ""}`);
}
