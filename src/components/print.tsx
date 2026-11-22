import type { CSSProperties, ReactNode } from "react";
import { hash, pick, range, rng, tornClip } from "@/lib/seeded";

/* ───────── Ransom: each letter cut from a different "magazine" ───────── */

const FACES = ["font-didone italic", "font-poster", "font-mono font-bold", "font-type", "font-didone font-black", "font-grotesk font-extrabold"];
const SKINS = [
  "",
  "",
  "bg-ink text-newsprint px-[0.06em]",
  "bg-red text-newsprint px-[0.06em]",
  "bg-newsprint px-[0.05em] paper-shadow",
  "bg-kraft px-[0.05em]",
];

export function Ransom({
  text,
  seed = 0,
  className = "",
  as: Tag = "span",
}: {
  text: string;
  seed?: number;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3";
}) {
  const r = rng(hash(text) + seed);
  return (
    <Tag className={`ransom inline-flex items-baseline ${className.includes("flex-nowrap") ? "" : "flex-wrap"} ${className}`} aria-label={text}>
      {[...text].map((ch, i) => {
        if (ch === " ") return <span key={i} className="w-[0.3em]" aria-hidden />;
        const rot = range(r, -7, 7);
        const scale = range(r, 0.85, 1.15);
        return (
          <span
            key={i}
            aria-hidden
            className={`ransom-letter inline-block leading-none ${pick(r, FACES)} ${pick(r, SKINS)}`}
            style={{ "--r": `${rot}deg`, transform: `rotate(${rot}deg)`, fontSize: `${scale}em` } as CSSProperties}
          >
            {ch}
          </span>
        );
      })}
    </Tag>
  );
}

/* ───────── Torn paper slip ───────── */

export function Torn({
  seed,
  className = "",
  children,
  depth = 5,
  style,
}: {
  seed: number;
  className?: string;
  children: ReactNode;
  depth?: number;
  style?: CSSProperties;
}) {
  return (
    <div className={className} style={{ clipPath: tornClip(seed, depth), ...style }}>
      {children}
    </div>
  );
}

/* ───────── Rubber stamp ───────── */

const STAMP_COLOR = { red: "var(--red)", blue: "var(--blue)", olive: "var(--olive)", ink: "var(--ink)" };

export function Stamp({
  top,
  middle,
  bottom,
  color = "red",
  size = 128,
  rotate = -12,
  className = "",
}: {
  top: string;
  middle: string;
  bottom?: string;
  color?: keyof typeof STAMP_COLOR;
  size?: number;
  rotate?: number;
  className?: string;
}) {
  const id = `arc-${hash(top + middle + (bottom ?? ""))}`;
  const c = STAMP_COLOR[color];
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`stamp-ink ink-rough ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, opacity: 0.86 }}
      aria-hidden
    >
      <defs>
        <path id={`${id}-t`} d="M 22 60 A 38 38 0 0 1 98 60" />
        <path id={`${id}-b`} d="M 18 60 A 42 42 0 0 0 102 60" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke={c} strokeWidth="3" />
      <circle cx="60" cy="60" r="49" fill="none" stroke={c} strokeWidth="1.2" />
      <text fill={c} fontSize="11" letterSpacing="2.5" style={{ fontFamily: "var(--font-spacemono)", fontWeight: 700 }}>
        <textPath href={`#${id}-t`} startOffset="50%" textAnchor="middle">
          {top.toUpperCase()}
        </textPath>
      </text>
      {bottom && (
        <text fill={c} fontSize="9" letterSpacing="2" style={{ fontFamily: "var(--font-spacemono)" }}>
          <textPath href={`#${id}-b`} startOffset="50%" textAnchor="middle" dominantBaseline="hanging">
            {bottom.toUpperCase()}
          </textPath>
        </text>
      )}
      <rect x="18" y="52" width="84" height="18" fill={c} />
      <text
        x="60"
        y="65.5"
        textAnchor="middle"
        fill="var(--paper)"
        fontSize="13"
        letterSpacing="1"
        style={{ fontFamily: "var(--font-anton)" }}
      >
        {middle.toUpperCase()}
      </text>
    </svg>
  );
}

/* ───────── Tape ───────── */

export function Tape({ className = "", rotate = -4 }: { className?: string; rotate?: number }) {
  return <span aria-hidden className={`tape ${className}`} style={{ transform: `rotate(${rotate}deg)` }} />;
}
