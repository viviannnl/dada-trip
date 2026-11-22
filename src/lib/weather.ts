"use client";

import { useCallback, useEffect, useState } from "react";
import { diffDays, todayISO, type City } from "./trip";

export type DayWeather = {
  date: string;
  high: number;
  low: number;
  precip: number; // % chance (forecast) or % of past years with ≥1mm (climate)
  wind: number; // km/h
  code: number; // WMO weather code
  source: "forecast" | "climate";
  years?: number;
};

const FORECAST_DAYS = 16;
const CLIMATE_YEARS = 10;

/* ───────── WMO code → words ───────── */
export function describe(code: number) {
  if (code === 0) return "Clear";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  return "Thunder";
}

/* ───────── fetchers (memoised per session) ───────── */

const inflight = new Map<string, Promise<unknown>>();
function once<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (!inflight.has(key)) inflight.set(key, fn().catch((e) => (inflight.delete(key), Promise.reject(e))));
  return inflight.get(key) as Promise<T>;
}

async function getJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather service replied ${res.status}`);
  return res.json();
}

async function forecast(city: City, date: string): Promise<DayWeather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max` +
    `&timezone=auto&start_date=${date}&end_date=${date}`;
  const j = await once(`f:${city.slug}:${date}`, () => getJSON(url));
  const d = (j as { daily: Record<string, number[]> }).daily;
  return {
    date,
    high: Math.round(d.temperature_2m_max[0]),
    low: Math.round(d.temperature_2m_min[0]),
    precip: Math.round(d.precipitation_probability_max[0] ?? 0),
    wind: Math.round(d.wind_speed_10m_max[0]),
    code: d.weather_code[0],
    source: "forecast",
  };
}

type Archive = { time: string[]; tmax: number[]; tmin: number[]; rain: number[]; wind: number[]; code: number[] };
const ARCHIVE_TTL = 30 * 86_400_000;

async function archive(city: City): Promise<Archive> {
  const lsKey = `dada-trip:climate:${city.slug}`;
  try {
    const hit = JSON.parse(localStorage.getItem(lsKey) ?? "null");
    if (hit && Date.now() - hit.at < ARCHIVE_TTL) return hit.data;
  } catch {}
  const y = new Date().getFullYear();
  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}` +
    `&start_date=${y - CLIMATE_YEARS}-01-01&end_date=${y - 1}-12-31` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code&timezone=auto`;
  const j = (await once(`a:${city.slug}`, () => getJSON(url))) as { daily: Record<string, (number | string)[]> };
  const d = j.daily;
  const data: Archive = {
    time: d.time as string[],
    tmax: d.temperature_2m_max as number[],
    tmin: d.temperature_2m_min as number[],
    rain: d.precipitation_sum as number[],
    wind: d.wind_speed_10m_max as number[],
    code: d.weather_code as number[],
  };
  try {
    localStorage.setItem(lsKey, JSON.stringify({ at: Date.now(), data }));
  } catch {}
  return data;
}

async function climate(city: City, date: string): Promise<DayWeather> {
  const a = await archive(city);
  const md = date.slice(5);
  const idx = a.time.map((t, i) => (t.slice(5) === md ? i : -1)).filter((i) => i >= 0 && a.tmax[i] != null);
  if (!idx.length) throw new Error("No climate history for this date");
  const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const codes = new Map<number, number>();
  idx.forEach((i) => codes.set(a.code[i], (codes.get(a.code[i]) ?? 0) + 1));
  return {
    date,
    high: Math.round(avg(idx.map((i) => a.tmax[i]))),
    low: Math.round(avg(idx.map((i) => a.tmin[i]))),
    precip: Math.round((idx.filter((i) => a.rain[i] >= 1).length / idx.length) * 100),
    wind: Math.round(avg(idx.map((i) => a.wind[i]))),
    code: [...codes.entries()].sort((x, y) => y[1] - x[1])[0][0],
    source: "climate",
    years: idx.length,
  };
}

/* ───────── hook ───────── */

type Result = { status: "error"; message: string } | { status: "ok"; data: DayWeather };
type State = { status: "loading" } | Result;

export function useWeather(city: City, date: string) {
  const [attempt, setAttempt] = useState(0);
  const key = `${city.slug}|${city.lat}|${city.lon}|${date}|${attempt}`;
  const [res, setRes] = useState<{ key: string; r: Result } | null>(null);

  useEffect(() => {
    let live = true;
    const ahead = diffDays(todayISO(), date);
    const job = ahead >= 0 && ahead < FORECAST_DAYS ? forecast(city, date) : climate(city, date);
    job.then(
      (data) => live && setRes({ key, r: { status: "ok", data } }),
      (e: Error) =>
        live && setRes({ key, r: { status: "error", message: e.message || "Couldn't reach the weather service" } }),
    );
    return () => {
      live = false;
    };
  }, [key, city, date]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const state: State = res?.key === key ? res.r : { status: "loading" };
  return { ...state, retry };
}
