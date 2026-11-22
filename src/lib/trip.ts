import raw from "@/data/trip.active.json";

// Trip model, seed data and date helpers. All dates are ISO "YYYY-MM-DD", handled in UTC.

export type StampColor = "red" | "blue" | "olive";

export type City = {
  slug: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  start: string; // arrival date
  end: string; // departure date
  stay: { name: string; address: string; checkIn: string } & Geo;
  stampColor: StampColor;
};

export type Trip = {
  id: string;
  issue: string;
  season: string;
  cities: City[];
};

/** Coordinates found by the geocoder (or dragged on the map). geo="miss" = looked, found nothing. */
export type Geo = { lat?: number; lon?: number; geo?: "miss" | "manual" };

export type ActivityKind = "food" | "art" | "walk" | "transit" | "night";

export type Activity = {
  id: string;
  time: string; // "HH:MM" or "" for anytime
  title: string;
  place: string;
  kind: ActivityKind;
  note?: string;
} & Geo;

export type TaskCategory = "Documents" | "Transport" | "Stay" | "Clothing" | "Essentials";
export type Task = { id: string; label: string; category: TaskCategory; done: boolean };

export type TripData = {
  trip: Trip;
  plans: Record<string, Activity[]>;
  tasks: Task[];
  saved?: Record<string, string[]>;
};

// trip.active.json is generated (git-ignored) by scripts/ensure-trip-data.mjs from your private
// trip.local.json — or from trip.demo.json when started with `npm run dev:demo`.
const data = raw as unknown as TripData;
if (!data?.trip?.cities?.length) throw new Error("trip data needs at least one city (check src/data/trip.local.json)");

export const seedTrip: Trip = data.trip;
export const seedPlans: Record<string, Activity[]> = data.plans ?? {};
export const seedTasks: Task[] = data.tasks ?? [];
export const seedSaved: Record<string, string[]> = data.saved ?? {};
export const TRIP_ID = seedTrip.id;

/* ───────── dates ───────── */

const ms = (iso: string) => Date.parse(iso + "T00:00:00Z");

export const addDays = (iso: string, n: number) => new Date(ms(iso) + n * 86_400_000).toISOString().slice(0, 10);
export const diffDays = (a: string, b: string) => Math.round((ms(b) - ms(a)) / 86_400_000);
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });

export const tripStart = (t: Trip) => t.cities[0].start;
export const tripEnd = (t: Trip) => t.cities[t.cities.length - 1].end;

export const tripDays = (t: Trip) => {
  const s = tripStart(t);
  return Array.from({ length: diffDays(s, tripEnd(t)) + 1 }, (_, i) => addDays(s, i));
};

/** The city you wake up / end up in that day (arrival city on travel days). */
export const cityFor = (t: Trip, date: string) => [...t.cities].reverse().find((c) => c.start <= date) ?? t.cities[0];

export const travelLeg = (t: Trip, date: string): string | null => {
  const i = t.cities.findIndex((c, k) => k > 0 && c.start === date);
  if (i > 0) return `${t.cities[i - 1].name} → ${t.cities[i].name}`;
  if (date === tripEnd(t)) return `${t.cities[t.cities.length - 1].name} → Home`;
  return null;
};
