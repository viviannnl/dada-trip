"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { hash, pick, range, rng } from "@/lib/seeded";

const KEY = "dada-trip:intro-seen";
const WORDS = ["EUROPE,", "UNFOLDED."];
const FACES = [
  "font-didone italic font-black",
  "font-poster",
  "font-mono font-bold",
  "font-type",
  "font-grotesk font-extrabold",
];
const SKINS = ["", "bg-ink text-newsprint", "bg-red text-newsprint", "bg-newsprint paper-shadow", "bg-kraft", ""];

/** Runs before first paint: hides the splash if it already played this session. */
export const introGateScript = `try{if(sessionStorage.getItem("${KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.introSeen="1"}catch(e){}`;

/** Once per session: the masthead is slammed together from cut-out letters, then torn away. */
export function IntroSplash() {
  const [phase, setPhase] = useState<"show" | "leave" | "gone">("show");

  useEffect(() => {
    // already seen this session: CSS keeps it display:none, nothing to animate
    if (document.documentElement.dataset.introSeen) return;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    const t1 = setTimeout(() => setPhase("leave"), 1250);
    const t2 = setTimeout(() => setPhase("gone"), 1650);
    const skip = () => setPhase("leave");
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  useEffect(() => {
    if (phase !== "leave") return;
    const t = setTimeout(() => setPhase("gone"), 400);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "gone") return null;

  const r = rng(hash("intro"));
  let n = 0;
  return (
    <div
      aria-hidden
      onClick={() => setPhase("leave")}
      className={`intro-splash fixed inset-0 z-[150] grid cursor-pointer place-items-center bg-paper px-4 ${phase === "leave" ? "is-leaving" : ""}`}
    >
      <div aria-hidden className="absolute top-[12%] right-[10%] aspect-square w-[34vmin] rounded-full bg-red" />
      <div aria-hidden className="absolute bottom-0 left-[12%] aspect-[2/1] w-[30vmin] rounded-t-full bg-blue" />
      <div className="relative text-center">
        {WORDS.map((w) => (
          <div key={w} className="flex flex-wrap justify-center gap-[0.04em] text-[clamp(3rem,11vw,9rem)] leading-none">
            {[...w].map((ch, i) => {
              const rot = range(r, -9, 9);
              const delay = n++ * 55;
              return (
                <span
                  key={i}
                  className={`slam inline-block px-[0.04em] ${pick(r, FACES)} ${pick(r, SKINS)}`}
                  style={{ "--r": `${rot}deg`, animationDelay: `${delay}ms` } as CSSProperties}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        ))}
        <p
          className="slam mt-6 font-mono text-xs tracking-[0.3em] uppercase"
          style={{ "--r": "0deg", animationDelay: `${n * 55 + 80}ms` } as CSSProperties}
        >
          A travel planner disguised as a magazine
        </p>
      </div>
    </div>
  );
}
