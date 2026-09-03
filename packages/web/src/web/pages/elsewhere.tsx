import { PageShell } from "../components/page-shell";
import { Socials } from "../components/sections/socials";
import { Guestbook } from "../components/sections/guestbook";
import { Contact } from "../components/sections/contact";

export default function ElsewherePage() {
  return (
    <PageShell
      index="05"
      label="Elsewhere"
      title="Elsewhere"
      lead="Every account worth having, plus a guestbook nobody asked for and the fastest way to reach me."
    >
      <Socials />
      <Guestbook />
      <Contact />
    </PageShell>
  );
}
