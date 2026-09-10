import { PageShell } from "../components/page-shell";
import { Reveal } from "../components/reveal";
import { Marked } from "../components/marked";
import { useContent } from "../context/content";

export default function AboutPage() {
  const { bio, education } = useContent();

  return (
    <PageShell
      index="02"
      label="About"
      title="The long version."
      lead="Growth at Runable, the code around it, and everything that fed into both."
    >
      <div className="pt-8 pb-4">
        <div className="prose-serif space-y-6">
          {bio.map((paragraph, i) => (
            <Reveal key={paragraph.slice(0, 24)} delay={i * 0.05}>
              <p
                className={
                  i === 0
                    ? "text-[1.24rem] leading-[1.62]"
                    : "text-[1.06rem] leading-[1.72]"
                }
                style={{ color: i === 0 ? "var(--white)" : "var(--silver)" }}
              >
                <Marked>{paragraph}</Marked>
              </p>
            </Reveal>
          ))}
        </div>

        {/* One line, not a boxed card: a degree is a fact to note in passing,
            not something that needs its own frame next to the actual story. */}
        <Reveal delay={0.2}>
          <div
            className="mt-10 flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5 border-t pt-6"
            style={{ borderColor: "var(--edge)" }}
          >
            <span className="display text-base" style={{ color: "var(--white)" }}>
              {education.degree}
            </span>
            <span style={{ color: "var(--silver)" }}>— {education.school}</span>
            <span className="slug ml-auto">
              {education.period} · {education.detail}
            </span>
          </div>
        </Reveal>
      </div>
    </PageShell>
  );
}
