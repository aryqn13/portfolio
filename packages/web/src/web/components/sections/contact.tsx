import { Download } from "lucide-react";
import { Section } from "../section";
import { Reveal } from "../reveal";
import { useContent } from "../../context/content";
import { resolveIcon } from "../../config/social-icons";

export function Contact() {
  const { profile, resumes, socials } = useContent();
  const featured = socials.filter((s) => s.featured);

  return (
    <Section
      id="contact"
      reel="03"
      slug="Contact"
      title="Say something."
      lead="Open to conversations about growth systems, distribution, and the engineering that supports both."
    >
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <a
              href={`mailto:${profile.email}`}
              className="display block text-[clamp(1.4rem,4.2vw,2.7rem)] transition-colors duration-500"
              style={{ color: "var(--white)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--silver)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--white)";
              }}
            >
              {profile.email}
            </a>
            <p className="mt-4 max-w-[54ch]" style={{ color: "var(--silver)" }}>
              Fastest route is email. I read everything and reply to anything that
              is not a template.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              {featured.map((social) => {
                const Icon = resolveIcon(social.icon);
                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    style={{ color: "var(--grey)" }}
                    className="transition-colors duration-300 hover:!text-white"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Reveal delay={0.08}>
            <p className="slug">Resume, two cuts</p>
            <div className="mt-4 space-y-px">
              {resumes.map((resume) => (
                <a
                  key={resume.label}
                  href={resume.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-4 p-4 transition-colors duration-500"
                  style={{ background: "var(--ink-2)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--ink-3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--ink-2)";
                  }}
                >
                  <span>
                    <span
                      className="display block text-lg"
                      style={{ color: "var(--white)" }}
                    >
                      {resume.label}
                    </span>
                    <span className="slug mt-1 block">{resume.note}</span>
                  </span>
                  <Download size={15} style={{ color: "var(--grey-hi)" }} />
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
