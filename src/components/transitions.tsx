import { ViewTransition, type ReactNode } from "react";

/** Wrap each section page: tagged navigations tear the old page out and drop the new one in. */
export function PageTransition({ children }: { children: ReactNode }) {
  const map = { "page-forward": "page-forward", "page-back": "page-back", default: "none" };
  return (
    <ViewTransition enter={map} exit={map} default="none">
      {children}
    </ViewTransition>
  );
}

/** Keyed by date inside the itinerary: next/prev day turns the page sideways. */
export function DayTransition({ day, children }: { day: string; children: ReactNode }) {
  const map = { "day-next": "day-next", "day-prev": "day-prev", default: "none" };
  return (
    <ViewTransition key={day} enter={map} exit={map} default="none">
      {children}
    </ViewTransition>
  );
}

export const SECTION_ORDER = ["", "/itinerary", "/checklist"] as const;

/** "page-forward" when moving right in the section order, else "page-back". */
export function sectionDirection(fromPath: string | undefined, toHref: string) {
  const idx = (p: string) => {
    const tail = p.replace(/^\/trip\/[^/]+/, "").split("?")[0];
    const i = SECTION_ORDER.findIndex((s) => s === tail);
    return i === -1 ? 0 : i;
  };
  return idx(toHref) >= idx(fromPath ?? "") ? "page-forward" : "page-back";
}
