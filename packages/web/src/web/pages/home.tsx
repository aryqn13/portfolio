import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Nav } from "../components/nav";
import { Hero } from "../components/sections/hero";
import { About } from "../components/sections/about";
import { Reveal } from "../components/reveal";
import { pages } from "../config/content";
import { useContent } from "../context/content";
import { useCountVisit, useViews } from "../queries/guestbook";

/** The only page without a contributions graph, by design. */
export default function Home() {
  useCountVisit();
  const views = useViews();
  const { profile } = useContent();
  const rest = pages.filter((page) => page.path !== "/");

  return (
    <div className="grain vignette relative min-h-screen">
      <Nav />

      <main className="relative mx-auto w-full max-w-[1120px] px-5 pb-10 sm:px-8 xl:px-0">
        <Hero />
        <About />

        {/* Index of everything else. */}
        <section className="py-14">
          <Reveal>
            <div className="flex items-baseline gap-4">
              <span className="slug" style={{ color: "var(--silver)" }}>
                03
              </span>
              <span className="slug">Index</span>
              <span className="hairline mb-1 flex-1" />
            </div>
          </Reveal>

          <ul className="mt-6">
            {rest.map((page, i) => (
              <li key={page.path}>
                <Reveal delay={i * 0.05}>
                  <Link
                    to={page.path}
                    className="group flex items-baseline gap-5 border-b py-6"
                    style={{ borderColor: "var(--edge)" }}
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
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <footer
          className="flex flex-wrap items-center justify-between gap-4 border-t py-8"
          style={{ borderColor: "var(--edge)" }}
        >
          <span className="slug">
            Aryan, {new Date().getFullYear()}. Bengaluru.
          </span>
          <div className="flex items-center gap-5">
            <a
              href={`mailto:${profile.email}`}
              className="slug link-underline"
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
