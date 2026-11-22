import Link from "next/link";
import { CityList } from "@/components/city-list";
import { CoverHero } from "@/components/cover-hero";
import { ResetButton } from "@/components/reset-button";
import { TRIP_ID } from "@/lib/trip";

const CONTENTS = [
  { n: "02", title: "Itinerary", dek: "Day by day, cut and pasted.", href: "/itinerary", page: 14 },
  { n: "02½", title: "Weather & Outfits", dek: "Inside every day of the itinerary.", href: "/itinerary", page: 15 },
  { n: "03", title: "Checklist", dek: "Everything before the gate.", href: "/checklist", page: 32 },
  { n: "04", title: "Archive", dek: "Stamps, collected.", page: 48 },
];

export default function TripCover() {
  // One trip in Phase 1; the id becomes dynamic when trips are user-created.
  const base = `/trip/${TRIP_ID}`;

  return (
    <>
      <CoverHero />

      <section className="relative border-t-2 border-ink">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-14 md:grid-cols-12 md:px-8">
          <nav aria-label="In this issue" className="md:col-span-4">
            <h2 className="font-poster text-4xl uppercase">
              In this <span className="font-didone font-black text-red normal-case italic">issue</span>
            </h2>
            <ol className="mt-6 border-t border-ink">
              {CONTENTS.map((c) => {
                const inner = (
                  <>
                    <span className="w-7 font-mono text-xs text-red">{c.n}</span>
                    <span className="flex-1">
                      <span className="block font-didone text-2xl leading-tight font-bold">{c.title}</span>
                      <span className="block font-type text-sm text-ink-soft">{c.dek}</span>
                    </span>
                    <span className="font-mono text-xs tabular-nums">{c.href ? `p.${c.page}` : "next issue"}</span>
                  </>
                );
                return (
                  <li key={c.n} className="border-b border-ink">
                    {c.href ? (
                      <Link
                        href={base + c.href}
                        className="flex items-baseline gap-4 py-3 transition-[padding,color] duration-150 hover:pl-2 hover:text-red"
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div className="flex items-baseline gap-4 py-3 opacity-45">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="md:col-span-8">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase">Destinations & stays</p>
            <CityList />
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-ink">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-8">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase">Printed nowhere · Planned everywhere · Nº 01</p>
          <ResetButton />
        </div>
      </footer>
    </>
  );
}
