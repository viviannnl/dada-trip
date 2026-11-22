import { Checklist } from "@/components/checklist";
import { Ransom } from "@/components/print";
import { PageTransition } from "@/components/transitions";

export default function ChecklistPage() {
  return (
    <PageTransition>
      <section className="relative mx-auto max-w-[1400px] overflow-hidden px-4 pt-8 pb-20 md:px-8">
        <div aria-hidden className="absolute top-6 right-[-4rem] aspect-square w-72 rounded-full bg-blue md:right-10" />
        <div aria-hidden className="halftone absolute top-40 right-40 hidden h-28 w-44 rotate-6 opacity-50 md:block" />

        <p className="relative font-mono text-[11px] tracking-[0.2em] uppercase">Section 03 · Before the gate</p>
        <h1 className="relative mt-3 mb-10" aria-label="Before you go">
          <span aria-hidden className="block font-poster text-[clamp(3.5rem,10vw,8rem)] leading-[0.85] uppercase">
            Before
          </span>
          <span aria-hidden className="ml-[6vw] block text-[clamp(3rem,8vw,6.5rem)]">
            <Ransom text="YOU GO!" seed={5} />
          </span>
        </h1>

        <div className="relative">
          <Checklist />
        </div>
      </section>
    </PageTransition>
  );
}
