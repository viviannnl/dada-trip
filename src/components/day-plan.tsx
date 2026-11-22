"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, Reorder, useDragControls, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUp, GripVertical, Minus, Pencil, Plus, X } from "lucide-react";
import { uid } from "@/lib/store";
import type { Activity, ActivityKind } from "@/lib/trip";
import { Torn } from "./print";

const KIND: Record<ActivityKind, { label: string; cls: string }> = {
  food: { label: "Eat", cls: "bg-red text-newsprint" },
  art: { label: "Look", cls: "bg-blue text-newsprint" },
  walk: { label: "Wander", cls: "bg-olive text-newsprint" },
  transit: { label: "Move", cls: "bg-ink text-newsprint" },
  night: { label: "Night", cls: "bg-ink text-newsprint" },
};
const SKIN = ["bg-newsprint", "bg-paper-deep", "bg-newsprint newsprint-lines", "bg-kraft"];
const iconBtn =
  "rounded-sm p-1 text-ink-soft transition-colors duration-150 hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-25";

/** Insert keeping chronological order; untimed items go last. */
function insertByTime(items: Activity[], a: Activity) {
  if (!a.time) return [...items, a];
  const at = items.findIndex((x) => x.time && x.time > a.time);
  return at === -1 ? [...items, a] : [...items.slice(0, at), a, ...items.slice(at)];
}

export function DayPlan({ items, onChange }: { items: Activity[]; onChange: (next: Activity[]) => void }) {
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const patch = (a: Activity) => onChange(items.map((x) => (x.id === a.id ? a : x)));
  const remove = (id: string) => onChange(items.filter((x) => x.id !== id));

  return (
    <div>
      {items.length === 0 ? (
        <div className="border-2 border-dashed border-ink p-8 text-center">
          <p className="font-didone text-3xl italic">A blank page.</p>
          <p className="mt-1 font-type">The best kind. Paste the first plan in below.</p>
        </div>
      ) : (
        <div className="relative">
          <span aria-hidden className="absolute top-2 bottom-2 left-[3.5rem] w-[3px] bg-red md:left-[4.4rem]" />
          <Reorder.Group axis="y" values={items} onReorder={onChange} className="space-y-5">
            {items.map((a, i) => (
              <Slip key={a.id} a={a} i={i} last={items.length - 1} onMove={move} onSave={patch} onDelete={remove} />
            ))}
          </Reorder.Group>
        </div>
      )}

      <div className="mt-10 border-t-2 border-ink pt-5">
        <p className="mb-3 font-poster text-2xl uppercase">
          Add to the <span className="font-didone font-black text-red normal-case italic">day</span>
        </p>
        <ActivityForm key={items.length} submitLabel="Paste it in" onSubmit={(a) => onChange(insertByTime(items, a))} />
      </div>
    </div>
  );
}

function Slip({
  a,
  i,
  last,
  onMove,
  onSave,
  onDelete,
}: {
  a: Activity;
  i: number;
  last: number;
  onMove: (i: number, d: -1 | 1) => void;
  onSave: (a: Activity) => void;
  onDelete: (id: string) => void;
}) {
  const controls = useDragControls();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const tilt = reduce || editing ? 0 : [-0.8, 0.6, -0.4, 0.9, -0.6][i % 5];
  const seed = [...a.id].reduce((s, c) => s + c.charCodeAt(0), 0) * 13;

  return (
    <Reorder.Item
      value={a}
      dragListener={false}
      dragControls={controls}
      initial={false}
      style={{ rotate: tilt }}
      whileDrag={{ scale: 1.03, rotate: 0, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      id={`plan-${a.id}`}
      className="group relative grid grid-cols-[3rem_1fr] items-start gap-3 md:grid-cols-[3.8rem_1fr] md:gap-5"
    >
      <span className="pt-4 text-right font-mono text-sm font-bold tabular-nums md:text-base">
        {a.time || <span className="text-ink-soft">any</span>}
      </span>
      <span
        aria-hidden
        className="absolute top-[1.35rem] left-[3.25rem] size-3 rounded-full border-2 border-red bg-paper md:left-[4.15rem]"
      />

      <Torn seed={seed} depth={4} className={`paper-shadow ml-3 ${SKIN[i % SKIN.length]}`}>
        {editing ? (
          <div className="p-4">
            <ActivityForm
              initial={a}
              submitLabel="Save"
              onSubmit={(next) => {
                const samePlace = next.place === a.place;
                onSave({ ...next, id: a.id, ...(samePlace ? { lat: a.lat, lon: a.lon, geo: a.geo } : {}) });
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <div className="flex items-start gap-2 py-4 pr-2 pl-4 md:pl-5">
            <div className="min-w-0 flex-1">
              <span className={`inline-block px-1.5 py-0.5 font-mono text-[10px] tracking-[0.18em] uppercase ${KIND[a.kind].cls}`}>
                {KIND[a.kind].label}
              </span>
              <h3 className="mt-1.5 font-didone text-xl leading-tight font-bold break-words md:text-2xl">{a.title}</h3>
              {a.place && (
                <p className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-xs break-words text-ink-soft">
                  {a.lat != null && (
                    <span
                      aria-label={`Pin ${i + 1} on the map`}
                      className="grid size-5 place-items-center bg-ink font-poster text-[11px] text-newsprint"
                    >
                      {i + 1}
                    </span>
                  )}
                  {a.place}
                  {a.geo === "miss" && <span className="text-red">· not on the map — try a fuller address</span>}
                </p>
              )}

              {a.note && (
                <>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpen((o) => !o)}
                    className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] tracking-[0.14em] text-red uppercase underline-offset-4 hover:underline"
                  >
                    {open ? <Minus size={12} aria-hidden /> : <Plus size={12} aria-hidden />}
                    {open ? "Fold note" : "Unfold note"}
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                        className="mt-2 max-w-prose border-l-2 border-red pl-3 font-type text-sm"
                      >
                        {a.note}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-0.5 md:grid-cols-1">
              <button
                type="button"
                aria-label={`Drag to reorder ${a.title}`}
                onPointerDown={(e) => controls.start(e)}
                className={`${iconBtn} cursor-grab touch-none active:cursor-grabbing`}
              >
                <GripVertical size={16} aria-hidden />
              </button>
              <button type="button" aria-label={`Edit ${a.title}`} onClick={() => setEditing(true)} className={iconBtn}>
                <Pencil size={14} aria-hidden />
              </button>
              <button type="button" aria-label={`Move ${a.title} earlier`} disabled={i === 0} onClick={() => onMove(i, -1)} className={iconBtn}>
                <ArrowUp size={14} aria-hidden />
              </button>
              <button type="button" aria-label={`Move ${a.title} later`} disabled={i === last} onClick={() => onMove(i, 1)} className={iconBtn}>
                <ArrowDown size={14} aria-hidden />
              </button>
              <button type="button" aria-label={`Delete ${a.title}`} onClick={() => onDelete(a.id)} className={`${iconBtn} hover:bg-red`}>
                <X size={14} aria-hidden />
              </button>
            </div>
          </div>
        )}
      </Torn>
    </Reorder.Item>
  );
}

const input =
  "block w-full border-b-2 border-ink bg-transparent py-1 font-type text-base outline-none placeholder:text-ink-soft/60 focus-visible:border-red focus-visible:outline-none";
const lab = "font-mono text-[10px] tracking-[0.18em] uppercase";

function ActivityForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Activity;
  submitLabel: string;
  onSubmit: (a: Activity) => void;
  onCancel?: () => void;
}) {
  const id = useId();
  const [title, setTitle] = useState(initial?.title ?? "");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!title.trim()) return;
    onSubmit({
      id: uid(),
      title: title.trim(),
      time: String(f.get("time") ?? ""),
      place: String(f.get("place") ?? "").trim(),
      kind: String(f.get("kind")) as ActivityKind,
      note: String(f.get("note") ?? "").trim() || undefined,
    });
  };

  return (
    <form
      onSubmit={submit}
      onKeyDown={(e) => onCancel && e.key === "Escape" && onCancel()}
      className="grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-3"
    >
      <div>
        <label htmlFor={`${id}-time`} className={lab}>
          Time
        </label>
        <input id={`${id}-time`} name="time" type="time" defaultValue={initial?.time} className={input} />
      </div>
      <div>
        <label htmlFor={`${id}-title`} className={lab}>
          What
        </label>
        <input
          id={`${id}-title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Musée d'Orsay"
          autoFocus={!!initial}
          className={input}
        />
      </div>
      <div>
        <label htmlFor={`${id}-kind`} className={lab}>
          Kind
        </label>
        <select
          id={`${id}-kind`}
          name="kind"
          defaultValue={initial?.kind ?? "art"}
          className="mt-1 block w-full border-2 border-ink bg-paper px-1.5 py-1 font-mono text-xs uppercase"
        >
          {(Object.keys(KIND) as ActivityKind[]).map((k) => (
            <option key={k} value={k}>
              {KIND[k].label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${id}-place`} className={lab}>
          Where
        </label>
        <input id={`${id}-place`} name="place" defaultValue={initial?.place} placeholder="Address or area" className={input} />
      </div>
      <div className="col-span-2">
        <label htmlFor={`${id}-note`} className={lab}>
          Note <span className="normal-case opacity-60">(optional)</span>
        </label>
        <textarea id={`${id}-note`} name="note" rows={2} defaultValue={initial?.note} className={`${input} resize-y`} />
      </div>
      <div className="col-span-2 flex gap-2">
        <button
          type="submit"
          disabled={!title.trim()}
          className="inline-flex items-center gap-1.5 bg-red px-4 py-2 font-mono text-xs tracking-[0.14em] text-newsprint uppercase transition-[background-color,transform] duration-150 hover:bg-ink active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
        >
          {!initial && <Plus size={14} aria-hidden />} {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 font-mono text-xs tracking-[0.14em] uppercase underline-offset-4 hover:underline"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
