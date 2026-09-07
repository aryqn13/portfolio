import { Download } from "lucide-react";
import { Section } from "../section";
import { Reveal } from "../reveal";
import { useContent } from "../../context/content";
import { resolveIcon } from "../../config/social-icons";

export function Contact() {
  const { profile, resumes, socials } = useContent();
  const featured = socials.filter((s) => s.featured);
  /* First CV leads, the rest are optional cuts. */
  const [main, ...alternates] = resumes;

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
              className="display -my-2 block break-words py-2 text-[clamp(1.4rem,4.2vw,2.7rem)] transition-colors duration-500"
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
                    className="-m-2.5 inline-flex h-10 w-10 items-center justify-center transition-colors duration-300 hover:!text-white"
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
            <p className="slug">Resume</p>

            {/*
              Order is meaning: the first CV leads with a full panel, the rest
              are optional cuts on a quiet row underneath.
            */}
            {main ? (
              <a
                href={main.href}
                target="_blank"
                rel="noreferrer"
                className="group mt-4 flex items-center justify-between gap-4 border p-5 transition-colors duration-500"
                style={{
                  background: "var(--ink-2)",
                  borderColor: "var(--edge)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--ink-3)";
                  e.currentTarget.style.borderColor = "var(--edge-hi)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--ink-2)";
                  e.currentTarget.style.borderColor = "var(--edge)";
                }}
              >
                <span>
                  <span className="slug" style={{ color: "var(--mark)" }}>
                    Main CV
                  </span>
                  <span
                    className="display mt-2 block text-[1.4rem]"
                    style={{ color: "var(--white)" }}
                  >
                    {main.label}
                  </span>
                  <span className="slug mt-1.5 block">{main.note}</span>
                </span>
                <Download
                  size={18}
                  className="shrink-0 transition-colors duration-500 group-hover:!text-white"
                  style={{ color: "var(--grey-hi)" }}
                />
              </a>
            ) : null}

            {alternates.length ? (
              <div className="mt-4">
                <span className="slug">Also available</span>
                <div className="mt-2 space-y-px">
                  {alternates.map((resume) => (
                    <a
                      key={resume.label}
                      href={resume.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between gap-4 py-3 transition-colors"
                      style={{ color: "var(--grey-hi)" }}
                    >
                      <span>
                        <span
                          className="text-[0.98rem] transition-colors duration-300 group-hover:!text-white"
                          style={{ color: "var(--silver)" }}
                        >
                          {resume.label}
                        </span>
                        <span className="slug mt-1 block">{resume.note}</span>
                      </span>
                      <Download
                        size={14}
                        className="shrink-0 transition-colors duration-300 group-hover:!text-white"
                        style={{ color: "var(--grey)" }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
