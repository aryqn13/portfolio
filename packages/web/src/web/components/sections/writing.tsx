import { ArrowUpRight } from "lucide-react";
import { Reveal } from "../reveal";
import { useContent } from "../../context/content";
import { resolveIcon } from "../../config/social-icons";

/**
 * Writing gets full-bleed panels rather than small cards — two places, two
 * moods, each given its own half of the page.
 */
export function Writing() {
  const { writing, writingIntro } = useContent();

  return (
    <section id="writing" className="relative py-10">
      <Reveal>
        <p
          className="max-w-[62ch] border-l-2 pl-5 text-[1.06rem]"
          style={{ borderColor: "var(--edge-hi)", color: "var(--silver)" }}
        >
          {writingIntro}
        </p>
      </Reveal>

      <div className="mt-12 grid gap-px lg:grid-cols-2">
        {writing.map((entry, i) => {
          const Icon = resolveIcon(entry.icon);
          return (
            <Reveal key={entry.name} delay={i * 0.08}>
              <a
                href={entry.url}
                target="_blank"
                rel="noreferrer"
                className="group relative flex h-full min-h-[22rem] flex-col justify-between overflow-hidden border p-7 transition-colors duration-500 md:p-9"
                style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--edge-hi)";
                  e.currentTarget.style.background = "var(--ink-3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--edge)";
                  e.currentTarget.style.background = "var(--ink-2)";
                }}
              >
                {/* Oversized watermark logo, clipped by the panel. */}
                <Icon
                  size={260}
                  className="pointer-events-none absolute -right-14 -bottom-16 opacity-[0.045] transition-opacity duration-700 group-hover:opacity-[0.085]"
                  style={{ color: "var(--white)" }}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Icon
                      size={22}
                      style={{ color: "var(--grey-hi)" }}
                      className="transition-colors duration-500 group-hover:!text-white"
                    />
                    <span className="slug">{entry.handle}</span>
                  </div>
                  <ArrowUpRight
                    size={17}
                    style={{ color: "var(--grey)" }}
                    className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </div>

                <div className="relative mt-12">
                  <h3
                    className="display-tight text-[clamp(2.2rem,5vw,3.4rem)]"
                    style={{ color: "var(--white)" }}
                  >
                    {entry.name}
                  </h3>
                  <p
                    className="mt-4 max-w-[44ch] text-[1.04rem] leading-[1.7]"
                    style={{ color: "var(--silver)" }}
                  >
                    {entry.blurb}
                  </p>

                  <div
                    className="mt-6 flex flex-wrap gap-x-3 gap-y-1.5 border-t pt-4"
                    style={{ borderColor: "var(--edge)" }}
                  >
                    {entry.topics.map((topic, ti) => (
                      <span key={topic} className="slug">
                        {topic}
                        {ti < entry.topics.length - 1 ? (
                          <span style={{ color: "var(--edge-hi)" }}> /</span>
                        ) : null}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
