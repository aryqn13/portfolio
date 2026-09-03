import { PageShell } from "../components/page-shell";
import { Films } from "../components/sections/films";
import { Music } from "../components/sections/music";

export default function InterestsPage() {
  return (
    <PageShell
      index="03"
      label="Interests"
      title="Films, music, and one football club that keeps letting me down."
      lead="The part of the site that has nothing to do with work, which is probably why it gets updated the most."
    >
      <Films />
      <Music />
    </PageShell>
  );
}
