import type { LayerSpecification, StyleSpecification } from "maplibre-gl";

export const BASE_STYLE = "https://tiles.openfreemap.org/styles/positron";

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim() || "#000";

/**
 * Turn the Positron basemap into a photocopied newspaper map:
 * paper ground, blue-ink water, thin ink roads, almost no labels.
 * "route" = continental overview, "day" = street level.
 */
export function paperStyle(style: StyleSpecification, mode: "route" | "day"): StyleSpecification {
  const paper = token("paper");
  const ink = token("ink");
  const blue = token("blue");
  const olive = token("olive");

  const layers = style.layers.flatMap((l): LayerSpecification[] => {
    const id = l.id;
    const hide = (): LayerSpecification[] => [];
    const keep = (paint: Record<string, unknown>, layout: Record<string, unknown> = {}): LayerSpecification[] => [
      {
        ...l,
        paint: { ...(l as { paint?: object }).paint, ...paint },
        layout: { ...(l as { layout?: object }).layout, ...layout },
      } as LayerSpecification,
    ];

    if (l.type === "background") return keep({ "background-color": paper });
    if (l.type === "raster" || l.type === "hillshade") return hide();

    if (id === "water") return keep({ "fill-color": blue, "fill-opacity": 0.26 });
    if (id === "waterway") return keep({ "line-color": blue, "line-opacity": 0.3 });
    if (id === "park" || id === "landcover_wood") return keep({ "fill-color": olive, "fill-opacity": 0.1 });
    if (id === "building") return mode === "day" ? keep({ "fill-color": ink, "fill-opacity": 0.06 }) : hide();
    if (l.type === "fill") return hide();

    if (l.type === "line") {
      if (/casing|subtle|tunnel|pier|aeroway|dashline|path/.test(id)) return hide();
      if (id.startsWith("boundary")) return keep({ "line-color": ink, "line-opacity": 0.45, "line-dasharray": [3, 2] });
      if (id.startsWith("railway")) return keep({ "line-color": ink, "line-opacity": mode === "day" ? 0.14 : 0.1 });
      const strength = id.includes("motorway") ? 0.4 : id.includes("major") ? 0.26 : 0.12;
      return keep({ "line-color": ink, "line-opacity": mode === "route" ? strength * 0.5 : strength });
    }

    if (l.type === "symbol") {
      const wanted =
        mode === "route"
          ? /label_country/.test(id)
          : /highway-name-(major|minor)|water_name|label_(city|town|village|other)/.test(id);
      if (!wanted) return hide();
      return keep({ "text-color": ink, "text-opacity": 0.6, "text-halo-color": paper, "text-halo-width": 1.6 });
    }

    return [l];
  });

  return { ...style, layers };
}
