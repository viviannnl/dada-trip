import { Suspense } from "react";
import { Masthead, MastheadFrame } from "@/components/masthead";
import { seedTrip as trip } from "@/lib/trip";

export function generateStaticParams() {
  return [{ id: trip.id }];
}

export default function TripLayout({ children }: LayoutProps<"/trip/[id]">) {
  return (
    <>
      <Suspense fallback={<MastheadFrame tripId={trip.id} issue={trip.issue} season={trip.season} />}>
        <Masthead issue={trip.issue} season={trip.season} />
      </Suspense>
      <main>{children}</main>
    </>
  );
}
