import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

// "/" goes straight to the active issue. Done here rather than in a page so the
// router redirects before rendering (a redirect-only page can't be validated for `instant`).
const tripId = (): string =>
  JSON.parse(readFileSync(join(import.meta.dirname, "src/data/trip.active.json"), "utf8")).trip.id;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [{ source: "/", destination: `/trip/${tripId()}`, permanent: false }];
  },
  turbopack: {
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
