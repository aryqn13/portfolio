import { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Enter } from "../reveal";
import { useContent } from "../../context/content";
import { resolveIcon } from "../../config/social-icons";

export function Hero() {
  const { profile, positioning, socials, resumes } = useContent();
  const [hover, setHover] = useState(false);
  const featured = socials.filter((s) => s.featured).slice(0, 6);

  return (
    <section id="opening" className="relative pt-32 pb-8 md:pt-40">
      <div className="glow left-[-10%] top-[4%] h-[420px] w-[420px]" />

      <div className="relative grid gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-8">
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

          <Enter delay={0.24}>
            <div
              className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 border-t pt-6"
              style={{ borderColor: "var(--edge)" }}
            >
              <span className="slug" style={{ color: "var(--white)" }}>
                {profile.statusLabel}
              </span>
              <a
                href={profile.companyUrl}
                target="_blank"
                rel="noreferrer"
                className="slug link-underline inline-flex items-center gap-1.5"
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

              {resumes.map((resume) => (
                <a
                  key={resume.label}
                  href={resume.href}
                  target="_blank"
                  rel="noreferrer"
                  className="slug inline-flex items-center gap-2 border px-5 py-3 transition-colors hover:!border-[var(--edge-hi)] hover:!text-white"
                  style={{ borderColor: "var(--edge)", color: "var(--grey-hi)" }}
                >
                  {resume.label} CV
                </a>
              ))}
            </div>
          </Enter>

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
                    className="transition-colors duration-300 hover:!text-white"
                  >
                    <Icon size={17} />
                  </a>
                );
              })}
            </div>
          </Enter>
        </div>

        {/* Portrait. Grey at rest, colour on hover. */}
        <div className="md:col-span-4">
          <Enter delay={0.2}>
            <button
              type="button"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              onFocus={() => setHover(true)}
              onBlur={() => setHover(false)}
              onClick={() => setHover((v) => !v)}
              aria-label="Portrait, hover for colour"
              className="relative block w-full cursor-pointer overflow-hidden border text-left"
              style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
            >
              <img
                src="/images/avatar.png"
                alt="Aryan"
                className="aspect-[4/5] w-full object-cover object-top transition-[filter,transform] duration-700"
                style={{
                  filter: hover
                    ? "grayscale(0) contrast(1.02) saturate(1.05)"
                    : "grayscale(1) contrast(1.08) brightness(0.94)",
                  transform: hover ? "scale(1.02)" : "scale(1)",
                }}
              />
              <span
                className="slug absolute bottom-3 left-3 px-2 py-1"
                style={{
                  background: "rgba(6,6,6,0.7)",
                  color: hover ? "var(--white)" : "var(--grey-hi)",
                }}
              >
                {hover ? "In colour" : "Hover for colour"}
              </span>
            </button>
          </Enter>
        </div>
      </div>
    </section>
  );
}
