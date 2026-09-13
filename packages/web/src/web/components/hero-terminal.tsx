import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SquareTerminal } from "lucide-react";

/**
 * The hero's name and one-liner, staged as a themed terminal window instead
 * of a plain headline. Not the macOS three-dot chrome — a coloured focus
 * bar across the top and a host string in the titlebar is the tiling-window-
 * manager, ricing-your-terminal-config look this is going for, in the
 * site's own pink instead of a generic green-on-black.
 *
 * The two commands ("whoami", "cat mission.txt") are decorative flair typed
 * out character by character, `aria-hidden`. The actual content they
 * produce — the name and the one-liner — is real `h1`/`p` markup that is
 * always in the DOM; only its opacity is tied to the reveal state, so a
 * screen reader or a crawler gets the real heading regardless of whether
 * the type animation has "arrived" at it yet. `prefers-reduced-motion` skips
 * straight to the end state: both commands filled in, both outputs visible,
 * cursor present but not blinking.
 */

const CHAR_MS = 42;
const GAP_MS = 420;

interface Props {
  name: string;
  positioning: string[];
  className?: string;
}

function useTyped(text: string, start: boolean, done: () => void, reduced: boolean) {
  const [value, setValue] = useState(reduced ? text : "");
  const startedRef = useRef(false);

  useEffect(() => {
    console.log("[mount-debug]", text, "mounted");
    return () => console.log("[mount-debug]", text, "unmounted");
  }, [text]);

  useEffect(() => {
    console.log("[typed-debug] effect fired", { text, start, reduced, started: startedRef.current });
    if (reduced) {
      setValue(text);
      return;
    }
    if (!start || startedRef.current) return;
    startedRef.current = true;

    let alive = true;
    (async () => {
      for (let i = 1; i <= text.length; i += 1) {
        if (!alive) return;
        setValue(text.slice(0, i));
        console.log("[typed-debug] set", text.slice(0, i));
        await new Promise((r) => window.setTimeout(r, CHAR_MS));
      }
      if (alive) done();
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, reduced]);

  return value;
}

export function HeroTerminal({ name, positioning, className = "" }: Props) {
  const reduced = !!useReducedMotion();

  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(reduced ? 4 : 0);

  const cmd1 = useTyped("whoami", phase >= 0, () => setPhase(1), reduced);
  const cmd2 = useTyped(
    "cat mission.txt",
    phase >= 2,
    () => setPhase(3),
    reduced,
  );

  useEffect(() => {
    if (reduced) return;
    if (phase !== 1) return;
    const id = window.setTimeout(() => setPhase(2), GAP_MS);
    return () => window.clearTimeout(id);
  }, [phase, reduced]);

  useEffect(() => {
    if (reduced) return;
    if (phase !== 3) return;
    const id = window.setTimeout(() => setPhase(4), GAP_MS);
    return () => window.clearTimeout(id);
  }, [phase, reduced]);

  const outputVisible = (min: 1 | 3) => phase >= min;
  const cursorClass = reduced ? "" : "term-cursor";

  return (
    <div className={className}>
      <div
        className="overflow-hidden rounded-[16px] border"
        style={{
          borderColor: "rgba(255,46,154,0.32)",
          background: "var(--ink-2)",
          boxShadow:
            "0 34px 80px -32px rgba(0,0,0,0.92), 0 0 0 1px rgba(255,46,154,0.07), 0 0 70px -18px rgba(255,46,154,0.22)",
        }}
      >
        {/* Focus-border accent, not a traffic light: the coloured strip a
            tiling WM draws around the active window, here permanently on
            since this terminal is always the "focused" one. */}
        <div
          className="h-[3px] w-full"
          style={{
            background:
              "linear-gradient(to right, var(--mark), var(--mark-dim))",
          }}
        />

        <div
          className="flex items-center justify-between gap-3 border-b px-4 py-2.5"
          style={{
            borderColor: "var(--edge)",
            background: "rgba(255,46,154,0.045)",
          }}
        >
          <div className="flex items-center gap-2">
            <SquareTerminal size={13} style={{ color: "var(--mark)" }} />
            <span
              className="font-mono text-[0.66rem] tracking-wide"
              style={{ color: "var(--grey-hi)" }}
            >
              aryan@runable:~
            </span>
          </div>
          <span
            className="font-mono text-[0.6rem] tracking-wide"
            style={{ color: "var(--grey)" }}
          >
            zsh &mdash; 120&times;32
          </span>
        </div>

        <div className="relative px-5 py-7 sm:px-8 sm:py-9">
          {/* Scanline texture, very quiet: the one detail that says
              "someone configured this terminal" rather than "a code block
              with a border". */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 3px)",
            }}
            aria-hidden="true"
          />

          <div className="relative font-mono text-[0.82rem] sm:text-[0.88rem]">
            <span aria-hidden="true">
              <span style={{ color: "var(--mark)" }}>aryan</span>
              <span style={{ color: "var(--grey)" }}>@</span>
              <span style={{ color: "var(--grey-hi)" }}>runable</span>
              <span style={{ color: "var(--grey)" }}>:~$ </span>
              <span style={{ color: "var(--white)" }}>{cmd1}</span>
              {phase === 0 ? (
                <span className={cursorClass} style={{ color: "var(--mark)" }}>
                  &#9615;
                </span>
              ) : null}
            </span>
          </div>

          <h1
            className="display-tight relative mt-2 transition-opacity duration-500"
            style={{
              color: "var(--white)",
              fontSize: "clamp(2.6rem,9vw,6.2rem)",
              textShadow: "0 0 50px rgba(255,46,154,0.28)",
              opacity: outputVisible(1) ? 1 : 0,
            }}
          >
            {name}
          </h1>

          <div className="relative mt-6 font-mono text-[0.82rem] sm:text-[0.88rem]">
            <span aria-hidden="true">
              <span style={{ color: "var(--mark)" }}>aryan</span>
              <span style={{ color: "var(--grey)" }}>@</span>
              <span style={{ color: "var(--grey-hi)" }}>runable</span>
              <span style={{ color: "var(--grey)" }}>:~$ </span>
              <span style={{ color: "var(--white)" }}>{cmd2}</span>
              {phase === 2 ? (
                <span className={cursorClass} style={{ color: "var(--mark)" }}>
                  &#9615;
                </span>
              ) : null}
            </span>
          </div>

          <p
            className="relative mt-3 max-w-[46ch] transition-opacity duration-500"
            style={{
              color: "var(--silver)",
              fontSize: "clamp(1rem,2vw,1.25rem)",
              lineHeight: 1.55,
              opacity: outputVisible(3) ? 1 : 0,
            }}
          >
            {positioning.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>

          {outputVisible(3) ? (
            <div className="relative mt-6 font-mono text-[0.82rem] sm:text-[0.88rem]" aria-hidden="true">
              <span style={{ color: "var(--mark)" }}>aryan</span>
              <span style={{ color: "var(--grey)" }}>@</span>
              <span style={{ color: "var(--grey-hi)" }}>runable</span>
              <span style={{ color: "var(--grey)" }}>:~$ </span>
              <span className={cursorClass} style={{ color: "var(--mark)" }}>
                &#9615;
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


Exit code: 0