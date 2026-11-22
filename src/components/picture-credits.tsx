import { CITY_ART, OUTFIT_ART } from "@/lib/images";

/** Every picture in the issue, with its source and licence. */
export function PictureCredits() {
  const rows = [
    ...Object.entries(CITY_ART).map(([k, a]) => ({ k: `city · ${k}`, ...a })),
    ...Object.entries(OUTFIT_ART).map(([k, a]) => ({ k: `look · ${k}`, ...a })),
  ];
  return (
    <details className="group/credits">
      <summary className="cursor-pointer font-mono text-[11px] tracking-[0.2em] uppercase underline-offset-4 hover:text-red hover:underline">
        Picture credits ({rows.length})
      </summary>
      <ul className="mt-3 grid gap-x-8 gap-y-1.5 font-mono text-[11px] leading-snug sm:grid-cols-2">
        {rows.map((r) => (
          <li key={r.k}>
            <span className="text-red">{r.k}</span> — {r.credit} ·{" "}
            <a href={r.source} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-red">
              {r.license}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
