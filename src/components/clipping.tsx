"use client";

import Image from "next/image";
import { useState } from "react";
import type { Art } from "@/lib/images";
import { tornClip } from "@/lib/seeded";

/**
 * A newspaper photo clipping: torn edges, black-and-white with a halftone screen.
 * Hover (or focus within the parent .group) "develops" it into the original colour.
 */
export function PhotoClipping({
  art,
  seed,
  className = "",
  sizes = "(min-width: 768px) 30vw, 90vw",
  priority = false,
}: {
  art: Art & { key: string };
  seed: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <figure className={`clipping relative ${className}`} style={{ clipPath: tornClip(seed, 7) }}>
      {!loaded && <span aria-hidden className="halftone-shimmer absolute inset-0" />}
      <Image
        src={`/images/cities/${art.key}-bw.webp`}
        alt={art.alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={`clipping-bw object-cover ${loaded ? "is-developed" : ""}`}
      />
      <Image
        src={`/images/cities/${art.key}-color.webp`}
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        className="clipping-color object-cover"
      />
      <span aria-hidden className="clipping-screen absolute inset-0" />
    </figure>
  );
}

/** A fashion-plate figure cut out with scissors; colours in on hover of the parent .group. */
export function FigureCutout({ art, className = "" }: { art: Art & { key: string }; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className={`cutout relative block ${className}`}>
      {!loaded && (
        <span aria-hidden className="halftone-shimmer absolute inset-x-4 inset-y-2 rounded-full opacity-60" />
      )}
      <Image
        src={`/images/outfits/${art.key}-bw.webp`}
        alt={art.alt}
        fill
        sizes="200px"
        onLoad={() => setLoaded(true)}
        className={`cutout-bw object-contain ${loaded ? "is-developed" : ""}`}
      />
      <Image
        src={`/images/outfits/${art.key}-color.webp`}
        alt=""
        aria-hidden
        fill
        sizes="200px"
        className="cutout-color object-contain"
      />
    </span>
  );
}
