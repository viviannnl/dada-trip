"use client";

import { RotateCw } from "lucide-react";
import type { City } from "@/lib/trip";
import { describe, type DayWeather } from "@/lib/weather";

type W = ReturnType<typeof import("@/lib/weather").useWeather>;

export function WeatherBlock({ city, w }: { city: City; w: W }) {
  return (
    <div className="relative mt-10 border-t-2 border-ink pt-4" aria-busy={w.status === "loading"}>
      <p className="font-mono text-[11px] tracking-[0.2em] uppercase">
        {w.status === "ok" && w.data.source === "climate"
          ? `Typical weather · ${city.name} · avg of last ${w.data.years} years`
          : `Forecast · ${city.name}`}
      </p>

      {w.status === "loading" && <Skeleton />}
      {w.status === "error" && (
        <div className="mt-4 flex flex-wrap items-center gap-4 border-2 border-dashed border-red p-4">
          <p className="font-type">
            The sky is unreachable right now. <span className="text-ink-soft">({w.message})</span>
          </p>
          <button
            type="button"
            onClick={w.retry}
            className="inline-flex items-center gap-1.5 border-2 border-ink px-3 py-1.5 font-mono text-xs tracking-[0.14em] uppercase transition-colors duration-150 hover:bg-ink hover:text-paper"
          >
            <RotateCw size={13} aria-hidden /> Try again
          </button>
        </div>
      )}
      {w.status === "ok" && <Reading d={w.data} />}
    </div>
  );
}

function Reading({ d }: { d: DayWeather }) {
  const climate = d.source === "climate";
  return (
    <>
      <div className="mt-1 grid grid-cols-[auto_1fr] items-end gap-x-5">
        <p className="font-didone text-[clamp(6rem,14vw,10rem)] leading-[0.8] font-black tracking-[-0.04em]">
          {climate && <span className="align-top font-mono text-base tracking-normal">≈</span>}
          {d.high}°
        </p>
        <div className="pb-2">
          <p className="font-poster text-3xl leading-none uppercase md:text-4xl">Low {d.low}°</p>
          <p className="mt-2 inline-block -rotate-2 bg-ink px-2 py-1 font-poster text-xl text-newsprint uppercase md:text-2xl">
            {climate ? `Usually ${describe(d.code).toLowerCase()}` : describe(d.code)}
          </p>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 font-mono text-xs uppercase">
        <div>
          <dt className="tracking-[0.16em] opacity-70">{climate ? "Wet in past years" : "Chance of rain"}</dt>
          <dd className="mt-1 flex items-center gap-2">
            <span className="font-poster text-3xl text-red">{d.precip}%</span>
            <span aria-hidden className="relative h-4 flex-1 border border-ink">
              <span className="halftone absolute inset-y-0 left-0" style={{ width: `${d.precip}%` }} />
            </span>
          </dd>
        </div>
        <div>
          <dt className="tracking-[0.16em] opacity-70">Wind</dt>
          <dd className="mt-1 font-poster text-3xl">{d.wind} km/h</dd>
        </div>
      </dl>
      {climate && (
        <p className="mt-4 font-type text-sm text-ink-soft">
          Too far out for a forecast — the real one appears here 16 days before.
        </p>
      )}
    </>
  );
}

function Skeleton() {
  return (
    <div aria-label="Loading weather" className="mt-2 animate-pulse">
      <div className="flex items-end gap-5">
        <div className="h-28 w-48 bg-ink/10" />
        <div className="space-y-2 pb-2">
          <div className="h-8 w-32 bg-ink/10" />
          <div className="h-8 w-44 bg-ink/15" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="h-10 bg-ink/10" />
        <div className="h-10 bg-ink/10" />
      </div>
    </div>
  );
}
