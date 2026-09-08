import { useEffect, useRef, useState } from "react";
import {
  BAYER_4,
  BAYER_8,
  BLUE_NOISE_SIZE,
  loadBlueNoise,
  luma,
  type DitherMode,
} from "./matrices";

export type ImageDitherMode = DitherMode | "floyd";

export const IMAGE_MODES: { id: ImageDitherMode; label: string; note: string }[] = [
  { id: "bayer4", label: "Bayer 4x4", note: "Structured, graphic, obvious lattice" },
  { id: "bayer8", label: "Bayer 8x8", note: "Finer, closer to newsprint" },
  { id: "blue", label: "Blue noise", note: "Grainy but even, no pattern" },
  { id: "floyd", label: "Floyd-Steinberg", note: "Error diffusion, most photographic" },
];

/**
 * CPU dither of an image onto a canvas.
 *
 * Ordered modes are a per pixel threshold compare, which is trivially
 * parallel. Floyd-Steinberg is sequential: each pixel pushes its quantisation
 * error onto neighbours that have not been visited yet, so it cannot be done in
 * a fragment shader without multiple passes. It is also the only mode that
 * preserves fine detail in a face, which is why it is worth the CPU pass.
 *
 * Everything runs once on load, not per frame. `pixel` is how many device
 * pixels collapse into one dither cell, so pixel=2 halves the working
 * resolution and doubles the apparent dot size.
 *
 * PERFORMANCE, and this is the whole ballgame: the working resolution comes
 * from the canvas's LAID OUT SIZE, never from `src.naturalWidth`. This used to
 * size off the source, which meant a 4160x3110 photograph allocated a 12.9
 * million pixel canvas and ran a sequential JS dither over all of it, to fill a
 * 332px box. That is ~30x the necessary work on the main thread, all of it
 * thrown away by the downscale, and it is what made the site feel laggy. A
 * dither cell smaller than a device pixel is invisible by definition, so there
 * is never a reason to work above the displayed size.
 */

/** Hard ceiling on the working buffer's longest side, in pixels. */
const MAX_DIM = 1400;

function targetSize(
  src: HTMLImageElement,
  cv: HTMLCanvasElement,
  pixel: number,
) {
  const r = cv.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const ar = src.naturalWidth / Math.max(1, src.naturalHeight);

  let w: number;
  let h: number;
  if (r.width >= 2 && r.height >= 2) {
    w = (r.width * dpr) / pixel;
    h = (r.height * dpr) / pixel;
  } else {
    // Not laid out yet. Fall back to a sane box on the source's aspect rather
    // than to the source's own resolution.
    h = 640 / pixel;
    w = h * ar;
  }

  // Never work above the source, upscaling invents no detail.
  const srcW = src.naturalWidth / pixel;
  const srcH = src.naturalHeight / pixel;
  if (srcW >= 1 && srcH >= 1 && w > srcW) {
    w = srcW;
    h = srcH;
  }

  const m = Math.max(w, h);
  if (m > MAX_DIM) {
    const s = MAX_DIM / m;
    w *= s;
    h *= s;
  }
  return { w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)) };
}

function render(
  src: HTMLImageElement,
  cv: HTMLCanvasElement,
  mode: ImageDitherMode,
  levels: number,
  pixel: number,
  blue: Float32Array | null,
  contrast: number,
) {
  const { w, h } = targetSize(src, cv, pixel);
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(src, 0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;

  // Luminance in [0,1], with a contrast curve around mid grey. Dithering a flat
  // image gives flat mush, so a little S-curve first is doing real work.
  const g = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    let v = luma(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]) / 255;
    v = Math.min(1, Math.max(0, (v - 0.5) * contrast + 0.5));
    g[i] = v;
  }

  const steps = Math.max(1, levels - 1);
  const quant = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * steps) / steps;

  if (mode === "floyd") {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const old = g[i];
        const nv = quant(old);
        g[i] = nv;
        const err = old - nv;
        // 7/16, 3/16, 5/16, 1/16 forward only.
        if (x + 1 < w) g[i + 1] += (err * 7) / 16;
        if (y + 1 < h) {
          if (x > 0) g[i + w - 1] += (err * 3) / 16;
          g[i + w] += (err * 5) / 16;
          if (x + 1 < w) g[i + w + 1] += err / 16;
        }
      }
    }
  } else {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        let t: number;
        if (mode === "bayer4") t = (BAYER_4[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
        else if (mode === "bayer8") t = (BAYER_8[(y % 8) * 8 + (x % 8)] + 0.5) / 64;
        else if (blue)
          t = blue[(y % BLUE_NOISE_SIZE) * BLUE_NOISE_SIZE + (x % BLUE_NOISE_SIZE)];
        else t = 0.5;
        g[i] = Math.floor(g[i] * steps + t) / steps;
      }
    }
  }

  for (let i = 0; i < w * h; i++) {
    const v = Math.round(Math.min(1, Math.max(0, g[i])) * 255);
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v;
    d[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

/**
 * Just the dithered canvas, no image underneath, for laying over an existing
 * <img> that already owns its own sizing, measurement and hover filter.
 *
 * This is how the portrait gets its texture. At `opacity` around 0.12 with 6
 * levels and pixel 1 it is not a dither effect any more, it is a faint tooth on
 * the surface. Full-strength dithering wrecks a face, which is exactly why the
 * portrait uses this and not DitherImage.
 */
export function DitherOverlay({
  src,
  mode = "blue",
  levels = 6,
  pixel = 1,
  contrast = 1.1,
  opacity = 0.12,
  className,
}: {
  src: string;
  mode?: ImageDitherMode;
  levels?: number;
  pixel?: number;
  contrast?: number;
  opacity?: number;
  className?: string;
}) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let dead = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      void (async () => {
        const blue = mode === "blue" ? await loadBlueNoise().catch(() => null) : null;
        if (dead || !cv.current) return;
        render(img, cv.current, mode, levels, pixel, blue, contrast);
        setReady(true);
      })();
    };
    img.src = src;
    return () => {
      dead = true;
    };
  }, [src, mode, levels, pixel, contrast]);

  return (
    <canvas
      ref={cv}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${className ?? ""}`}
      style={{ opacity: ready ? opacity : 0, mixBlendMode: "overlay" }}
    />
  );
}

export function DitherImage({
  src,
  alt,
  mode,
  levels = 2,
  pixel = 2,
  contrast = 1.25,
  className,
  /** Cross-fade to the plain greyscale original while hovered. */
  revealOnHover = true,
}: {
  src: string;
  alt: string;
  mode: ImageDitherMode;
  levels?: number;
  pixel?: number;
  contrast?: number;
  className?: string;
  revealOnHover?: boolean;
}) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    let dead = false;
    const img = new Image();
    img.crossOrigin = "anonymous";

    const go = async () => {
      const blue = mode === "blue" ? await loadBlueNoise().catch(() => null) : null;
      if (dead || !cv.current) return;
      render(img, cv.current, mode, levels, pixel, blue, contrast);
      setReady(true);
    };

    img.onload = () => void go();
    img.src = src;
    return () => {
      dead = true;
    };
  }, [src, mode, levels, pixel, contrast]);

  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      {/* The plain original underneath, revealed by fading the dither out. It
          is in full colour now: the dither above it is the stylised state, and
          what you get when you look closely should be the photograph itself. */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas
        ref={cv}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
        style={{
          opacity: ready && !(revealOnHover && hover) ? 1 : 0,
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
