import { PageShell } from "../components/page-shell";
import { Work as Experience } from "../components/sections/work";
import { Projects } from "../components/sections/projects";
import { Stack } from "../components/sections/stack";
import { Contributions } from "../components/contributions";

export default function WorkPage() {
  return (
    <PageShell
      index="02"
      label="Work"
      title="Work"
      lead="Growth systems, the software under them, and the projects I built to stop treating concepts as magic words."
    >
      <div className="pt-8">
        <Contributions />
      </div>
      <Experience />
      <Projects />
      <Stack />
    </PageShell>
  );
}
