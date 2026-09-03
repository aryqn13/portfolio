import { Section, Tag } from "../section";
import { Reveal } from "../reveal";
import { useContent } from "../../context/content";

const KIND_LABEL: Record<string, string> = {
  growth: "Growth",
  engineering: "Engineering",
  community: "Community",
};

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
                        <span>{point}</span>
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
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
