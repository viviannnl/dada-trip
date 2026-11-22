"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "motion/react";
import type { Map as MLMap, Marker as MLMarker } from "maplibre-gl";
import { RotateCw } from "lucide-react";
import { BASE_STYLE, paperStyle } from "@/lib/map-style";
import { DadaLoader } from "./dada-loader";

export type MapPoint = { id: string; lat: number; lon: number; draggable?: boolean };

type Props<P extends MapPoint> = {
  mode: "route" | "day";
  points: P[];
  /** ids (in order) to connect with a dashed line */
  path?: string[];
  pathColor?: "red" | "ink";
  fallback: { lat: number; lon: number; zoom: number };
  renderMarker: (p: P) => ReactNode;
  onMove?: (id: string, lat: number, lon: number) => void;
  label: string;
  className?: string;
};

type Status = "loading" | "ready" | "error";

export function PaperMap<P extends MapPoint>({
  mode,
  points,
  path = [],
  pathColor = "red",
  fallback,
  renderMarker,
  onMove,
  label,
  className = "",
}: Props<P>) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  const markers = useRef(new Map<string, { marker: MLMarker; el: HTMLDivElement }>());
  const onMoveRef = useRef(onMove);
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);
  const [slots, setSlots] = useState<{ id: string; el: HTMLDivElement }[]>([]);

  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  /* ── create the map once (per retry) ── */
  useEffect(() => {
    let dead = false;
    const registry = markers.current;
    (async () => {
      try {
        const ml = await import("maplibre-gl");
        if (dead || !box.current) return;
        ml.setWorkerUrl("/vendor/maplibre-gl-worker.mjs"); // copied in by scripts/copy-maplibre-worker.mjs
        const m = new ml.Map({
          container: box.current,
          style: BASE_STYLE,
          transformStyle: (_prev, next) => paperStyle(next, mode),
          center: [fallback.lon, fallback.lat],
          zoom: fallback.zoom,
          attributionControl: { compact: true },
          cooperativeGestures: true,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
        });
        m.addControl(new ml.NavigationControl({ showCompass: false }), "bottom-right");
        m.on("load", () => !dead && setStatus("ready"));
        m.on("error", () => !dead && !m.loaded() && setStatus("error"));
        map.current = m;
        (m as unknown as { __ml: typeof ml }).__ml = ml;
      } catch {
        if (!dead) setStatus("error");
      }
    })();
    return () => {
      dead = true;
      registry.forEach(({ marker }) => marker.remove());
      registry.clear();
      map.current?.remove();
      map.current = null;
    };
    // fallback/mode are initial-only on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  /* ── sync markers, path and framing whenever points change ── */
  const sig = points.map((p) => `${p.id}:${p.lat.toFixed(5)},${p.lon.toFixed(5)}`).join("|") + "#" + path.join(",");
  useEffect(() => {
    const m = map.current;
    if (status !== "ready" || !m) return;
    const ml = (m as unknown as { __ml: typeof import("maplibre-gl") }).__ml;
    const reg = markers.current;

    // markers
    const ids = new Set(points.map((p) => p.id));
    reg.forEach((v, id) => {
      if (!ids.has(id)) {
        v.marker.remove();
        reg.delete(id);
      }
    });
    for (const p of points) {
      const have = reg.get(p.id);
      if (have) {
        have.marker.setLngLat([p.lon, p.lat]);
        continue;
      }
      const el = document.createElement("div");
      const marker = new ml.Marker({ element: el, draggable: !!p.draggable, anchor: "center" })
        .setLngLat([p.lon, p.lat])
        .addTo(m);
      marker.on("dragend", () => {
        const ll = marker.getLngLat();
        onMoveRef.current?.(p.id, ll.lat, ll.lng);
      });
      reg.set(p.id, { marker, el });
    }
    setSlots([...reg.entries()].map(([id, v]) => ({ id, el: v.el })));

    // dashed path
    const coords = path
      .map((id) => points.find((p) => p.id === id))
      .filter((p): p is P => !!p)
      .map((p) => [p.lon, p.lat]);
    const data = {
      type: "Feature" as const,
      properties: {},
      geometry: { type: "LineString" as const, coordinates: coords },
    };
    const src = m.getSource("path") as { setData?: (d: unknown) => void } | undefined;
    if (src?.setData) src.setData(data);
    else {
      m.addSource("path", { type: "geojson", data });
      m.addLayer({
        id: "path",
        type: "line",
        source: "path",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": getComputedStyle(document.documentElement)
            .getPropertyValue(pathColor === "red" ? "--red" : "--ink")
            .trim(),
          "line-width": mode === "route" ? 3 : 2.5,
          "line-dasharray": [1.5, 1.6],
        },
      });
    }

    // framing
    const duration = reduce ? 0 : 600;
    if (points.length === 0) m.jumpTo({ center: [fallback.lon, fallback.lat], zoom: fallback.zoom });
    else if (points.length === 1) m.easeTo({ center: [points[0].lon, points[0].lat], zoom: 14.5, duration });
    else {
      const lons = points.map((p) => p.lon);
      const lats = points.map((p) => p.lat);
      m.fitBounds(
        [
          [Math.min(...lons), Math.min(...lats)],
          [Math.max(...lons), Math.max(...lats)],
        ],
        { padding: mode === "route" ? 90 : 60, maxZoom: 15, duration },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sig]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={box} role="region" aria-label={label} className="paper-map h-full w-full" />
      {slots.map(({ id, el }) => {
        const p = points.find((x) => x.id === id);
        return p ? createPortal(renderMarker(p), el, id) : null;
      })}

      {status === "loading" && (
        <div className="halftone-shimmer absolute inset-0 grid place-items-center bg-paper-deep">
          <DadaLoader label="Mapping" className="bg-paper-deep px-3 py-2" />
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 grid place-items-center bg-paper-deep p-6 text-center">
          <div>
            <p className="font-didone text-2xl italic">The map got lost in the post.</p>
            <p className="mt-1 font-type text-sm text-ink-soft">
              The map server didn&apos;t answer, or this browser can&apos;t draw WebGL.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus("loading");
                setAttempt((n) => n + 1);
              }}
              className="mt-4 inline-flex items-center gap-1.5 border-2 border-ink px-3 py-1.5 font-mono text-xs tracking-[0.14em] uppercase transition-colors duration-150 hover:bg-ink hover:text-paper"
            >
              <RotateCw size={13} aria-hidden /> Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
