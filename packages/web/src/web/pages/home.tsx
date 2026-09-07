import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Nav } from "../components/nav";
import { Hero } from "../components/sections/hero";
import { About } from "../components/sections/about";
import {
  SkillsPreview,
  WorkPreview,
  PagePreview,
  FooterSocials,
} from "../components/sections/previews";
import { Reveal } from "../components/reveal";
import { pages } from "../config/content";
import { useContent } from "../context/content";
import { useCountVisit, useViews } from "../queries/guestbook";

/**
 * The home page carries the whole story: opening, the short bio, what I can
 * operate, a real preview of the work, then a preview of everything else.
 * Nothing important should require a second click.
 *
 * The only page without a contributions graph, by design.
 */
export default function Home() {
  useCountVisit();
  const views = useViews();
  const { profile } = useContent();
  /* Work has its own preview block above, so the index carries the rest. */
  const rest = pages.filter(
    (page) => page.path !== "/" && page.path !== "/work",
  );

  return (
    <div className="grain vignette relative min-h-screen">
      <Nav />

      <main className="relative mx-auto w-full max-w-[1120px] px-5 pb-10 sm:px-8 xl:px-0">
        <Hero />
        <About />
        <SkillsPreview />
        <WorkPreview />

        {/* Index of everything else, each row with a look at what is inside. */}
        <section className="py-14">
          <Reveal>
            <div className="flex items-baseline gap-4">
              <span className="slug" style={{ color: "var(--silver)" }}>
                05
              </span>
              <span className="slug">Index</span>
              <span className="hairline mb-1 flex-1" />
            </div>
          </Reveal>

          <ul className="mt-6">
            {rest.map((page, i) => (
              <li key={page.path}>
                <Reveal delay={i * 0.05}>
                  <div className="border-b py-6" style={{ borderColor: "var(--edge)" }}>
                    {/* -my-2 py-2 min-h-10 keeps the tap target at 40px on a
                        phone without changing the desktop rhythm. */}
                    <Link
                      to={page.path}
                      className="group -my-2 flex min-h-10 items-baseline gap-5 py-2"
                    >
                      <span className="slug w-8 shrink-0">{page.index}</span>
                      <span
                        className="display-tight text-[clamp(1.9rem,5.5vw,3.4rem)] transition-colors duration-300"
                        style={{ color: "var(--grey-hi)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--white)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--grey-hi)";
                        }}
                      >
                        {page.label}
                      </span>
                      <ArrowRight
                        size={20}
                        style={{ color: "var(--grey)" }}
                        className="ml-auto self-center transition-transform duration-500 group-hover:translate-x-2"
                      />
                    </Link>

                    <div className="mt-4 pl-0 sm:pl-13">
                      <PagePreview path={page.path} />
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <footer
          className="flex flex-wrap items-center justify-between gap-x-6 gap-y-5 border-t py-8"
          style={{ borderColor: "var(--edge)" }}
        >
          <span className="slug">
            Aryan, {new Date().getFullYear()}. Bengaluru.
          </span>

          <FooterSocials />

          <div className="flex items-center gap-5">
            <a
              href={`mailto:${profile.email}`}
              className="slug link-underline -my-2 inline-flex min-h-10 items-center py-2 normal-case"
              style={{ color: "var(--silver)" }}
            >
              {profile.email}
            </a>
            <span className="slug">
              {views.data?.views ? `${views.data.views} views` : ""}
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
