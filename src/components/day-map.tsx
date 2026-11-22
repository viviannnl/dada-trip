"use client";

import { useEffect, useRef } from "react";
import { Home } from "lucide-react";
import { geocode, placeQuery } from "@/lib/geo";
import { update } from "@/lib/store";
import type { Activity, City } from "@/lib/trip";
import { PaperMap } from "./paper-map";
import { Torn } from "./print";

type Pt = { id: string; lat: number; lon: number; draggable: boolean; n?: number; title: string; home?: boolean };

const withCity = (q: string, city: City) => (q.toLowerCase().includes(city.name.toLowerCase()) ? q : `${q}, ${city.name}`);

/** Looks up coordinates for anything on this day that has a place but no pin yet. */
function useGeocodeDay(date: string, city: City, items: Activity[]) {
  const asked = useRef(new Set<string>());

  useEffect(() => {
    const todo = items.filter((a) => a.place && a.lat == null && !a.geo);
    for (const a of todo) {
      const key = `${date}:${a.id}:${a.place}`;
      if (asked.current.has(key)) continue;
      asked.current.add(key);
      geocode(withCity(placeQuery(a.place), city), city)
        .then((hit) =>
          update((s) => ({
            ...s,
            plans: {
              ...s.plans,
              [date]: (s.plans[date] ?? []).map((x) =>
                x.id === a.id && x.place === a.place ? { ...x, ...(hit ?? { geo: "miss" as const }) } : x,
              ),
            },
          })),
        )
        .catch(() => asked.current.delete(key)); // network hiccup: try again next render
    }

    const stay = city.stay;
    const stayQ = stay.address || stay.name;
    const stayKey = `stay:${city.slug}:${stayQ}`;
    if (stayQ && stay.lat == null && !stay.geo && !asked.current.has(stayKey)) {
      asked.current.add(stayKey);
      geocode(withCity(stayQ, city), city)
        .then((hit) =>
          update((s) => ({
            ...s,
            trip: {
              ...s.trip,
              cities: s.trip.cities.map((c) =>
                c.slug === city.slug ? { ...c, stay: { ...c.stay, ...(hit ?? { geo: "miss" as const }) } } : c,
              ),
            },
          })),
        )
        .catch(() => asked.current.delete(stayKey));
    }
  }, [date, city, items]);
}

export function DayMap({ date, city, items, dayLabel }: { date: string; city: City; items: Activity[]; dayLabel: string }) {
  useGeocodeDay(date, city, items);

  const pins: Pt[] = items.flatMap((a, i) =>
    a.lat != null && a.lon != null ? [{ id: a.id, lat: a.lat, lon: a.lon, draggable: true, n: i + 1, title: a.title }] : [],
  );
  const stay = city.stay;
  const points: Pt[] =
    stay.lat != null && stay.lon != null
      ? [{ id: "__stay", lat: stay.lat, lon: stay.lon, draggable: false, title: stay.name || "Your stay", home: true }, ...pins]
      : pins;

  const move = (id: string, lat: number, lon: number) =>
    update((s) => ({
      ...s,
      plans: {
        ...s.plans,
        [date]: (s.plans[date] ?? []).map((x) => (x.id === id ? { ...x, lat, lon, geo: "manual" as const } : x)),
      },
    }));

  const jump = (id: string) => {
    const el = document.getElementById(`plan-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
  };

  return (
    <div className="relative mt-6">
      <Torn seed={date.length * 31 + items.length} depth={6} className="paper-shadow border-2 border-ink">
        <PaperMap<Pt>
          mode="day"
          label={`Map of ${dayLabel} in ${city.name}`}
          points={points}
          path={pins.map((p) => p.id)}
          pathColor="ink"
          fallback={{ lat: city.lat, lon: city.lon, zoom: 12 }}
          onMove={move}
          className="h-[260px] md:h-[320px]"
          renderMarker={(p) =>
            p.home ? (
              <span
                title={p.title}
                aria-label={`Stay: ${p.title}`}
                role="img"
                className="grid size-8 place-items-center rounded-full border-2 border-ink bg-red text-newsprint"
              >
                <Home size={15} aria-hidden />
              </span>
            ) : (
              <button
                type="button"
                onClick={() => jump(p.id)}
                aria-label={`${p.n}. ${p.title} — show in the plan`}
                className="group relative grid size-8 cursor-grab place-items-center border-2 border-paper bg-ink font-poster text-base text-newsprint shadow-[0_2px_0_var(--ink)] transition-transform duration-150 hover:scale-110 active:cursor-grabbing"
                style={{ rotate: `${((p.n ?? 0) % 2 ? -1 : 1) * 6}deg` }}
              >
                {p.n}
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 bg-newsprint px-2 py-1 font-type text-xs whitespace-nowrap text-ink opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {p.title}
                </span>
              </button>
            )
          }
        />
      </Torn>
      <p className="mt-2 font-mono text-[10px] tracking-[0.16em] text-ink-soft uppercase">
        {pins.length
          ? "Tap a number to find it in the plan · drag it if the pin is off"
          : "Add a place to a plan and it lands on the map"}
      </p>
    </div>
  );
}
