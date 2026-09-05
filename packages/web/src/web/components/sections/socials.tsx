import { ArrowUpRight } from "lucide-react";
import { Reveal } from "../reveal";
import { useContent } from "../../context/content";
import { resolveIcon } from "../../config/social-icons";

/**
 * An index of accounts, not a wall of cards. One hairline row per platform:
 * number, logo, name, handle, note, arrow. Rows are the same height and the
 * whole list scans in one pass, which is the point of a links page.
 *
 * Hairlines, not boxes. Same rule as the rest of the site.
 */
export function Socials() {
  const { socials } = useContent();

  return (
    <section id="socials" className="relative py-16 md:py-24">
      <Reveal>
        <div className="mb-2 flex items-baseline gap-4">
          <span className="slug" style={{ color: "var(--silver)" }}>
            01
          </span>
          <span className="slug">Accounts</span>
          <span className="hairline mb-1 flex-1" />
          <span className="slug">{String(socials.length).padStart(2, "0")}</span>
        </div>
      </Reveal>

      <ul>
        {socials.map((social, i) => {
          const Icon = resolveIcon(social.icon);
          return (
            <Reveal key={social.id} delay={Math.min(i, 10) * 0.03}>
              <li>
                <a
                  href={social.url}
                  target={
                    social.url.startsWith("mailto:") ? undefined : "_blank"
                  }
                  rel="noreferrer"
                  className="group flex items-center gap-4 border-b border-[var(--edge)] py-4 transition-colors duration-300 hover:bg-[var(--ink-2)] md:gap-6 md:py-[1.15rem]"
                >
                  <span className="slug w-6 shrink-0 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <Icon
                    size={17}
                    className="shrink-0 text-[var(--grey-hi)] transition-colors duration-300 group-hover:text-white"
                  />

                  <span className="min-w-0 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 md:w-[9.5rem]">
                    <span
                      className="display block text-[1.05rem] leading-none tracking-tight"
                      style={{ color: "var(--white)" }}
                    >
                      {social.label}
                    </span>
                    <span className="slug mt-1.5 block truncate normal-case md:hidden">
                      {social.handle}
                    </span>
                  </span>

                  <span className="slug hidden shrink-0 truncate normal-case md:block md:w-[13rem]">
                    {social.handle}
                  </span>

                  <span
                    className="hidden flex-1 truncate text-[0.95rem] lg:block"
                    style={{ color: "var(--grey-hi)" }}
                  >
                    {social.note ?? ""}
                  </span>

                  <ArrowUpRight
                    size={15}
                    className="ml-auto shrink-0 text-[var(--grey)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white lg:ml-0"
                  />
                </a>
              </li>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
