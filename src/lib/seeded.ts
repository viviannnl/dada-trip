/** Deterministic PRNG (mulberry32) so server and client render the same "chaos". */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const range = (r: () => number, min: number, max: number) => min + r() * (max - min);
export const pick = <T,>(r: () => number, arr: readonly T[]) => arr[Math.floor(r() * arr.length)];

/** Torn-paper clip-path: jagged top & bottom edges, straight sides. */
export function tornClip(seed: number, depth = 5, steps = 18) {
  const r = rng(seed);
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    top.push(`${x.toFixed(1)}% ${range(r, 0, depth).toFixed(1)}px`);
    bottom.push(`${(100 - x).toFixed(1)}% calc(100% - ${range(r, 0, depth).toFixed(1)}px)`);
  }
  return `polygon(${[...top, ...bottom].join(",")})`;
}
