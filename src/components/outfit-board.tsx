"use client";

import { AnimatePresence, motion } from "motion/react";
import { Heart } from "lucide-react";
import type { Outfit } from "@/lib/outfits";
import { Stamp, Tape, Torn } from "./print";
import { FigureCutout } from "./clipping";
import { outfitArt } from "@/lib/images";

const LOOK = [
  { skin: "bg-newsprint", rot: "-rotate-3", title: "text-ink" },
  { skin: "bg-ink text-newsprint", rot: "rotate-2 md:mt-10", title: "text-newsprint" },
  { skin: "bg-kraft", rot: "-rotate-1 md:-mt-4", title: "text-ink" },
];

export function OutfitBoard({
  outfits,
  saved,
  onToggle,
  dayLabel,
}: {
  outfits: Outfit[];
  saved: string[];
  onToggle: (id: string) => void;
  dayLabel: string;
}) {
  return (
    <ul className="grid gap-8 sm:grid-cols-3 sm:gap-3">
      {outfits.map((o, i) => {
        const look = LOOK[i % LOOK.length];
        const on = saved.includes(o.id);
        const art = outfitArt(o.id);
        return (
          <li key={o.id} className={`group relative ${look.rot} ${art ? "pt-24" : ""}`}>
            {art && (
              <FigureCutout
                art={art}
                className="pointer-events-none absolute top-0 left-1/2 z-10 h-40 w-32 -translate-x-1/2 transition-transform duration-250 ease-out group-hover:-translate-y-2 group-hover:rotate-3 group-focus-within:-translate-y-2 motion-reduce:transition-none"
              />
            )}
            <Tape
              className={`${art ? "top-[5.25rem] left-2" : "-top-3 left-1/2 -translate-x-1/2"}`}
              rotate={i % 2 ? 4 : -5}
            />
            <Torn
              seed={40 + i}
              depth={6}
              className={`paper-shadow ${look.skin} px-4 ${art ? "pt-14" : "pt-6"} pb-4 transition-transform duration-250 group-hover:-translate-y-1`}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-70">Look 0{i + 1}</p>
              <h3 className={`mt-1 font-didone text-2xl leading-[1.05] font-black italic ${look.title}`}>{o.name}</h3>
              <ul className="mt-3 space-y-1 font-type text-[15px] leading-snug">
                {o.pieces.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span aria-hidden className="text-red">
                      ✕
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="rounded-full bg-red px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-newsprint uppercase">
                  {o.tag}
                </span>
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={on ? `Unpin ${o.name}` : `Pin ${o.name} to this day`}
                  onClick={() => onToggle(o.id)}
                  className="rounded-full p-2 transition-[background-color,transform] duration-150 hover:bg-red/15 active:scale-90"
                >
                  <Heart size={20} aria-hidden className={on ? "fill-red text-red" : ""} />
                </button>
              </div>
            </Torn>
            <AnimatePresence>
              {on && (
                <motion.div
                  key="stamp"
                  aria-hidden
                  initial={{ opacity: 0, scale: 1.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 520, damping: 26 }}
                  className="pointer-events-none absolute top-16 -right-4 z-20"
                >
                  <Stamp top={dayLabel} middle="Pinned" bottom="Wardrobe" size={92} rotate={-16} />
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
