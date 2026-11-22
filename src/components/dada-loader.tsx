import type { CSSProperties } from "react";

const SKINS = ["bg-ink text-newsprint", "bg-red text-newsprint", "bg-newsprint text-ink", "bg-kraft text-ink"];
const FACES = ["font-poster", "font-didone italic font-black", "font-mono font-bold", "font-type"];

/** Ransom letters hopping in turn next to a spinning rubber stamp. Pure CSS — safe in Suspense fallbacks. */
export function DadaLoader({ label = "Loading", className = "" }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={`flex items-center gap-4 ${className}`}>
      <span
        aria-hidden
        className="dada-spin grid size-11 shrink-0 place-items-center rounded-full border-[3px] border-red text-red"
      >
        <span className="size-7 rounded-full border border-red" />
      </span>
      <span aria-hidden className="flex items-end gap-0.5 text-2xl">
        {[...label.toUpperCase()].map((ch, i) => (
          <span
            key={i}
            className={`dada-hop inline-block px-1 leading-none ${SKINS[i % SKINS.length]} ${FACES[(i * 3) % FACES.length]}`}
            style={
              { animationDelay: `${i * 70}ms`, rotate: `${(i % 2 ? 1 : -1) * (3 + (i % 3) * 2)}deg` } as CSSProperties
            }
          >
            {ch === " " ? " " : ch}
          </span>
        ))}
        <span className="dada-dots ml-1 font-mono text-base">...</span>
      </span>
      <span className="sr-only">{label}…</span>
    </div>
  );
}
