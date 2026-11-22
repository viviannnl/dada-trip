"use client";

import { useId, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { update, useTripState } from "@/lib/store";
import { diffDays, fmt, type City } from "@/lib/trip";
import { Ransom, Stamp, Tape, Torn } from "./print";
import { PhotoClipping } from "./clipping";
import { cityArt } from "@/lib/images";

export function CityList() {
  const { trip } = useTripState();
  return (
    <ul className="mt-4 space-y-12">
      {trip.cities.map((c, i) => (
        <li key={c.slug} className="relative grid grid-cols-[auto_1fr] gap-x-5 md:grid-cols-[auto_1fr_15rem]">
          <span className="font-poster text-6xl leading-none text-red md:text-7xl">0{i + 1}</span>
          <div className="min-w-0">
            <Ransom as="h3" text={c.name} seed={i * 7} className="text-[clamp(2.5rem,6vw,4.5rem)]" />
            <p className="mt-2 font-mono text-xs tracking-[0.14em] uppercase">
              {fmt(c.start, { day: "numeric", month: "short" })} — {fmt(c.end, { day: "numeric", month: "short" })} ·{" "}
              {diffDays(c.start, c.end)} nights · {c.country}
            </p>
            <StayCard city={c} i={i} />
          </div>
          <CityPhoto city={c} i={i} />
          <div className="wobble absolute -top-12 -right-3 z-10 scale-[0.7] md:top-auto md:right-auto md:bottom-10 md:left-[calc(100%-7rem)] md:scale-90">
            <Stamp
              top={c.name}
              middle={fmt(c.start, { day: "2-digit", month: "short" })}
              bottom={
                c.country.length > 12
                  ? c.country
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                  : c.country
              }
              color={c.stampColor}
              size={110}
              rotate={[-14, 9, -4][i % 3]}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function CityPhoto({ city, i }: { city: City; i: number }) {
  const art = cityArt(city.slug);
  if (!art) return null;
  return (
    <div
      className={`group col-span-2 mt-5 md:col-span-1 md:col-start-3 md:row-start-1 md:mt-0 ${i % 2 ? "rotate-2" : "-rotate-2"}`}
    >
      <PhotoClipping
        art={art}
        seed={60 + i * 11}
        className="lift aspect-[4/3] w-full"
        sizes="(min-width: 768px) 240px, 90vw"
      />
      <p className="mt-1 font-mono text-[9px] tracking-[0.14em] text-ink-soft uppercase">
        {city.name}, c. 1900 — {art.license.toLowerCase()}
      </p>
    </div>
  );
}

function StayCard({ city, i }: { city: City; i: number }) {
  const [editing, setEditing] = useState(false);
  const id = useId();
  const empty = !city.stay.name;

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const stay = {
      name: String(f.get("name") ?? "").trim(),
      address: String(f.get("address") ?? "").trim(),
      checkIn: String(f.get("checkIn") ?? "").trim(),
    };
    update((s) => ({
      ...s,
      trip: { ...s.trip, cities: s.trip.cities.map((c) => (c.slug === city.slug ? { ...c, stay } : c)) },
    }));
    setEditing(false);
  };

  return (
    <div className={`relative mt-4 max-w-md ${editing ? "" : i % 2 ? "rotate-1" : "-rotate-1"}`}>
      <Tape className="-top-3 right-6" rotate={5} />
      <Torn seed={20 + i} className="paper-shadow bg-newsprint px-4 py-3">
        <p className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">Sleeping at</p>

        {editing ? (
          <form onSubmit={save} className="mt-2 space-y-2" onKeyDown={(e) => e.key === "Escape" && setEditing(false)}>
            <Field
              id={`${id}-n`}
              name="name"
              label="Place"
              defaultValue={city.stay.name}
              placeholder="Hotel or flat name"
              autoFocus
            />
            <Field
              id={`${id}-a`}
              name="address"
              label="Address"
              defaultValue={city.stay.address}
              placeholder="Street, area"
            />
            <Field id={`${id}-c`} name="checkIn" label="Check-in" type="time" defaultValue={city.stay.checkIn} />
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="bg-ink px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] text-paper uppercase transition-colors duration-150 hover:bg-red"
              >
                Paste it in
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase underline-offset-4 hover:underline"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : empty ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-1 inline-flex items-center gap-1.5 font-type text-lg text-ink-soft underline-offset-4 transition-colors duration-150 hover:text-red hover:underline"
          >
            <Plus size={16} aria-hidden /> Where are you sleeping in {city.name}?
          </button>
        ) : (
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-type text-lg break-words">{city.stay.name}</p>
              <p className="font-type text-sm break-words text-ink-soft">
                {[city.stay.address, city.stay.checkIn && `check-in ${city.stay.checkIn}`].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button
              type="button"
              aria-label={`Edit stay in ${city.name}`}
              onClick={() => setEditing(true)}
              className="rounded-sm p-1.5 text-ink-soft transition-colors duration-150 hover:bg-ink hover:text-paper"
            >
              <Pencil size={14} aria-hidden />
            </button>
          </div>
        )}
      </Torn>
    </div>
  );
}

export function Field({
  id,
  label,
  className = "",
  ...rest
}: { id: string; label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="font-mono text-[10px] tracking-[0.18em] uppercase">
        {label}
      </label>
      <input
        id={id}
        {...rest}
        className="block w-full border-b-2 border-ink bg-transparent py-1 font-type text-base outline-none placeholder:text-ink-soft/60 focus-visible:border-red focus-visible:outline-none"
      />
    </div>
  );
}
