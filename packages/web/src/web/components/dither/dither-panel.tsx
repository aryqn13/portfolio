import { DitherShader } from "./dither-shader";

/**
 * The dither field for a page opening.
 *
 * Round 15 bounded this to a rounded rectangle behind the title, edge-masked
 * so the rectangle had no visible boundary. It still read as a plate sitting
 * behind the text — a shape is a shape even with soft edges, and "the card
 * feels off" was the reaction. This version has no rectangle to feel like at
 * all: it breaks out of the content column to the full width of the
 * viewport, and the only thing that fades is a soft top and bottom edge back
 * into the page's own ink. There is nothing shaped for a card reading to
 * attach to.
 *
 * It is also no longer a static texture. `scrollReactive` feeds the panel's
 * position in the viewport into the shader, so the weave visibly travels as
 * you scroll past it — the field's own answer to "I want to use it somehow"
 * for something that used to just sit there once painted.
 *
 * And it is now the site's colour vehicle: duotone from --ink to --mark, so
 * scrolling into a page opening is where the accent shows up hardest.
 */
export function DitherPanel({
  className,
  dot = 1,
  levels = 6,
  lift = 0.4,
  interactive = true,
}: {
  /** Placement. The component is already `absolute`, so this is insets on
      the vertical axis only — horizontally it always bleeds full width. */
  className?: string;
  dot?: number;
  levels?: number;
  lift?: number;
  interactive?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 w-screen -translate-x-1/2 overflow-hidden ${className ?? ""}`}
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0%, #000 12%, #000 78%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, #000 12%, #000 78%, transparent 100%)",
      }}
    >
      {/*
        dprCap 1 deliberately: one dither cell per CSS pixel keeps the weave
        the same physical size on every display instead of halving on a
        retina screen, and six quantised levels of near black gain nothing
        from a second sample per pixel.
      */}
      <DitherShader
        mode="bayer4"
        dot={dot}
        levels={levels}
        lift={lift}
        scrollReactive
        dprCap={1}
        fps={30}
        interactive={interactive}
        className="h-full w-full"
      />
    </div>
  );
}
