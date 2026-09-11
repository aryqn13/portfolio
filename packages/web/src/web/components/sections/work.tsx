import { useState } from "react";
import { Section, Tag } from "../section";
import { Reveal } from "../reveal";
import { Marked } from "../marked";
import { Lightbox } from "../lightbox";
import { useContent } from "../../context/content";
import type { Experience, Shot } from "../../config/content";
import { KIND_LABEL, groupByCompany } from "../../lib/experience";

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
            className="h-16 w-24 overflow-hidden rounded-[var(--r-tile)] border transition-colors sm:h-[4.6rem] sm:w-28"
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
              className="h-full w-full scale-100 object-cover opacity-85 transition duration-500 hover:scale-[1.04] hover:opacity-100"
            />
          </button>
        ))}
      </div>

      <Lightbox shots={shots} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </div>
  );
}

function Role({ job }: { job: Experience }) {
  return (
    <div>
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
  );
}

export function Work() {
  const { experience } = useContent();
  const groups = groupByCompany(experience);

  return (
    <Section
      id="work"
      reel="01"
      slug="Experience"
      title="Where the hours went."
      lead="Growth on one side, engineering on the other, and a stretch of community work that turned out to be the same skill in different clothes."
    >
      <ol>
        {groups.map((group, i) => {
          const lead = group.jobs[0];

          return (
            <li key={group.company}>
              <Reveal delay={Math.min(i, 4) * 0.04}>
                <article
                  className="group grid gap-6 border-t py-9 transition-colors md:grid-cols-12"
                  style={{ borderColor: "var(--edge)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--ink-2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div className="md:col-span-4">
                    <div className="flex items-center gap-3">
                      <span className="slug">{KIND_LABEL[lead.kind] ?? lead.kind}</span>
                      {lead.current ? (
                        <span
                          className="slug flex items-center gap-1.5"
                          style={{ color: "var(--mark)" }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: "var(--mark)" }}
                          />
                          Now
                        </span>
                      ) : null}
                    </div>

                    <h3
                      className="display mt-3 text-[1.5rem] leading-tight"
                      style={{ color: "var(--white)" }}
                    >
                      {group.company}
                    </h3>

                    <p className="mt-1.5 text-base" style={{ color: "var(--silver)" }}>
                      {lead.role}
                    </p>
                    <p className="slug mt-3">{lead.period}</p>
                    <p className="slug mt-1">{lead.location}</p>
                  </div>

                  <div className="md:col-span-8">
                    <Role job={lead} />
                  </div>
                </article>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
