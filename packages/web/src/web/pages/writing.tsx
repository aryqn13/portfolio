import { PageShell } from "../components/page-shell";
import { Writing } from "../components/sections/writing";

export default function WritingPage() {
  return (
    <PageShell
      index="04"
      label="Writing"
      title="Writing"
      lead="Two publications, roughly two versions of me. One thinks out loud about distribution, the other explains code."
    >
      <Writing />
    </PageShell>
  );
}
