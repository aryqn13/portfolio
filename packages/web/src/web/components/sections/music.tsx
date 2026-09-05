import { ArrowUpRight } from "lucide-react";
import { Section } from "../section";
import { Reveal } from "../reveal";
import { useContent } from "../../context/content";
import { resolveIcon } from "../../config/social-icons";

/** No API here on purpose. Last.fm blocks scraping, so these are links. */
export function Music() {
  const { musicIntro, socials } = useContent();
  const ids = ["lastfm", "spotify"];
  const cards = ids
    .map((id) => socials.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <Section
      id="music"
      reel="02"
      slug="Music"
      title="What is actually playing."
      lead={musicIntro}
    >
      <div className="grid gap-px md:grid-cols-2">
        {cards.map((card, i) => {
          const Icon = resolveIcon(card.icon);
          return (
            <Reveal key={card.id} delay={i * 0.06}>
              <a
                href={card.url}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col justify-between border p-6 transition-colors duration-500 md:p-8"
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
                <div className="flex items-start justify-between gap-4">
                  <Icon
                    size={30}
                    style={{ color: "var(--grey-hi)" }}
                    className="transition-colors duration-500 group-hover:!text-white"
                  />
                  <ArrowUpRight
                    size={16}
                    style={{ color: "var(--grey)" }}
                    className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </div>

                <div className="mt-10">
                  <h3
                    className="display-tight text-[clamp(1.8rem,4vw,2.6rem)]"
                    style={{ color: "var(--white)" }}
                  >
                    {card.label}
                  </h3>
                  <p className="slug mt-2 normal-case">{card.handle}</p>
                  <p
                    className="mt-4 max-w-[36ch] text-[1.02rem] leading-[1.65]"
                    style={{ color: "var(--silver)" }}
                  >
                    {card.note}
                  </p>
                </div>
              </a>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
