"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Plus, X } from "lucide-react";
import { uid, update, useTripState } from "@/lib/store";
import type { Task } from "@/lib/trip";
import { Stamp, Torn } from "./print";

const CATS = ["All", "Documents", "Transport", "Stay", "Clothing", "Essentials"] as const;
type Cat = (typeof CATS)[number];
const SKIN = ["bg-newsprint", "bg-kraft/70", "bg-paper-deep newsprint-lines"];

export function Checklist() {
  const { tasks } = useTripState();
  const setTasks = (fn: (ts: Task[]) => Task[]) => update((s) => ({ ...s, tasks: fn(s.tasks) }));
  const [cat, setCat] = useState<Cat>("All");
  const [draft, setDraft] = useState("");
  const [draftCat, setDraftCat] = useState<Task["category"]>("Essentials");
  const inputId = useId();

  const visible = useMemo(() => (cat === "All" ? tasks : tasks.filter((t) => t.category === cat)), [tasks, cat]);
  const done = tasks.filter((t) => t.done).length;
  const allDone = tasks.length > 0 && done === tasks.length;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const label = draft.trim();
    if (!label) return;
    setTasks((t) => [{ id: uid(), label, category: draftCat, done: false }, ...t]);
    setDraft("");
  };

  return (
    <div>
      {/* ── progress headline ── */}
      <div className="relative flex flex-wrap items-end gap-x-6 gap-y-2 border-b-2 border-ink pb-4">
        <p className="font-poster text-[clamp(5rem,15vw,11rem)] leading-[0.8] tabular-nums" aria-live="polite">
          {done}
          <span className="mx-1 inline-block rotate-12 text-red">/</span>
          {tasks.length}
        </p>
        <div className="pb-2">
          <p className="font-didone text-3xl italic">done.</p>
          <p className="font-mono text-xs tracking-[0.16em] uppercase">
            {allDone ? "You are ready. Go." : `${tasks.length - done} things stand between you and the gate`}
          </p>
        </div>
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, scale: 1.8, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="pointer-events-none absolute right-0 -bottom-10"
            >
              <Stamp top="Europe" middle="Ready" bottom="Bon voyage" size={150} rotate={0} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── add + filter ── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <form onSubmit={add} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1">
            <label htmlFor={inputId} className="font-mono text-[11px] tracking-[0.2em] uppercase">
              Paste in a new task
            </label>
            <input
              id={inputId}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. Book Pompidou tickets"
              className="mt-1 w-full border-b-2 border-ink bg-transparent py-1.5 font-type text-lg outline-none placeholder:text-ink-soft/60 focus-visible:border-red focus-visible:outline-none"
            />
          </div>
          <label className="sr-only" htmlFor={inputId + "-cat"}>
            Category
          </label>
          <select
            id={inputId + "-cat"}
            value={draftCat}
            onChange={(e) => setDraftCat(e.target.value as Task["category"])}
            className="border-2 border-ink bg-paper px-2 py-2 font-mono text-xs uppercase"
          >
            {CATS.slice(1).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!draft.trim()}
            className="inline-flex items-center gap-1.5 bg-red px-4 py-2.5 font-mono text-xs tracking-[0.14em] text-newsprint uppercase transition-[background-color,transform] duration-150 hover:bg-ink active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={14} aria-hidden /> Add
          </button>
        </form>

        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1.5">
          {CATS.map((c) => {
            const n = c === "All" ? tasks.length : tasks.filter((t) => t.category === c).length;
            const on = c === cat;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setCat(c)}
                className={`border-2 border-ink px-2.5 py-1 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors duration-150 ${
                  on ? "bg-ink text-paper" : "hover:bg-ink/10"
                }`}
              >
                {c} <span className="opacity-60">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── slips ── */}
      {visible.length === 0 ? (
        <div className="mt-12 border-2 border-dashed border-ink p-8 text-center">
          <p className="font-didone text-3xl italic">Nothing filed under {cat}.</p>
          <p className="mt-2 font-type">Suspicious. Paste a task in above.</p>
        </div>
      ) : (
        <motion.ul layout className="mt-10 grid gap-x-6 gap-y-4 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {visible.map((t, i) => (
              <motion.li
                key={t.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                className={`group relative ${i % 3 === 0 ? "-rotate-[0.6deg]" : i % 3 === 1 ? "rotate-[0.5deg]" : ""}`}
              >
                <Torn
                  seed={t.label.length * 7 + i}
                  depth={4}
                  className={`paper-shadow transition-opacity duration-250 ${SKIN[i % SKIN.length]} ${t.done ? "opacity-70" : ""}`}
                >
                  <div className="flex items-center gap-3 py-4 pr-3 pl-4">
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden
                        className="grid size-6 shrink-0 place-items-center border-2 border-ink transition-colors duration-150 peer-checked:border-red peer-checked:bg-red peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue"
                      >
                        {t.done && <Check size={16} strokeWidth={3} className="text-newsprint" />}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block font-type text-[17px] leading-snug break-words decoration-red decoration-2 ${
                            t.done ? "line-through" : ""
                          }`}
                        >
                          {t.label}
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.18em] text-ink-soft uppercase">
                          {t.category}
                        </span>
                      </span>
                    </label>
                    <button
                      type="button"
                      aria-label={`Delete “${t.label}”`}
                      onClick={() => setTasks((ts) => ts.filter((x) => x.id !== t.id))}
                      className="rounded-sm p-1.5 text-ink-soft transition-[opacity,background-color,color] duration-150 hover:bg-ink hover:text-paper focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    >
                      <X size={16} aria-hidden />
                    </button>
                  </div>
                </Torn>
                <AnimatePresence>
                  {t.done && (
                    <motion.span
                      aria-hidden
                      initial={{ opacity: 0, scale: 1.7 }}
                      animate={{ opacity: 0.9, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 600, damping: 24 }}
                      className="stamp-ink pointer-events-none absolute top-1/2 right-12 -translate-y-1/2 -rotate-12 border-[3px] border-red px-2 py-0.5 font-poster text-xl tracking-wider text-red uppercase"
                    >
                      Done
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
