import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Section } from "../section";
import { Reveal } from "../reveal";
import { Marked } from "../marked";
import { useContent } from "../../context/content";

/**
 * HOME TEASER.
 *
 * This used to be the full bio plus an Education card plus a Footnotes card,
 * which made the home page the longest thing on the site before anyone had
 * reached the actual work. It is one paragraph now — the opening line of the
 * bio, unedited — and a link to /about for whoever wants the rest. Education
 * and the full bio live there; Footnotes is gone outright; nobody asked what
 * a "footnote" on a portfolio was for.
 */
export function About() {
  const { bio, profile } = useContent();

  return (
    <Section
      id="about"
      reel="02"
      slug="About"
      title="The short version."
      lead={profile.tagline}
    >
      <Reveal>
        <div className="prose-serif">
          <p
            className="text-[1.24rem] leading-[1.62]"
            style={{ color: "var(--white)" }}
          >
            <Marked>{bio[0]}</Marked>
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-6">
          <Link
            to="/about"
            className="slug group -my-2 inline-flex min-h-10 items-center gap-2 py-2 transition-colors hover:!text-white"
            style={{ color: "var(--grey-hi)" }}
          >
            The long version
            <ArrowRight
              size={12}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}
