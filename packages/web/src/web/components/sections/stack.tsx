import { Section } from "../section";
import { Reveal } from "../reveal";
import { useContent } from "../../context/content";
import type { SkillColumn } from "../../config/content";

function Column({ column, delay }: { column: SkillColumn; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div
        className="h-full border p-6"
        style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
      >
        <h3 className="display text-[1.3rem]" style={{ color: "var(--white)" }}>
          {column.label}
        </h3>

        <div className="mt-6 space-y-6">
          {column.groups.map((group) => (
            <div key={group.title}>
              <span className="slug">{group.title}</span>
              <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
                {group.items.map((item, i) => (
                  <span
                    key={item}
                    className="text-[0.98rem]"
                    style={{ color: "var(--silver)" }}
                  >
                    {item}
                    {i < group.items.length - 1 ? (
                      <span style={{ color: "var(--edge-hi)" }}> ·</span>
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export function Stack() {
  const { skills, sharpening } = useContent();

  return (
    <Section
      id="stack"
      reel="03"
      slug="Toolkit"
      title="Two columns, one job."
      lead="The split is real but the boundary is not. Distribution decisions turn into schema decisions faster than anyone admits."
    >
      <div className="grid gap-px md:grid-cols-2">
        <Column column={skills.growth} delay={0} />
        <Column column={skills.engineering} delay={0.08} />
      </div>

      <Reveal delay={0.14}>
        <p
          className="mt-8 border-l-2 pl-5 text-[1.05rem] italic"
          style={{ borderColor: "var(--edge-hi)", color: "var(--silver)" }}
        >
          {sharpening}
        </p>
      </Reveal>
    </Section>
  );
}
