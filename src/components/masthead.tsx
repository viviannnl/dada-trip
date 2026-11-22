"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const SECTIONS = [
  { n: "01", label: "Overview", href: "" },
  { n: "02", label: "Itinerary", href: "/itinerary" },
  { n: "03", label: "Checklist", href: "/checklist" },
];

type Props = { tripId: string; issue: string; season: string };

/** Reads the URL to highlight the current section. Wrap in <Suspense fallback={<MastheadFrame/>}>. */
export function Masthead({ issue, season }: { issue: string; season: string }) {
  const { id } = useParams<{ id: string }>();
  return <MastheadFrame tripId={id} issue={issue} season={season} path={usePathname()} />;
}

export function MastheadFrame({ tripId, issue, season, path }: Props & { path?: string }) {
  const base = `/trip/${tripId}`;
  return (
    <header className="relative z-20 border-b-2 border-ink bg-paper">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-2 md:px-8">
        <Link href={base} className="font-poster text-lg tracking-wide uppercase md:text-xl">
          Europe, Unfolded<span className="text-red">.</span>
        </Link>
        <span className="hidden font-mono text-[11px] tracking-[0.2em] uppercase sm:block">
          Issue Nº {issue} · {season}
        </span>
      </div>
      <nav aria-label="Sections" className="border-t border-ink">
        <ul className="mx-auto flex max-w-[1400px] gap-5 overflow-x-auto px-4 py-1.5 md:px-8">
          {SECTIONS.map((s) => {
            const href = base + s.href;
            const active = path !== undefined && (s.href === "" ? path === base : path.startsWith(href));
            return (
              <li key={s.n}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-baseline gap-1.5 whitespace-nowrap font-mono text-xs tracking-[0.14em] uppercase transition-colors duration-150 hover:text-red ${
                    active ? "text-red" : "text-ink"
                  }`}
                >
                  <span className="text-[10px] opacity-70">{s.n}</span>
                  <span className={active ? "underline decoration-2 underline-offset-4" : "underline-offset-4 group-hover:underline"}>
                    {s.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
