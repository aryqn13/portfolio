import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useLocation } from "wouter";
import { DitherShader } from "./dither-shader";

/**
 * The site's own material used as the thing that actually performs page
 * navigation, instead of sitting still behind an opening.
 *
 * A bar of the same dither field the openings use sweeps left to right across
 * the whole viewport. The route change happens the instant the sweep has
 * fully covered the screen, invisibly, then the same bar keeps travelling and
 * uncovers the new page. One continuous motion does the hiding and the
 * revealing, so this is a single gesture, not a fade plus a swap.
 *
 * Deliberately a click interceptor rather than a wouter <Route> transition:
 * every internal link on the site already renders as a plain <a href="/...">
 * (wouter's own `Link`), so one delegated listener on `document` catches all
 * of them, including future ones, without touching `nav.tsx`, `page-shell.tsx`
 * or the preview links individually.
 */

const COVER_S = 0.36;
const HOLD_MS = 70;
const REVEAL_S = 0.56;
const EASE = [0.76, 0, 0.24, 1] as const;

type Phase = "idle" | "covering" | "revealing";

export function DitherTransition() {
  const [location, navigate] = useLocation();
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const pending = useRef<string | null>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    // Capture phase, and deliberately not checking `e.defaultPrevented`:
    // wouter's own `Link` already calls `preventDefault` and navigates from
    // its bubble-phase `onClick`, so a bubble-phase listener here would
    // always see a click that has already both been prevented and already
    // done the instant navigation it exists to replace. Capture runs
    // top-down before any bubble handler, including React's, so this is the
    // only place that can actually get to the click first.
    const onClick = (e: MouseEvent) => {
      if (reducedRef.current) return;
      if (phaseRef.current !== "idle") return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;

      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      if (href === location) return;
      // The owner tool is a working editor, not part of the sequence the
      // wipe is meant to sell. Leave it on plain instant navigation.
      if (href.startsWith("/studio") || location.startsWith("/studio")) return;

      e.preventDefault();
      e.stopPropagation();
      pending.current = href;
      setPhase("covering");
    };
    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, [location]);

  const handleCoverDone = useCallback(() => {
    if (phaseRef.current !== "covering") return;
    if (pending.current) {
      navigate(pending.current);
      pending.current = null;
    }
    window.setTimeout(() => setPhase("revealing"), HOLD_MS);
  }, [navigate]);

  const handleRevealDone = useCallback(() => {
    if (phaseRef.current !== "revealing") return;
    setPhase("idle");
  }, []);

  if (phase === "idle") return null;

  return (
    <motion.div
      key="dither-wipe"
      className="pointer-events-none fixed inset-0 z-[300] overflow-hidden"
      aria-hidden="true"
      initial={{ x: "-100%" }}
      animate={{ x: phase === "covering" ? "0%" : "100%" }}
      transition={{
        duration: phase === "covering" ? COVER_S : REVEAL_S,
        ease: EASE,
      }}
      onAnimationComplete={() =>
        phase === "covering" ? handleCoverDone() : handleRevealDone()
      }
    >
      <DitherShader
        mode="bayer4"
        dot={3}
        levels={4}
        lift={1}
        interactive={false}
        scrollReactive={false}
        dprCap={1}
        fps={45}
        className="h-full w-full"
      />
    </motion.div>
  );
}
