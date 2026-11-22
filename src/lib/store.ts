"use client";

import { useSyncExternalStore } from "react";
import { seedPlans, seedTasks, seedTrip, type Activity, type Task, type Trip } from "./trip";

/** Everything Vivian edits, persisted to localStorage. Phase 1 only — swap for Supabase later. */
export type TripState = {
  v: 1;
  trip: Trip;
  plans: Record<string, Activity[]>; // by date
  saved: Record<string, string[]>; // outfit ids pinned per date
  tasks: Task[];
};

const KEY = "dada-trip:v1";

export const seedState: TripState = { v: 1, trip: seedTrip, plans: seedPlans, saved: {}, tasks: seedTasks };

let cache: TripState | null = null;
const listeners = new Set<() => void>();

function read(): TripState {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as TripState) : null;
    cache = parsed?.v === 1 ? parsed : seedState;
  } catch {
    cache = seedState;
  }
  return cache;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function update(fn: (s: TripState) => TripState) {
  cache = fn(read());
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* private mode / quota — keep working in memory */
  }
  listeners.forEach((l) => l());
}

export function resetAll() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  cache = seedState;
  listeners.forEach((l) => l());
}

/** Server and first client render use the seed; real data swaps in right after hydration. */
export function useTripState(): TripState {
  return useSyncExternalStore(subscribe, read, () => seedState);
}

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
