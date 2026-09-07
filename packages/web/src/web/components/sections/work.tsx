import { useState } from "react";
import { Section, Tag } from "../section";
import { Reveal } from "../reveal";
import { Marked } from "../marked";
import { Lightbox } from "../lightbox";
import { useContent } from "../../context/content";
import type { Shot } from "../../config/content";

const KIND_LABEL: Record<string, string> = {
  growth: "Growth",
  engineering: "Engineering",
  community: "Community",
};

/** Thumbnail strip of proof of work. Click opens the shot full size. */
function Shots({ shots }: { shots: Shot[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mt-6">
      <span className="slug">Proof of work</span>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {shots.map((shot, i) => (
          <button
            key={`${shot.src}-${i}`}
            type="button"
            aria-label={shot.caption ?? `Open screenshot ${i + 1}`}
            title={shot.caption}
            onClick={() => setOpen(i)}
            className="h-16 w-24 overflow-hidden border transition-colors sm:h-[4.6rem] sm:w-28"
            style={{ borderColor: "var(--edge)", background: "var(--ink-3)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--mark)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--edge)";
            }}
          >
            <img
              src={shot.src}
              alt={shot.caption ?? ""}
              loading="lazy"
              className="h-full w-full object-cover opacity-70 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0"
            />
          </button>
        ))}
      </div>

      <Lightbox shots={shots} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </div>
  );
}

export function Work() {
  const { experience } = useContent();

  return (
    <Section
      id="work"
      reel="01"
      slug="Experience"
      title="Where the hours went."
      lead="Growth on one side, engineering on the other, and a stretch of community work that turned out to be the same skill in different clothes."
    >
      <ol>
        {experience.map((job, i) => (
          <li key={`${job.company}-${job.role}`}>
            <Reveal delay={Math.min(i, 4) * 0.04}>
              <article
                className="group grid gap-6 border-t py-9 transition-colors md:grid-cols-12"
                style={{ borderColor: "var(--edge)" }}
              >
                <div className="md:col-span-4">
                  <div className="flex items-center gap-3">
                    <span className="slug">{KIND_LABEL[job.kind] ?? job.kind}</span>
                    {job.current ? (
                      <span
                        className="slug px-1.5 py-0.5"
                        style={{
                          background: "var(--ink-4)",
                          color: "var(--white)",
                        }}
                      >
                        Now
                      </span>
                    ) : null}
                  </div>

                  <h3
                    className="display mt-3 text-[1.5rem] leading-tight"
                    style={{ color: "var(--white)" }}
                  >
                    {job.company}
                  </h3>
                  <p className="mt-1.5 text-base" style={{ color: "var(--silver)" }}>
                    {job.role}
                  </p>
                  <p className="slug mt-3">{job.period}</p>
                  <p className="slug mt-1">{job.location}</p>
                </div>

                <div className="md:col-span-8">
                  <ul className="space-y-3.5">
                    {job.points.map((point) => (
                      <li
                        key={point.slice(0, 30)}
                        className="flex gap-3.5 text-[1.02rem] leading-[1.68]"
                        style={{ color: "var(--silver)" }}
                      >
                        <span className="mt-1 shrink-0" style={{ color: "var(--grey)" }}>
                          /
                        </span>
                        <span>
                          <Marked>{point}</Marked>
                        </span>
                      </li>
                    ))}
                  </ul>

                  {job.stack?.length ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {job.stack.map((item) => (
                        <Tag key={item}>{item}</Tag>
                      ))}
                    </div>
                  ) : null}

                  {job.shots?.length ? <Shots shots={job.shots} /> : null}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
