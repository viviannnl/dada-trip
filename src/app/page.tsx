import { redirect } from "next/navigation";
import { TRIP_ID } from "@/lib/trip";

export default function Home() {
  redirect(`/trip/${TRIP_ID}`);
}
