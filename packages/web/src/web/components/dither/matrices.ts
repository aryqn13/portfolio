/**
 * Dither threshold sources.
 *
 * Three flavours, all normalised to [0, 1):
 *  - bayer4: crisp, structured, an obvious crosshatch. The classic "designed" dither.
 *  - bayer8: the same idea at finer pitch, reads closer to a halftone.
 *  - blue:   void-and-cluster blue noise, organic and cloudy, no visible lattice.
 *
 * The blue noise lives as a 64x64 greyscale PNG in public/textures. It is a real
 * void-and-cluster pattern, not a hash: low frequency energy is suppressed about
 * 100x against high, which is the whole point. A hash-based fake would just look
 * like the grain layer the site already has.
 */

export const BLUE_NOISE_URL = "/textures/blue-noise-64.png";
export const BLUE_NOISE_SIZE = 64;

export type DitherMode = "bayer4" | "bayer8" | "blue";

export const DITHER_MODES: { id: DitherMode; label: string; note: string }[] = [
  { id: "bayer4", label: "Bayer 4x4", note: "Crisp, structured, visible crosshatch" },
  { id: "bayer8", label: "Bayer 8x8", note: "Finer pitch, closer to a halftone" },
  { id: "blue", label: "Blue noise", note: "Organic, cloudy, no lattice" },
];

// prettier-ignore
export const BAYER_4 = [
   0,  8,  2, 10,
  12,  4, 14,  6,
   3, 11,  1,  9,
  15,  7, 13,  5,
];

// prettier-ignore
export const BAYER_8 = [
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
];

/** Rec. 709 luminance. Matches how the eye weighs the channels. */
export function luma(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

let bluePromise: Promise<Float32Array> | null = null;

/**
 * Blue noise thresholds as a flat 64x64 Float32Array in [0, 1), for the CPU
 * side image ditherer. Cached, so every tile in the lab shares one decode.
 */
export function loadBlueNoise(): Promise<Float32Array> {
  if (bluePromise) return bluePromise;
  bluePromise = new Promise<Float32Array>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const n = BLUE_NOISE_SIZE;
      const c = document.createElement("canvas");
      c.width = n;
      c.height = n;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        reject(new Error("no 2d context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, n, n);
      const out = new Float32Array(n * n);
      for (let i = 0; i < n * n; i++) out[i] = data[i * 4] / 256;
      resolve(out);
    };
    img.onerror = () => reject(new Error("blue noise failed to load"));
    img.src = BLUE_NOISE_URL;
  });
  return bluePromise;
}
