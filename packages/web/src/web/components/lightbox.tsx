import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Shot } from "../config/content";

/**
 * Full-size viewer for proof-of-work screenshots.
 *
 * Rendered in a portal so it escapes the section's stacking context, and above
 * the grain/vignette overlays (z-index 60 and 55) which are `position: fixed`
 * and would otherwise sit on top of it.
 */
export function Lightbox({
  shots,
  index,
  onClose,
  onIndex,
}: {
  shots: Shot[];
  index: number | null;
  onClose: () => void;
  onIndex: (next: number) => void;
}) {
  const open = index !== null;
  const count = shots.length;

  const step = useCallback(
    (delta: number) => {
      if (index === null || count === 0) return;
      onIndex((index + delta + count) % count);
    },
    [index, count, onIndex],
  );

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, step]);

  if (!open || index === null) return null;
  const shot = shots[index];
  if (!shot) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={shot.caption ?? "Screenshot"}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(3, 3, 3, 0.94)" }}
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center border transition-colors sm:top-6 sm:right-6"
        style={{ borderColor: "var(--edge-hi)", color: "var(--silver)" }}
      >
        <X size={16} />
      </button>

      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute left-2 flex h-10 w-10 items-center justify-center border transition-colors sm:left-6"
            style={{ borderColor: "var(--edge-hi)", color: "var(--silver)" }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-2 flex h-10 w-10 items-center justify-center border transition-colors sm:right-6"
            style={{ borderColor: "var(--edge-hi)", color: "var(--silver)" }}
          >
            <ChevronRight size={16} />
          </button>
        </>
      ) : null}

      <img
        src={shot.src}
        alt={shot.caption ?? ""}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[78vh] max-w-full border object-contain"
        style={{ borderColor: "var(--edge)" }}
      />

      <div className="mt-4 flex max-w-[70ch] items-center gap-4 px-2">
        {shot.caption ? (
          <p className="text-sm" style={{ color: "var(--silver)" }}>
            {shot.caption}
          </p>
        ) : null}
        {count > 1 ? (
          <span className="slug ml-auto shrink-0">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
