import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Every route starts at the top. Without this, wouter keeps the window scroll
 * offset across navigations, so clicking the "Next" link at the bottom of one
 * page drops you into the bottom of the next one.
 *
 * `scrollRestoration = "manual"` stops the browser doing the same thing on
 * reload and on back/forward.
 */
export function ScrollTop() {
  const [location] = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    // Jump, never smooth. A smooth scroll on navigation reads as a glitch.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);

  return null;
}
