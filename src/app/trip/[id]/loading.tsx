import { DadaLoader } from "@/components/dada-loader";

export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <DadaLoader label="Printing" />
    </div>
  );
}
