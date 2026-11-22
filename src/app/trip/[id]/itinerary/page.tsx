import { Suspense } from "react";
import { ItineraryView } from "@/components/itinerary-view";

export default function Itinerary() {
  return (
    <Suspense fallback={<p className="px-4 py-10 font-mono text-xs tracking-[0.2em] uppercase md:px-8">Unfolding the day…</p>}>
      <ItineraryView />
    </Suspense>
  );
}
