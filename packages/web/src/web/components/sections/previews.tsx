import { Link } from "wouter";
import { ArrowRight, Mail as MailIcon } from "lucide-react";
import { Section } from "../section";
import { Reveal } from "../reveal";
import { Marked } from "../marked";
import { SkillGrid } from "./skills-grid";
import { useContent } from "../../context/content";
import { resolveIcon } from "../../config/social-icons";

/**
 * HOME PAGE PREVIEWS.
 *
 * The brief: everything necessary should be on the first page. So the home page
 * carries a real preview of Work, since that is what someone hiring came for,
 * and lighter strips for Interests, Writing and Elsewhere, which only need to
 * prove they exist and are worth a click.
 */

const KIND_LABEL: Record<string, string> = {
  growth: "Growth",
  engineering: "Engineering",
  community: "Community",
};

/** A quiet text link with a moving arrow. Used at the foot of each preview. */
function More({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="slug group -my-2 inline-flex min-h-10 items-center gap-2 py-2 transition-colors hover:!text-white"
      style={{ color: "var(--grey-hi)" }}
    >
      {children}
      <ArrowRight
        size={12}
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </Link>
  );
}

/**
 * Capability, understood at a glance. The complaint this answers: reading two
 * paragraphs of prose does not tell you what someone can actually operate.
 */
export function SkillsPreview() {
  const { skills } = useContent();

  return (
    <Section
      id="skills"
      reel="03"
      slug="Capability"
      title="What I actually operate."
      lead="Two halves of one job. The growth side has no logos to borrow, so it gets drawn ones."
    >
      <div className="grid gap-px md:grid-cols-2">
        <SkillGrid column={skills.growth} delay={0} compact />
        <SkillGrid column={skills.engineering} delay={0.06} compact />
      </div>
    </Section>
  );
}

/** The full preview: recent roles, then the projects, then the way through. */
export function WorkPreview() {
  const { experience, projects } = useContent();
  const recent = experience.slice(0, 3);

  return (
    <Section
      id="work-preview"
      reel="04"
      slug="Work"
      title="Where the hours went."
      lead="Growth on one side, engineering on the other, and a stretch of community work that turned out to be the same skill in different clothes."
    >
      <ol className="border-t" style={{ borderColor: "var(--edge)" }}>
        {recent.map((job, i) => (
          <li key={`${job.company}-${job.role}`}>
            <Reveal delay={i * 0.05}>
              <Link
                to="/work"
                className="group grid items-baseline gap-x-6 gap-y-2 border-b py-5 transition-colors sm:grid-cols-12"
                style={{ borderColor: "var(--edge)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--ink-2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div className="flex items-center gap-3 sm:col-span-4">
                  <h3
                    className="display text-[1.2rem] leading-none"
                    style={{ color: "var(--white)" }}
                  >
                    {job.company}
                  </h3>
                  {job.current ? (
                    <span
                      className="slug px-1.5 py-0.5"
                      style={{ background: "var(--ink-4)", color: "var(--white)" }}
                    >
                      Now
                    </span>
                  ) : null}
                </div>

                <p
                  className="text-[0.98rem] sm:col-span-5"
                  style={{ color: "var(--silver)" }}
                >
                  {job.role}
                </p>

                <div className="flex items-center gap-3 sm:col-span-3 sm:justify-end">
                  <span className="slug">{KIND_LABEL[job.kind] ?? job.kind}</span>
                  <span className="slug hidden whitespace-nowrap md:inline">
                    {job.period}
                  </span>
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ol>

      {/* Projects, one line each. The detail lives on /work. */}
      <Reveal delay={0.12}>
        <div className="mt-8">
          <span className="slug">Built from scratch</span>
          <div className="mt-3 grid gap-px sm:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.name}
                className="border p-4"
                style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
              >
                <p
                  className="display text-[1.02rem]"
                  style={{ color: "var(--white)" }}
                >
                  {project.name}
                </p>
                <p
                  className="mt-2 text-[0.9rem] leading-[1.6]"
                  style={{ color: "var(--grey-hi)" }}
                >
                  <Marked>{project.blurb}</Marked>
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.16}>
        <div className="mt-7">
          <More to="/work">The whole thing, with the detail</More>
        </div>
      </Reveal>
    </Section>
  );
}

/**
 * The light strips. One per remaining page, sat under its index row so the
 * big-type list keeps working as a list but stops being a list of nouns.
 */
export function PagePreview({ path }: { path: string }) {
  const { favouriteFilms, writing, socials, musicIntro } = useContent();

  if (path === "/interests") {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1.5">
          {favouriteFilms.slice(0, 4).map((film) => (
            <span
              key={film.title}
              title={`${film.title} (${film.year}), ${film.director}`}
              className="block h-16 w-[2.7rem] shrink-0 overflow-hidden border"
              style={{ borderColor: "var(--edge)", background: "var(--ink-3)" }}
            >
              <img
                src={film.poster}
                alt={film.title}
                loading="lazy"
                className="h-full w-full object-cover opacity-80 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0"
              />
            </span>
          ))}
        </div>
        <p
          className="max-w-[42ch] text-[0.92rem] leading-[1.6]"
          style={{ color: "var(--grey-hi)" }}
        >
          A film a week, logged without exception. {musicIntro.split(".")[0]}. And
          Real Madrid, for my sins.
        </p>
      </div>
    );
  }

  if (path === "/writing") {
    return (
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {writing.map((entry) => {
          const Icon = resolveIcon(entry.icon);
          return (
            <span key={entry.name} className="flex items-center gap-2.5">
              <Icon size={15} style={{ color: "var(--grey-hi)" }} />
              <span
                className="text-[0.95rem]"
                style={{ color: "var(--silver)" }}
              >
                {entry.name}
              </span>
              <span className="slug normal-case">{entry.handle}</span>
            </span>
          );
        })}
        <span
          className="max-w-[38ch] text-[0.92rem]"
          style={{ color: "var(--grey-hi)" }}
        >
          Growth systems, distribution, and older machine learning notes.
        </span>
      </div>
    );
  }

  if (path === "/elsewhere") {
    return (
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {socials.slice(0, 10).map((social) => {
          const Icon = resolveIcon(social.icon);
          return (
            <span
              key={social.id}
              title={`${social.label}, ${social.handle}`}
              className="inline-flex items-center"
              style={{ color: "var(--grey)" }}
            >
              <Icon size={15} />
            </span>
          );
        })}
        <span className="slug">
          {String(socials.length).padStart(2, "0")} accounts, plus both CVs and
          the guestbook
        </span>
      </div>
    );
  }

  return null;
}

/** Small icon row of every social. Sits in both footers. */
export function FooterSocials() {
  const { socials, profile } = useContent();

  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
      {socials.map((social) => {
        const Icon = resolveIcon(social.icon);
        return (
          <a
            key={social.id}
            href={social.url}
            target={social.url.startsWith("mailto:") ? undefined : "_blank"}
            rel="noreferrer"
            aria-label={social.label}
            title={`${social.label}, ${social.handle}`}
            className="-m-2.5 inline-flex h-10 w-10 items-center justify-center transition-colors duration-300 hover:!text-white"
            style={{ color: "var(--grey)" }}
          >
            <Icon size={15} />
          </a>
        );
      })}
      {socials.some((s) => s.url.startsWith("mailto:")) ? null : (
        <a
          href={`mailto:${profile.email}`}
          aria-label="Email"
          title={profile.email}
          className="-m-2.5 inline-flex h-10 w-10 items-center justify-center transition-colors duration-300 hover:!text-white"
          style={{ color: "var(--grey)" }}
        >
          <MailIcon size={15} />
        </a>
      )}
    </div>
  );
}
