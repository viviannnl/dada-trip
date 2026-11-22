"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { pickOutfits } from "@/lib/outfits";
import { update, useTripState } from "@/lib/store";
import { cityFor, fmt, todayISO, travelLeg, tripDays, type Activity } from "@/lib/trip";
import { useWeather } from "@/lib/weather";
import { DayMap } from "./day-map";
import { DayPlan } from "./day-plan";
import { OutfitBoard } from "./outfit-board";
import { Ransom, Torn } from "./print";
import { WeatherBlock } from "./weather-block";
import { PhotoClipping } from "./clipping";
import { DayTransition } from "./transitions";
import { cityArt } from "@/lib/images";

const BAND = { red: "border-red", blue: "border-blue", olive: "border-olive" };
const EMPTY: Activity[] = [];

export function ItineraryView() {
  const { trip, plans, saved } = useTripState();
  const path = usePathname();
  const days = tripDays(trip);
  const today = todayISO();
  const asked = useSearchParams().get("day");
  const date = asked && days.includes(asked) ? asked : days.includes(today) ? today : days[0];
  const n = days.indexOf(date) + 1;
  const city = cityFor(trip, date);
  const leg = travelLeg(trip, date);
  const w = useWeather(city, date);
  const outfits = pickOutfits(w.status === "ok" ? w.data : null, date);
  const pinned = saved[date] ?? [];
  const href = (d: string) => `${path}?day=${d}`;
  const turn = (d: string) => [d > date ? "day-next" : "day-prev"];
  const art = cityArt(city.slug);

  const setPlans = (next: Activity[]) => update((s) => ({ ...s, plans: { ...s.plans, [date]: next } }));
  const togglePin = (id: string) =>
    update((s) => {
      const cur = s.saved[date] ?? [];
      return { ...s, saved: { ...s.saved, [date]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] } };
    });

  return (
    <>
      {/* ── day index ── */}
      <nav aria-label="Days" className="border-b border-ink bg-paper" style={{ viewTransitionName: "day-strip" }}>
        <ol className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 py-2 md:px-8">
          {days.map((d, i) => {
            const c = cityFor(trip, d);
            const on = d === date;
            return (
              <li key={d}>
                <Link
                  href={href(d)}
                  scroll={false}
                  transitionTypes={turn(d)}
                  aria-current={on ? "date" : undefined}
                  aria-label={`Day ${i + 1}, ${fmt(d, { weekday: "long", day: "numeric", month: "long" })}, ${c.name}`}
                  className={`flex min-w-12 flex-col items-center border-b-4 px-1.5 pt-1 pb-0.5 font-mono transition-[background-color,transform] duration-150 hover:-translate-y-0.5 ${BAND[c.stampColor]} ${
                    on ? "bg-ink text-newsprint" : d < today ? "opacity-50 hover:bg-ink/10" : "hover:bg-ink/10"
                  }`}
                >
                  <span className="text-[9px] tracking-[0.14em] uppercase">{fmt(d, { month: "short" })}</span>
                  <span className="font-poster text-lg leading-tight">{fmt(d, { day: "numeric" })}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      <DayTransition day={date}>
        <div className="mx-auto grid max-w-[1400px] md:grid-cols-2">
          {/* ─────────── LEFT PAGE ─────────── */}
          <section className="relative overflow-hidden px-4 pt-8 pb-14 md:border-r-2 md:border-ink md:px-8">
            <div aria-hidden className="halftone-red absolute -top-10 -right-16 size-64 rounded-full opacity-40" />

            <div className="relative flex flex-wrap items-end gap-x-3 gap-y-2">
              <span className="vertical rotate-180 font-poster text-4xl leading-none uppercase md:text-5xl">Day</span>
              <span className="ink-rough font-didone text-[clamp(7rem,20vw,13rem)] leading-[0.75] font-black italic">
                {String(n).padStart(2, "0")}
              </span>
              <div className="mb-2 ml-1 min-w-0">
                <Ransom
                  as="h1"
                  text={city.name.toUpperCase()}
                  seed={3}
                  className={`flex-nowrap ${
                    city.name.length > 6 ? "text-[clamp(1.4rem,2.6vw,2.4rem)]" : "text-[clamp(1.6rem,3.4vw,3rem)]"
                  }`}
                />
                <p className="mt-2 font-mono text-xs tracking-[0.16em] uppercase">
                  {fmt(date, { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>
            </div>

            {art && (
              <div className="group relative mt-5 mb-2">
                <PhotoClipping
                  art={art}
                  seed={n * 17}
                  priority
                  className="lift aspect-[16/8] w-full -rotate-1"
                  sizes="(min-width: 768px) 45vw, 92vw"
                />
                <p className="absolute -bottom-3 left-4 rotate-1 bg-newsprint px-2 py-1 font-mono text-[10px] tracking-[0.14em] uppercase shadow-sm">
                  Fig. {String(n).padStart(2, "0")} — {city.name}, c. 1900 · hover to develop
                </p>
              </div>
            )}

            <div className="relative mt-6 flex flex-wrap items-center gap-3">
              {leg && (
                <Torn seed={n * 9} className="-rotate-1 bg-red px-3 py-1.5 text-newsprint">
                  <p className="font-mono text-[11px] tracking-[0.16em] uppercase">Travel day · {leg}</p>
                </Torn>
              )}
              {date.endsWith("12-25") && <Holiday>Christmas Day — expect closures</Holiday>}
              {date.endsWith("12-31") && <Holiday>New Year&apos;s Eve</Holiday>}
              {date.endsWith("01-01") && <Holiday>New Year&apos;s Day — slow city</Holiday>}
            </div>

            <WeatherBlock city={city} w={w} />

            <div className="relative mt-14">
              <h2 className="mb-6 flex flex-wrap items-baseline gap-x-3 font-poster text-4xl uppercase md:text-5xl">
                What to
                <span className="font-didone font-black text-red normal-case italic">wear</span>
                <span className="font-mono text-[11px] tracking-[0.16em] normal-case">
                  — tap ♥ to pin a look to this day
                </span>
              </h2>
              <OutfitBoard
                outfits={outfits}
                saved={pinned}
                onToggle={togglePin}
                dayLabel={`Day ${String(n).padStart(2, "0")}`}
              />
            </div>
          </section>

          {/* ─────────── RIGHT PAGE ─────────── */}
          <section className="relative px-4 pt-8 pb-14 md:px-8">
            <div className="flex items-end justify-between gap-4 border-b-2 border-ink pb-3">
              <h2 className="font-poster text-[clamp(3rem,7vw,5.5rem)] leading-[0.85] uppercase">
                The
                <br />
                Plan<span className="text-red">.</span>
              </h2>
              <div className="mb-1 flex gap-1">
                <DayStep to={days[n - 2]} href={href} dir="prev" />
                <DayStep to={days[n]} href={href} dir="next" />
              </div>
            </div>
            <DayMap date={date} city={city} items={plans[date] ?? EMPTY} dayLabel={`day ${n}`} />
            <div className="mt-8">
              <DayPlan key={date} items={plans[date] ?? EMPTY} onChange={setPlans} />
            </div>
          </section>
        </div>
      </DayTransition>
    </>
  );
}

function Holiday({ children }: { children: React.ReactNode }) {
  return (
    <span className="rotate-1 border-2 border-ink bg-newsprint px-2 py-1 font-mono text-[11px] tracking-[0.14em] uppercase">
      {children}
    </span>
  );
}

function DayStep({ to, href, dir }: { to?: string; href: (d: string) => string; dir: "prev" | "next" }) {
  const Icon = dir === "prev" ? ArrowLeft : ArrowRight;
  const label = dir === "prev" ? "Previous day" : "Next day";
  const cls = "grid size-10 place-items-center border-2 border-ink transition-colors duration-150";
  if (!to)
    return (
      <span aria-hidden className={`${cls} opacity-25`}>
        <Icon size={18} />
      </span>
    );
  return (
    <Link
      href={href(to)}
      scroll={false}
      transitionTypes={[dir === "next" ? "day-next" : "day-prev"]}
      aria-label={label}
      className={`${cls} press group hover:bg-ink hover:text-paper`}
    >
      <Icon
        size={18}
        aria-hidden
        className={`transition-transform duration-150 ${dir === "next" ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"}`}
      />
    </Link>
  );
}
