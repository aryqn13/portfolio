import { Section } from "../section";
import { Reveal } from "../reveal";
import { Marked } from "../marked";
import { SkillGrid } from "./skills-grid";
import { useContent } from "../../context/content";

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
        <SkillGrid column={skills.growth} delay={0} />
        <SkillGrid column={skills.engineering} delay={0.08} />
      </div>

      <Reveal delay={0.14}>
        <p
          className="mt-8 border-l-2 pl-5 text-[1.05rem] italic"
          style={{ borderColor: "var(--edge-hi)", color: "var(--silver)" }}
        >
          <Marked>{sharpening}</Marked>
        </p>
      </Reveal>
    </Section>
  );
}
