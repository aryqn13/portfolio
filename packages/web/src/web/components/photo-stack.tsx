import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import type { PanInfo } from "motion/react";
import type { Photo } from "../config/content";

/**
 * A deck of prints. The top one is loose in the hand: it follows the cursor
 * one to one, tilts with the direction it is pushed, and when it is let go far
 * enough from centre it keeps its momentum and slides underneath the pile
 * instead of flying off the screen. Let go short of that and it settles back.
 *
 * Two layers per card, on purpose:
 *   - the outer layer owns the card's place in the deck (depth, tilt, scale)
 *     and springs whenever the order changes,
 *   - the inner layer owns the drag, and snaps back to its own origin.
 * Composing them is what makes a released card travel diagonally down into the
 * back of the stack rather than teleporting.
 *
 * Imagery rule, same as everywhere: grey at rest, colour on hover.
 */

/** Distance from centre, in px, past which the card is considered let go. */
const LOOSE = 64;
/** A flick counts even when it is short. */
const FLICK = 380;

const SLOTS = [
  { y: 0, scale: 1, rotate: 0, opacity: 1 },
  { y: 12, scale: 0.955, rotate: 2.4, opacity: 1 },
  { y: 23, scale: 0.915, rotate: -3.1, opacity: 1 },
  { y: 31, scale: 0.885, rotate: 1.4, opacity: 0 },
];

const SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } as const;

interface Props {
  photos: Photo[];
  name?: string;
}

export function PhotoStack({ photos, name = "Portrait" }: Props) {
  const reduced = useReducedMotion();
  // order[0] is the print on top. Sending one back rotates this array.
  const [order, setOrder] = useState(() => photos.map((_, i) => i));
  const [hover, setHover] = useState(false);
  // The card takes the shape of the photograph on top of it, so a picture is
  // never letterboxed inside a frame that is the wrong shape for it, and never
  // cropped to fit one either. Measured from the file as it loads.
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const measure = (src: string, w: number, h: number) => {
    if (!w || !h) return;
    setRatios((r) => (r[src] ? r : { ...r, [src]: w / h }));
  };

  if (photos.length === 0) return null;

  // Photos can be added or removed from the studio while the page is open.
  const live =
    order.length === photos.length && order.every((i) => i < photos.length)
      ? order
      : photos.map((_, i) => i);

  const many = photos.length > 1;

  // Clamped: a panorama or an extreme vertical would otherwise wreck the hero
  // grid. 4:5 until the file has loaded, which is the commonest portrait shape.
  const frontSrc = photos[live[0]]?.src ?? "";
  const measured = ratios[frontSrc];
  const frameRatio = measured
    ? Math.min(Math.max(measured, 0.62), 1.35)
    : 4 / 5;

  // Rotates the live order, not the stored one: photos arrive from the studio
  // after the first render, so the stored order can still be a stale length.
  const sendBack = () => {
    if (!many) return;
    const [first, ...rest] = live;
    setOrder([...rest, first]);
  };

  return (
    <div
      className="mx-auto w-full max-w-[15.5rem] md:mx-0 md:max-w-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="relative w-full select-none transition-[aspect-ratio] duration-500"
        style={{ aspectRatio: frameRatio }}
      >
        {live.map((photoIndex, depth) => (
          <Card
            key={photoIndex}
            photo={photos[photoIndex]}
            depth={depth}
            total={photos.length}
            draggable={depth === 0 && many && !reduced}
            hover={hover}
            reduced={!!reduced}
            name={name}
            position={depth + 1}
            onSend={sendBack}
            onMeasure={measure}
          />
        ))}
      </div>
    </div>
  );
}

function Card({
  photo,
  depth,
  total,
  draggable,
  hover,
  reduced,
  name,
  position,
  onSend,
  onMeasure,
}: {
  photo: Photo;
  depth: number;
  total: number;
  draggable: boolean;
  hover: boolean;
  reduced: boolean;
  name: string;
  position: number;
  onSend: () => void;
  onMeasure: (src: string, w: number, h: number) => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // The card leans the way it is pushed, like a print pinched at one corner.
  const lean = useTransform(x, [-260, 0, 260], [-11, 0, 11]);
  const dragged = useRef(false);

  const slot = SLOTS[Math.min(depth, SLOTS.length - 1)];
  const isTop = depth === 0;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const far = Math.hypot(info.offset.x, info.offset.y) > LOOSE;
    const flicked = Math.hypot(info.velocity.x, info.velocity.y) > FLICK;
    if (far || flicked) {
      dragged.current = true;
      onSend();
    }
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: total - depth }}
      animate={{
        y: slot.y,
        scale: slot.scale,
        rotate: slot.rotate,
        opacity: slot.opacity,
      }}
      transition={reduced ? { duration: 0.2 } : SPRING}
    >
      <motion.div
        className="h-full w-full"
        style={{ x, y, rotate: lean, cursor: draggable ? "grab" : "default" }}
        drag={draggable}
        dragSnapToOrigin
        dragElastic={1}
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 220, bounceDamping: 26 }}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={onDragEnd}
        whileDrag={{ cursor: "grabbing", scale: 1.015 }}
      >
        <button
          type="button"
          tabIndex={isTop ? 0 : -1}
          aria-hidden={!isTop}
          aria-label={
            total > 1
              ? `${name}, photo ${position} of ${total}. Click to send it to the back.`
              : name
          }
          onClick={() => {
            if (dragged.current) {
              dragged.current = false;
              return;
            }
            if (total > 1) onSend();
          }}
          className="relative block h-full w-full overflow-hidden rounded-[20px] border text-left"
          style={{
            borderColor: hover && isTop ? "var(--edge-hi)" : "var(--edge)",
            background: "var(--ink-2)",
            boxShadow: isTop
              ? "0 26px 60px -34px rgba(0,0,0,0.95)"
              : "0 14px 30px -26px rgba(0,0,0,0.9)",
          }}
        >
          <img
            src={photo.src}
            alt={photo.alt ?? name}
            draggable={false}
            onLoad={(e) =>
              onMeasure(
                photo.src,
                e.currentTarget.naturalWidth,
                e.currentTarget.naturalHeight,
              )
            }
            className="pointer-events-none h-full w-full object-cover transition-[filter] duration-700"
            style={{
              // The card is already cut to this photograph's proportions, so
              // filling it crops nothing and leaves no empty bands.
              objectPosition: "center",
              filter:
                hover && isTop
                  ? "grayscale(0) contrast(1.02) saturate(1.05)"
                  : "grayscale(1) contrast(1.08) brightness(0.94)",
            }}
          />
        </button>
      </motion.div>
    </motion.div>
  );
}
