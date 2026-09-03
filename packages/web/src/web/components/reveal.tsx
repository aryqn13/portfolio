import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 0.61, 0.36, 1] as const;

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

/** One-shot scroll reveal. Instant when the user prefers reduced motion. */
export function Reveal({ children, delay = 0, y = 26, className }: RevealProps) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Staggered entrance used by the hero on page load. */
export function Enter({ children, delay = 0, y = 18, className }: RevealProps) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
