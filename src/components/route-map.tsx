"use client";

import Link from "next/link";
import { km } from "@/lib/geo";
import { useTripState } from "@/lib/store";
import { fmt, TRIP_ID, type City } from "@/lib/trip";
import { PaperMap } from "./paper-map";
import { Stamp, Tape, Torn } from "./print";

type CityPoint = { id: string; lat: number; lon: number; city: City; i: number };

export function RouteMap() {
  const { trip } = useTripState();
  const points: CityPoint[] = trip.cities.map((c, i) => ({ id: c.slug, lat: c.lat, lon: c.lon, city: c, i }));
  const legs = trip.cities.slice(1).map((c, i) => {
    const from = trip.cities[i];
    return { from, to: c, km: Math.round(km(from, c) / 10) * 10 };
  });
  const mid = {
    lat: points.reduce((s, p) => s + p.lat, 0) / points.length,
    lon: points.reduce((s, p) => s + p.lon, 0) / points.length,
  };

  return (
    <section className="relative border-t-2 border-ink">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 md:grid-cols-12 md:px-8">
        <div className="md:col-span-4">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase">The route, mapped</p>
          <h2 className="mt-2 font-poster text-[clamp(3rem,6vw,5rem)] leading-[0.85] uppercase">
            {legs.length + 1} cities,
            <br />
            <span className="font-didone font-black text-red normal-case italic">one line.</span>
          </h2>

          <ol className="mt-8 border-t border-ink">
            {legs.map((l, i) => (
              <li key={l.to.slug} className="flex items-baseline gap-3 border-b border-ink py-3">
                <span className="font-mono text-xs text-red">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1">
                  <span className="block font-didone text-xl font-bold">
                    {l.from.name} <span className="text-red">→</span> {l.to.name}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.14em] text-ink-soft uppercase">
                    {fmt(l.to.start, { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                </span>
                <span className="font-poster text-2xl tabular-nums">~{l.km}</span>
                <span className="font-mono text-[10px] uppercase">km</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 font-type text-sm text-ink-soft">Straight-line distance. Trains take the scenic version.</p>
        </div>

        <div className="relative md:col-span-8">
          <Tape className="-top-3 left-10 z-10" rotate={-7} />
          <Tape className="-top-2 right-14 z-10" rotate={6} />
          <Torn seed={91} depth={8} className="paper-shadow border-2 border-ink">
            <PaperMap
              mode="route"
              label={`Map of the route: ${trip.cities.map((c) => c.name).join(", ")}`}
              points={points}
              path={points.map((p) => p.id)}
              fallback={{ ...mid, zoom: 5 }}
              className="h-[380px] md:h-[520px]"
              renderMarker={(p) => (
                <Link
                  href={`/trip/${TRIP_ID}/itinerary?day=${p.city.start}`}
                  aria-label={`${p.city.name}, from ${fmt(p.city.start, { day: "numeric", month: "long" })} — open that day`}
                  className="block transition-transform duration-150 hover:scale-110"
                >
                  <Stamp
                    top={p.city.name}
                    middle={fmt(p.city.start, { day: "2-digit", month: "short" })}
                    color={p.city.stampColor}
                    size={78}
                    rotate={[-12, 8, -4][p.i % 3]}
                    className="drop-shadow-[0_1px_0_var(--paper)]"
                  />
                </Link>
              )}
            />
          </Torn>
        </div>
      </div>
    </section>
  );
}
