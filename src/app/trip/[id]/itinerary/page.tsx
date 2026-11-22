import { Suspense } from "react";
import { DadaLoader } from "@/components/dada-loader";
import { ItineraryView } from "@/components/itinerary-view";
import { PageTransition } from "@/components/transitions";

export default function Itinerary() {
  return (
    <PageTransition>
      <div>
        <Suspense fallback={<DadaLoader label="Unfolding" className="px-4 py-16 md:px-8" />}>
          <ItineraryView />
        </Suspense>
      </div>
    </PageTransition>
  );
}
