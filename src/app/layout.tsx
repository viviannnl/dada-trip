import type { Metadata } from "next";
import { Anton, Archivo, Bodoni_Moda, Space_Mono, Special_Elite } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: ["normal", "italic"],
});
const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400" });
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});
const spaceMono = Space_Mono({
  variable: "--font-spacemono",
  subsets: ["latin"],
  weight: ["400", "700"],
});
const elite = Special_Elite({ variable: "--font-elite", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Europe, Unfolded.",
  description: "A travel planner that feels like an experimental art magazine.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // the intro gate script sets data-intro-seen before hydration
      suppressHydrationWarning
      className={`${bodoni.variable} ${anton.variable} ${archivo.variable} ${spaceMono.variable} ${elite.variable}`}
    >
      <body className="min-h-dvh">
        {/* shared print filters */}
        <svg width="0" height="0" aria-hidden className="absolute">
          <filter id="ink-rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="3" />
          </filter>
        </svg>
        {children}
      </body>
    </html>
  );
}
