"use client";

import { useState } from "react";
import { Scissors } from "lucide-react";
import { Countdown } from "./countdown";
import { Ransom, Tape, Torn } from "./print";
import { useTripState } from "@/lib/store";
import { diffDays, fmt, tripEnd, tripStart } from "@/lib/trip";

export function CoverHero() {
  const { trip } = useTripState();
  const [seed, setSeed] = useState(0);
  const start = tripStart(trip);
  const end = tripEnd(trip);
  const cities = trip.cities;
  const total = diffDays(start, end);

  return (
    <section className="relative mx-auto min-h-[88vh] max-w-[1400px] px-4 pt-6 pb-16 md:px-8">
      {/* ── decorative collage layer ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[7%] right-[4%] aspect-square w-[min(44vw,440px)] rounded-full bg-red" />
        <div className="halftone absolute top-[46%] left-[44%] h-36 w-36 -rotate-6 opacity-50" />
        <div className="absolute right-[22%] bottom-0 aspect-[2/1] w-[min(40vw,340px)] rounded-t-full bg-blue" />
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <line x1="58" y1="10" x2="92" y2="100" stroke="var(--ink)" strokeWidth="0.18" />
          <line x1="61" y1="10" x2="95" y2="100" stroke="var(--ink)" strokeWidth="0.1" />
        </svg>
      </div>

      {/* vertical dates along the edge */}
      <p className="vertical absolute top-28 right-2 z-10 hidden font-mono text-xs tracking-[0.3em] uppercase md:block">
        {fmt(start, { day: "2-digit", month: "2-digit" })} → {fmt(end, { day: "2-digit", month: "2-digit", year: "numeric" })}
      </p>

      <p className="relative z-10 font-mono text-[11px] leading-relaxed tracking-[0.18em] uppercase">
        Issue Nº {trip.issue} — a travel planner
        <br />
        disguised as a magazine
      </p>

      <h1 className="relative z-10 mt-4" aria-label="Europe, Unfolded.">
        <span
          aria-hidden
          className="ink-rough -ml-[0.04em] block font-didone text-[clamp(5.5rem,23vw,22rem)] leading-[0.78] font-black tracking-[-0.045em] whitespace-nowrap italic"
        >
          Europe,
        </span>
        <span aria-hidden className="mt-[1vw] ml-[8vw] inline-block -rotate-3">
          <Torn seed={11} depth={7} className="bg-ink px-[0.25em] pt-[0.12em] pb-[0.06em]">
            <span className="block font-poster text-[clamp(3.2rem,11vw,10rem)] leading-[0.95] text-newsprint uppercase">
              Unfolded<span className="text-red">.</span>
            </span>
          </Torn>
        </span>
      </h1>

      <div className="relative z-10 mt-12 grid gap-10 md:grid-cols-12 md:items-end">
        {/* route as ransom-note */}
        <div className="md:col-span-7">
          <p className="mb-3 font-mono text-[11px] tracking-[0.2em] uppercase">The route</p>
          <ol className="flex flex-wrap items-center gap-x-4 gap-y-3 text-[clamp(2.2rem,5.5vw,4.25rem)]">
            {cities.map((c, i) => (
              <li key={c.slug} className="flex items-center gap-4">
                <Ransom text={c.name.toUpperCase()} seed={seed} />
                {i < cities.length - 1 && (
                  <span aria-hidden className="font-mono text-[0.5em] text-red">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="mt-6 inline-flex items-center gap-2 border-2 border-ink bg-paper px-3 py-2 font-mono text-xs tracking-[0.16em] uppercase transition-[background-color,color,transform] duration-150 hover:bg-ink hover:text-paper active:translate-y-px"
          >
            <Scissors size={14} strokeWidth={2.2} aria-hidden />
            Re-cut the collage
          </button>
        </div>

        {/* countdown clipping */}
        <div className="relative md:col-span-4 md:col-start-9">
          <Tape className="-top-3 left-8" rotate={-6} />
          <Torn seed={3} className="newsprint-lines paper-shadow rotate-2 bg-newsprint px-6 pt-6 pb-5">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase">Departure in</p>
            <p className="font-poster text-[clamp(5rem,12vw,9rem)] leading-[0.9] text-red">
              <Countdown to={start} />
            </p>
            <p className="font-didone text-2xl italic">days.</p>
            <p className="mt-3 border-t border-ink pt-2 font-mono text-xs uppercase">
              {total} nights · {cities.length} cities · 1 suitcase
            </p>
          </Torn>
        </div>
      </div>
    </section>
  );
}
