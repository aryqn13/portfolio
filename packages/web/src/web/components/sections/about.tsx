import { Section } from "../section";
import { Reveal } from "../reveal";
import { useContent } from "../../context/content";

export function About() {
  const { bio, quickFacts, education, profile } = useContent();

  return (
    <Section
      id="about"
      reel="02"
      slug="About"
      title="The long version."
      lead={profile.tagline}
    >
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="prose-serif space-y-6">
            {bio.map((paragraph, i) => (
              <Reveal key={paragraph.slice(0, 24)} delay={i * 0.04}>
                <p
                  className={
                    i === 0
                      ? "text-[1.24rem] leading-[1.62]"
                      : "text-[1.06rem] leading-[1.72]"
                  }
                  style={{ color: i === 0 ? "var(--white)" : "var(--silver)" }}
                >
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-4">
          <Reveal delay={0.1}>
            <div
              className="border p-5"
              style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
            >
              <span className="slug" style={{ color: "var(--white)" }}>
                Education
              </span>
              <p className="display mt-3 text-lg" style={{ color: "var(--white)" }}>
                {education.degree}
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--silver)" }}>
                {education.school}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--grey-hi)" }}>
                {education.detail}
              </p>
              <p className="slug mt-3">{education.period}</p>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div
              className="mt-px border p-5"
              style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
            >
              <span className="slug" style={{ color: "var(--white)" }}>
                Footnotes
              </span>
              <ul className="mt-3 space-y-2.5">
                {quickFacts.map((fact) => (
                  <li
                    key={fact}
                    className="flex gap-3 text-sm"
                    style={{ color: "var(--silver)" }}
                  >
                    <span style={{ color: "var(--grey)" }}>/</span>
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </aside>
      </div>
    </Section>
  );
}
