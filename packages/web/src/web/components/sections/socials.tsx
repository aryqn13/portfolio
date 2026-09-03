import { ArrowUpRight } from "lucide-react";
import { Reveal } from "../reveal";
import { useContent } from "../../context/content";
import { resolveIcon } from "../../config/social-icons";
import { cn } from "../../lib/utils";

/**
 * Every link, real platform logos, greys only. Cards carry the logo as a large
 * watermark; `wide: true` in the socials config spans two columns.
 */
export function Socials() {
  const { socials } = useContent();

  return (
    <section id="socials" className="relative py-16 md:py-24">
      <Reveal>
        <div className="mb-8 flex items-baseline gap-4">
          <span className="slug" style={{ color: "var(--silver)" }}>
            01
          </span>
          <span className="slug">Accounts</span>
          <span className="hairline mb-1 flex-1" />
        </div>
      </Reveal>

      <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
        {socials.map((social, i) => {
          const Icon = resolveIcon(social.icon);
          return (
            <Reveal
              key={social.id}
              delay={Math.min(i, 8) * 0.035}
              className={cn(social.wide && "sm:col-span-2")}
            >
              <a
                href={social.url}
                target={social.url.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                className="group relative flex h-full min-h-[10.5rem] flex-col justify-between overflow-hidden border p-5 transition-colors duration-500 md:p-6"
                style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--edge-hi)";
                  e.currentTarget.style.background = "var(--ink-3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--edge)";
                  e.currentTarget.style.background = "var(--ink-2)";
                }}
              >
                <Icon
                  size={140}
                  className="pointer-events-none absolute -right-8 -bottom-10 opacity-[0.04] transition-all duration-700 group-hover:opacity-[0.09] group-hover:-rotate-6"
                  style={{ color: "var(--white)" }}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <Icon
                    size={20}
                    style={{ color: "var(--grey-hi)" }}
                    className="transition-colors duration-500 group-hover:!text-white"
                  />
                  <ArrowUpRight
                    size={15}
                    style={{ color: "var(--grey)" }}
                    className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </div>

                <div className="relative mt-6">
                  <h3
                    className="display text-[1.35rem] leading-tight"
                    style={{ color: "var(--white)" }}
                  >
                    {social.label}
                  </h3>
                  <p className="slug mt-1.5 truncate">{social.handle}</p>
                  {social.note ? (
                    <p
                      className="mt-2.5 max-w-[40ch] text-[0.96rem] leading-[1.6]"
                      style={{ color: "var(--silver)" }}
                    >
                      {social.note}
                    </p>
                  ) : null}
                </div>
              </a>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
