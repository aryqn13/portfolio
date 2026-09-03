import type { ReactNode } from "react";
import { Reveal } from "./reveal";
import { cn } from "../lib/utils";

interface SectionProps {
  id: string;
  reel: string;
  slug: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Every section header is identical: index, label, rule, headline, lead. */
export function Section({
  id,
  reel,
  slug,
  title,
  lead,
  children,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("relative scroll-mt-24 py-16 md:py-24", className)}
    >
      <Reveal>
        <div className="mb-10 md:mb-14">
          <div className="flex items-baseline gap-4">
            <span className="slug" style={{ color: "var(--silver)" }}>
              {reel}
            </span>
            <span className="slug">{slug}</span>
            <span className="hairline mb-1 flex-1" />
          </div>

          <h2
            className="display mt-5 text-[clamp(2rem,4.4vw,3.3rem)]"
            style={{ color: "var(--white)" }}
          >
            {title}
          </h2>

          {lead ? (
            <div className="mt-4 max-w-[64ch]" style={{ color: "var(--silver)" }}>
              {lead}
            </div>
          ) : null}
        </div>
      </Reveal>

      {children}
    </section>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span
      className="slug rounded-[2px] border px-2 py-1"
      style={{ color: "var(--grey-hi)", borderColor: "var(--edge)" }}
    >
      {children}
    </span>
  );
}
