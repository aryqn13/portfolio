import { Link } from "wouter";
import { ArrowUpRight, ArrowRight, Download } from "lucide-react";
import { Enter } from "../reveal";
import { useContent } from "../../context/content";
import { resolveIcon } from "../../config/social-icons";
import { PhotoStack } from "../photo-stack";

export function Hero() {
  const { profile, positioning, socials, resumes, photos } = useContent();
  const featured = socials.filter((s) => s.featured).slice(0, 6);
  /* First CV leads, the rest are optional cuts. */
  const [main, ...alternates] = resumes;

  return (
    <section id="opening" className="relative pt-32 pb-8 md:pt-40">
      <div className="glow left-[-10%] top-[4%] h-[420px] w-[420px]" />

      {/*
        Three grid children so the portrait can sit between the headline and the
        meta block on a phone, and beside both, optically centred, on a desktop.
      */}
      <div className="relative grid gap-10 md:grid-cols-12 md:gap-x-10 md:gap-y-8">
        <div className="md:col-span-7 md:col-start-1 md:row-start-1">
          <Enter>
            <div className="flex items-baseline gap-4">
              <span className="slug" style={{ color: "var(--silver)" }}>
                01
              </span>
              <span className="slug">Opening</span>
              <span className="hairline mb-1 flex-1" />
            </div>
          </Enter>

          <Enter delay={0.08}>
            <h1
              className="display-tight mt-7 text-[clamp(3.4rem,12vw,8.2rem)]"
              style={{ color: "var(--white)" }}
            >
              Aryan
            </h1>
          </Enter>

          <Enter delay={0.16}>
            <p
              className="mt-6 max-w-[54ch] text-[clamp(1.15rem,2.4vw,1.6rem)] leading-[1.45]"
              style={{ color: "var(--silver)" }}
            >
              {positioning.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </Enter>

        </div>

        {/* Portrait deck. Grey at rest, colour on hover. Throw to shuffle. */}
        <div className="md:col-span-4 md:col-start-9 md:row-span-2 md:row-start-1 md:self-start">
          <Enter delay={0.2}>
            <PhotoStack photos={photos} name={profile.name} />
          </Enter>
        </div>

        <div className="md:col-span-7 md:col-start-1 md:row-start-2">
          <Enter delay={0.24}>
            <div
              className="flex flex-wrap items-center gap-x-7 gap-y-3 border-t pt-6"
              style={{ borderColor: "var(--edge)" }}
            >
              <span className="slug" style={{ color: "var(--white)" }}>
                {profile.statusLabel}
              </span>
              <a
                href={profile.companyUrl}
                target="_blank"
                rel="noreferrer"
                className="slug link-underline -my-2 inline-flex min-h-10 items-center gap-1.5 py-2"
                style={{ color: "var(--silver)" }}
              >
                {profile.company} <ArrowUpRight size={11} />
              </a>
              <span className="slug">{profile.location}</span>
              <span className="slug">Since {profile.since}</span>
            </div>
          </Enter>

          <Enter delay={0.32}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/work"
                className="slug group inline-flex items-center gap-2.5 border px-5 py-3 transition-colors"
                style={{
                  borderColor: "var(--edge-hi)",
                  color: "var(--white)",
                  background: "var(--ink-3)",
                }}
              >
                See the work
                <ArrowRight
                  size={13}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              {/*
                Order is meaning: the first CV is the main one and gets a real
                button, the rest are secondary cuts and sit quietly underneath.
              */}
              {main ? (
                <a
                  href={main.href}
                  target="_blank"
                  rel="noreferrer"
                  className="slug group inline-flex items-center gap-2.5 border px-5 py-3 transition-colors hover:!border-[var(--edge-hi)] hover:!text-white"
                  style={{ borderColor: "var(--edge)", color: "var(--grey-hi)" }}
                >
                  <Download size={13} />
                  {main.label} CV
                </a>
              ) : null}
            </div>
          </Enter>

          {alternates.length ? (
            <Enter delay={0.36}>
              <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="slug" style={{ color: "var(--grey)" }}>
                  Also
                </span>
                {alternates.map((resume) => (
                  <a
                    key={resume.label}
                    href={resume.href}
                    target="_blank"
                    rel="noreferrer"
                    className="slug link-underline -my-2 inline-flex min-h-10 items-center gap-1.5 py-2 transition-colors hover:!text-white"
                    style={{ color: "var(--silver)" }}
                  >
                    <Download size={11} />
                    {resume.label} CV
                  </a>
                ))}
              </div>
            </Enter>
          ) : null}

          <Enter delay={0.4}>
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
                    <Icon size={17} />
                  </a>
                );
              })}
            </div>
          </Enter>
        </div>
      </div>
    </section>
  );
}
