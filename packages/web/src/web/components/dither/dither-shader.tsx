import { useEffect, useRef } from "react";
// The Bayer matrices are declared inline in the GLSL below rather than imported,
// because they have to be const arrays inside the shader source.
import { BLUE_NOISE_SIZE, BLUE_NOISE_URL, type DitherMode } from "./matrices";

/**
 * A dithered gradient field on a WebGL2 canvas.
 *
 * The signal is a slow drifting blob field plus a vertical falloff, with a soft
 * attractor under the pointer. That continuous signal is then quantised to a
 * handful of levels through a dither threshold, which is what produces the dots.
 *
 * The threshold is sampled in DEVICE PIXELS, divided by `dot`, never in UV. If
 * you sample in UV the pattern scales with the element and stops reading as a
 * dither at all, it just becomes a smear. `dot` is the size of one dither cell
 * in device pixels, so dot=2 gives chunky visible dots and dot=1 is nearly a
 * smooth gradient at 2x DPR.
 */

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  uRes;      // drawing buffer size, device px
uniform float uTime;     // seconds
uniform vec2  uMouse;    // device px, smoothed
uniform float uMouseAmt; // 0 when the pointer has never been over the canvas
uniform float uDot;      // dither cell size, device px
uniform float uLevels;   // quantisation steps
uniform int   uMode;     // 0 bayer4, 1 bayer8, 2 blue
uniform float uLift;     // brightest tone, keeps this a background
uniform float uScroll;   // 0..1, how far the panel has travelled through the
                          // viewport. Drives the field, not just time, so it
                          // reads as something you are moving past rather
                          // than wallpaper looping underneath you.
uniform vec3  uInk;      // duotone shadow colour
uniform vec3  uAccent;   // duotone highlight colour
uniform sampler2D uNoise;

const float B4[16] = float[16](
   0.0,  8.0,  2.0, 10.0,
  12.0,  4.0, 14.0,  6.0,
   3.0, 11.0,  1.0,  9.0,
  15.0,  7.0, 13.0,  5.0
);

const float B8[64] = float[64](
   0.0, 32.0,  8.0, 40.0,  2.0, 34.0, 10.0, 42.0,
  48.0, 16.0, 56.0, 24.0, 50.0, 18.0, 58.0, 26.0,
  12.0, 44.0,  4.0, 36.0, 14.0, 46.0,  6.0, 38.0,
  60.0, 28.0, 52.0, 20.0, 62.0, 30.0, 54.0, 22.0,
   3.0, 35.0, 11.0, 43.0,  1.0, 33.0,  9.0, 41.0,
  51.0, 19.0, 59.0, 27.0, 49.0, 17.0, 57.0, 25.0,
  15.0, 47.0,  7.0, 39.0, 13.0, 45.0,  5.0, 37.0,
  63.0, 31.0, 55.0, 23.0, 61.0, 29.0, 53.0, 21.0
);

// Cheap value noise. Enough for a soft field, and it keeps this dependency free.
//
// This hash is deliberately NOT the usual fract(sin(dot(p, k)) * big). Every
// value noise lookup takes four of these and the field takes two fbm calls of
// three octaves, so that is ~24 hashes per fragment, and at full screen it was
// ~24 transcendental calls on several million fragments every frame. This is
// the same idea with multiplies only, and it also dodges the precision
// breakdown sin-hashes get at large coordinates on mobile GPUs.
float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
// Three octaves, not four. The fourth octave lands below one dither cell at
// these settings, so it was being quantised away before it reached a pixel.
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * vnoise(p); p *= 2.02; a *= 0.5; }
  return v * 1.14; // renormalise for the dropped octave
}

float threshold(vec2 px) {
  vec2 cell = floor(px / uDot);
  if (uMode == 0) {
    ivec2 c = ivec2(mod(cell, 4.0));
    return (B4[c.y * 4 + c.x] + 0.5) / 16.0;
  } else if (uMode == 1) {
    ivec2 c = ivec2(mod(cell, 8.0));
    return (B8[c.y * 8 + c.x] + 0.5) / 64.0;
  }
  return texture(uNoise, (cell + 0.5) / ${BLUE_NOISE_SIZE}.0).r;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / uRes;
  // Aspect corrected coordinates so the field does not stretch on wide screens.
  vec2 p = (px - 0.5 * uRes) / min(uRes.x, uRes.y);

  float t = uTime * 0.06;

  // Scroll moves the field along its own axis, on top of the ambient time
  // drift. That is what makes this a thing you scroll PAST rather than a
  // frozen texture the page happens to slide over.
  vec2 sp = p + vec2(0.0, uScroll * 0.85);

  // Two drifting fbm layers make the field breathe without a visible loop.
  float f = fbm(sp * 1.9 + vec2(t, -t * 0.7));
  f = mix(f, fbm(sp * 3.4 - vec2(t * 0.5, t * 0.35)), 0.4);

  // Pointer attractor: a soft dome that lifts the signal and warps it inward.
  //
  // The warp used to be a THIRD full fbm call, evaluated on every fragment and
  // then multiplied by a dome that is ~0 across almost the entire screen. So
  // the expensive part was paid everywhere and kept nowhere. Warping the
  // coordinates of the field we already sampled buys the same inward pull for
  // one extra noise lookup instead of twelve.
  vec2 m = (uMouse - 0.5 * uRes) / min(uRes.x, uRes.y);
  float md = length(p - m);
  float dome = exp(-md * md * 5.5) * uMouseAmt;
  f += dome * 0.42;
  f = mix(f, vnoise((p + (p - m) * dome * 0.55) * 2.6 + t), dome * 0.5);

  // Vertical falloff keeps the top of the element quieter than the bottom.
  // The band itself travels down with uScroll, so the field's bright edge
  // scrolls at a slightly different rate than the page, a soft parallax.
  float grad = smoothstep(1.05 - uScroll * 0.5, -0.15 - uScroll * 0.5, uv.y);
  float signal = clamp(f * 0.95 * grad + dome * 0.22, 0.0, 1.0);

  // Ordered dither, then quantise. The +0.5 offsets the threshold to centre it
  // on the step, otherwise the whole image biases dark.
  float steps = max(uLevels - 1.0, 1.0);
  float q = floor(signal * steps + threshold(px)) / steps;

  // Duotone: ink in the shadows, the site accent in the highlights. uLift
  // caps how far the mix travels so this stays a background the accent
  // flashes through rather than a wash of solid magenta.
  vec3 col = mix(uInk, uAccent, clamp(q, 0.0, 1.0) * uLift);
  fragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("dither shader:", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

/** #07060b, the site's --ink. Duplicated rather than read from CSS because
    GLSL needs a plain float triple, same rationale as the hardcoded rgba()
    values already sitting in nav.tsx. */
const DEFAULT_INK: [number, number, number] = [0.027, 0.024, 0.043];
/** #ff2e9a, the site's --mark. */
const DEFAULT_ACCENT: [number, number, number] = [1.0, 0.18, 0.604];

export function DitherShader({
  mode,
  dot = 2,
  levels = 4,
  lift = 0.24,
  ink = DEFAULT_INK,
  accent = DEFAULT_ACCENT,
  scrollReactive = false,
  className,
  interactive = true,
  dprCap,
  fps = 30,
}: {
  mode: DitherMode;
  dot?: number;
  levels?: number;
  /** How far the mix travels from ink toward accent, 0..1. Low keeps this a
      background the accent flashes through rather than a magenta wash. */
  lift?: number;
  /** Duotone shadow colour, [r,g,b] 0..1. Defaults to --ink. */
  ink?: [number, number, number];
  /** Duotone highlight colour, [r,g,b] 0..1. Defaults to --mark. */
  accent?: [number, number, number];
  /** Feed the panel's scroll position into the shader, so the field visibly
      travels as the page scrolls instead of sitting frozen underneath it.
      Off by default: small tiles (the photo overlay) have no "scroll
      position" worth reacting to. */
  scrollReactive?: boolean;
  className?: string;
  interactive?: boolean;
  /**
   * Device pixel ratio ceiling. Cost is quadratic in this, and a quantised
   * field of a few near-black levels gains nothing from a second sample per
   * CSS pixel, so a full screen instance should pass 1. Defaults to 1.5 on a
   * coarse pointer and 2 otherwise, which suits small tiles.
   */
  dprCap?: number;
  /**
   * Redraw ceiling. The field drifts at 0.06x real time, so 30 is
   * indistinguishable from 60 and halves the GPU bill. The pointer follow is
   * time corrected, so lowering this does not slow the dome down.
   */
  fps?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  // Live values in a ref so changing a control never rebuilds the GL context.
  const params = useRef({
    mode,
    dot,
    levels,
    lift,
    ink,
    accent,
    scrollReactive,
    interactive,
    dprCap,
    fps,
  });
  params.current = {
    mode,
    dot,
    levels,
    lift,
    ink,
    accent,
    scrollReactive,
    interactive,
    dprCap,
    fps,
  };

  useEffect(() => {
    const cv = canvas.current;
    const el = host.current;
    if (!cv || !el) return;

    const gl = cv.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      el.dataset.fallback = "true";
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      el.dataset.fallback = "true";
      return;
    }
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("dither link:", gl.getProgramInfoLog(prog));
      el.dataset.fallback = "true";
      return;
    }
    gl.useProgram(prog);

    // Fullscreen triangle pair.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(prog, "uRes"),
      time: gl.getUniformLocation(prog, "uTime"),
      mouse: gl.getUniformLocation(prog, "uMouse"),
      mouseAmt: gl.getUniformLocation(prog, "uMouseAmt"),
      dot: gl.getUniformLocation(prog, "uDot"),
      levels: gl.getUniformLocation(prog, "uLevels"),
      mode: gl.getUniformLocation(prog, "uMode"),
      lift: gl.getUniformLocation(prog, "uLift"),
      scroll: gl.getUniformLocation(prog, "uScroll"),
      ink: gl.getUniformLocation(prog, "uInk"),
      accent: gl.getUniformLocation(prog, "uAccent"),
      noise: gl.getUniformLocation(prog, "uNoise"),
    };

    // Blue noise texture. NEAREST and REPEAT, because interpolating a blue noise
    // texture destroys exactly the spectrum that makes it blue noise.
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.R8, 1, 1, 0, gl.RED, gl.UNSIGNED_BYTE,
      new Uint8Array([128]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.uniform1i(u.noise, 0);

    let disposed = false;
    const noiseImg = new Image();
    noiseImg.onload = () => {
      if (disposed) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, BLUE_NOISE_SIZE, BLUE_NOISE_SIZE, 0,
        gl.RED, gl.UNSIGNED_BYTE, noiseImg as unknown as TexImageSource);
    };
    noiseImg.src = BLUE_NOISE_URL;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    // DPR is quadratic in cost, so this is the single biggest lever there is.
    // Phones get 1.5x at most, desktop 2, and a caller that fills the viewport
    // should override with 1.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dprCap = params.current.dprCap ?? (coarse ? 1.5 : 2);

    let w = 0;
    let h = 0;
    const resize = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const nw = Math.max(1, Math.round(r.width * dpr));
      const nh = Math.max(1, Math.round(r.height * dpr));
      if (nw === w && nh === h) return;
      w = nw;
      h = nh;
      cv.width = w;
      cv.height = h;
      gl.viewport(0, 0, w, h);
      // Park the pointer in the centre until it is actually moved.
      if (mouse.x === 0 && mouse.y === 0) {
        mouse.x = target.x = w / 2;
        mouse.y = target.y = h / 2;
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let amt = 0;
    let amtTarget = 0;

    const onMove = (e: PointerEvent) => {
      if (!params.current.interactive) return;
      const r = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      target.x = (e.clientX - r.left) * dpr;
      // GL's Y origin is bottom left, the DOM's is top left.
      target.y = (r.height - (e.clientY - r.top)) * dpr;
      amtTarget = 1;
    };
    const onLeave = () => {
      amtTarget = 0;
    };
    // Listening on window rather than the element means the field keeps
    // responding while the pointer travels over the text on top of it.
    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);

    // Pause when off screen. Several of these on one page otherwise cook the GPU.
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "120px" },
    );
    io.observe(el);

    resize();

    const start = performance.now();
    let raf = 0;
    let lastDraw = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || disposed) return;

      // Redraw ceiling. Skipping a frame here costs nothing visually and halves
      // the fill rate, which on a full screen shader is the entire bill.
      const gap = now - lastDraw;
      const minGap = 1000 / Math.max(1, params.current.fps || 30);
      if (gap < minGap - 1) return;
      lastDraw = now;

      // Critically damped follow, so the dome trails the cursor instead of
      // snapping to it. This is most of the feel.
      //
      // Corrected for elapsed time rather than applied per frame, so the dome
      // travels at the same speed whatever the redraw ceiling is. A plain
      // per-frame lerp would make the cursor feel half as responsive at 30fps.
      const ease = (rate: number) =>
        1 - Math.pow(1 - rate, Math.min(gap, 100) / 16.67);
      const em = ease(0.075);
      const ea = ease(0.06);
      mouse.x += (target.x - mouse.x) * em;
      mouse.y += (target.y - mouse.y) * em;
      amt += (amtTarget - amt) * ea;

      const p = params.current;
      const t = reduced.matches ? 0 : (now - start) / 1000;

      // How far the panel has travelled through the viewport, 0 when its top
      // just entered the bottom of the screen, 1 once its top has passed the
      // top of the screen. Read straight off layout, so it costs one
      // getBoundingClientRect per drawn frame, not per scroll event.
      let scrollT = 0;
      if (p.scrollReactive && !reduced.matches) {
        const r = el.getBoundingClientRect();
        const span = r.height + window.innerHeight;
        scrollT = span > 0 ? 1 - (r.top + r.height) / span : 0;
        scrollT = Math.min(1, Math.max(0, scrollT));
      }

      gl.uniform2f(u.res, w, h);
      gl.uniform1f(u.time, t);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform1f(u.mouseAmt, reduced.matches ? 0 : amt);
      gl.uniform1f(u.dot, Math.max(1, p.dot));
      gl.uniform1f(u.levels, Math.max(2, p.levels));
      gl.uniform1i(u.mode, p.mode === "bayer4" ? 0 : p.mode === "bayer8" ? 1 : 2);
      gl.uniform1f(u.lift, p.lift);
      gl.uniform1f(u.scroll, scrollT);
      gl.uniform3f(u.ink, p.ink[0], p.ink[1], p.ink[2]);
      gl.uniform3f(u.accent, p.accent[0], p.accent[1], p.accent[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      // Deliberately NOT calling WEBGL_lose_context.loseContext() here. That
      // kills the context permanently and it is keyed to the canvas element,
      // which React reuses across a remount, so every later mount would get a
      // dead context back and silently render black. Dropping the GL objects is
      // enough; the context goes with the canvas when it is collected.
    };
  }, []);

  return (
    <div ref={host} className={className} aria-hidden="true">
      <canvas ref={canvas} className="block h-full w-full" />
    </div>
  );
}
