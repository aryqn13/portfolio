import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Nav } from "./nav";
import { Enter } from "./reveal";
import { pages } from "../config/content";
import { useContent } from "../context/content";
import { useCountVisit, useViews } from "../queries/guestbook";

interface PageShellProps {
  /** Page index, matches the nav. */
  index: string;
  label: string;
  /** Big page title. Optional for the home page, which has its own hero. */
  title?: string;
  lead?: ReactNode;
  children: ReactNode;
}

export function PageShell({ index, label, title, lead, children }: PageShellProps) {
  useCountVisit();
  const views = useViews();
  const { profile } = useContent();

  const position = pages.findIndex((p) => p.label === label);
  const next = position >= 0 ? pages[(position + 1) % pages.length] : pages[0];

  return (
    <div className="grain vignette relative min-h-screen">
      <Nav />

      <main className="relative mx-auto w-full max-w-[1120px] px-5 pb-10 sm:px-8 xl:px-0">
        {title ? (
          <header className="pt-32 pb-4 md:pt-40">
            <Enter>
              <div className="flex items-baseline gap-4">
                <span className="slug" style={{ color: "var(--silver)" }}>
                  {index}
                </span>
                <span className="slug">{label}</span>
                <span className="hairline mb-1 flex-1" />
              </div>
              <h1
                className="display-tight mt-6 text-[clamp(2.7rem,8vw,5.6rem)]"
                style={{ color: "var(--white)" }}
              >
                {title}
              </h1>
              {lead ? (
                <p
                  className="mt-6 max-w-[66ch] text-lg"
                  style={{ color: "var(--silver)" }}
                >
                  {lead}
                </p>
              ) : null}
            </Enter>
          </header>
        ) : null}

        {children}

        {/* Next page, so the site reads as a sequence rather than a menu. */}
        <Link
          to={next.path}
          className="group mt-8 flex items-center justify-between border-t py-10"
          style={{ borderColor: "var(--edge)" }}
        >
          <div>
            <span className="slug">Next {next.index}</span>
            <p
              className="display-tight mt-2 text-[clamp(1.9rem,5vw,3.2rem)] transition-colors duration-300"
              style={{ color: "var(--grey-hi)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--white)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--grey-hi)";
              }}
            >
              {next.label}
            </p>
          </div>
          <ArrowRight
            size={26}
            style={{ color: "var(--grey)" }}
            className="transition-transform duration-500 group-hover:translate-x-2"
          />
        </Link>

        <footer
          className="flex flex-wrap items-center justify-between gap-4 border-t py-8"
          style={{ borderColor: "var(--edge)" }}
        >
          <span className="slug">
            Aryan, {new Date().getFullYear()}. Built by hand.
          </span>
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
