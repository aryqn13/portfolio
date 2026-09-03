import { Heart, Repeat, ArrowUpRight, Film as FilmIcon } from "lucide-react";
import { SiLetterboxd } from "react-icons/si";
import { Section } from "../section";
import { Reveal } from "../reveal";
import { useFilms } from "../../queries/feeds";
import { useContent } from "../../context/content";

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

const Stars = ({ rating }: { rating: number }) => (
  <span className="text-sm" style={{ color: "var(--white)" }}>
    {"★".repeat(Math.floor(rating))}
    {rating % 1 ? "½" : ""}
  </span>
);

function PosterSkeleton() {
  return (
    <div
      className="aspect-[2/3] w-full animate-pulse"
      style={{ background: "var(--ink-3)" }}
    />
  );
}

/** Greyscale at rest, colour on hover. Same rule as the portrait. */
const posterHover = {
  onMouseEnter: (e: React.MouseEvent<HTMLImageElement>) => {
    e.currentTarget.style.filter = "grayscale(0) contrast(1.02)";
  },
  onMouseLeave: (e: React.MouseEvent<HTMLImageElement>) => {
    e.currentTarget.style.filter = "grayscale(1) contrast(1.06) brightness(0.95)";
  },
};

const REST_FILTER = "grayscale(1) contrast(1.06) brightness(0.95)";

export function Films() {
  const films = useFilms();
  const { favouriteFilms, filmsIntro, profile } = useContent();
  const data = films.data;
  const list = data?.films ?? [];
  const hero = list[0];
  const rest = list.slice(1, 11);
  const profileUrl =
    data?.profileUrl ?? `https://letterboxd.com/${profile.letterboxdUser}/`;

  return (
    <Section
      id="films"
      reel="01"
      slug="Films"
      title="Roughly a film a week."
      lead={filmsIntro}
    >
      {/* The permanent four. These do not change with what I watched last night. */}
      <Reveal>
        <div className="flex items-baseline gap-4">
          <span className="slug" style={{ color: "var(--white)" }}>
            The permanent four
          </span>
          <span className="hairline mb-1 flex-1" />
        </div>

        <div className="mt-5 grid gap-px sm:grid-cols-2 lg:grid-cols-4">
          {favouriteFilms.map((film, i) => (
            <Reveal key={film.title} delay={i * 0.05}>
              <a
                href={film.url}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col border p-5 transition-colors duration-500"
                style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--edge-hi)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--edge)";
                }}
              >
                {film.poster ? (
                  <img
                    src={film.poster}
                    alt={film.title}
                    loading="lazy"
                    className="mb-4 aspect-[16/10] w-full object-cover transition-[filter] duration-700"
                    style={{ filter: REST_FILTER, border: "1px solid var(--edge)" }}
                    {...posterHover}
                  />
                ) : null}

                <span className="slug">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4
                  className="display mt-2 text-[1.25rem] leading-tight"
                  style={{ color: "var(--white)" }}
                >
                  {film.title}
                </h4>
                <p className="slug mt-1.5">
                  {film.director}, {film.year}
                </p>
                <p
                  className="mt-3 flex-1 text-[0.98rem] leading-[1.65] italic"
                  style={{ color: "var(--silver)" }}
                >
                  {film.note}
                </p>
              </a>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <div className="mt-14">
        <Reveal>
          <div className="flex items-baseline gap-4">
            <span className="slug" style={{ color: "var(--white)" }}>
              Recently watched
            </span>
            <span className="hairline mb-1 flex-1" />
          </div>
        </Reveal>

        {films.isLoading ? (
          <div className="mt-5 grid grid-cols-3 gap-4 md:grid-cols-5">
            {Array.from({ length: 5 }, (_, i) => (
              <PosterSkeleton key={i} />
            ))}
          </div>
        ) : !list.length ? (
          <div
            className="mt-5 flex items-center gap-3 border p-6"
            style={{ borderColor: "var(--edge)" }}
          >
            <FilmIcon size={16} style={{ color: "var(--grey)" }} />
            <p style={{ color: "var(--silver)" }}>
              Letterboxd is not answering right now.{" "}
              <a
                href={profileUrl}
                target="_blank"
                rel="noreferrer"
                className="link-underline"
                style={{ color: "var(--white)" }}
              >
                See the profile directly
              </a>
              .
            </p>
          </div>
        ) : (
          <>
            {hero ? (
              <Reveal>
                <a
                  href={hero.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-5 grid gap-6 border p-5 transition-colors duration-500 md:grid-cols-12 md:p-7"
                  style={{
                    borderColor: "var(--edge)",
                    background: "var(--ink-2)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--edge-hi)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--edge)";
                  }}
                >
                  <div className="md:col-span-3">
                    {hero.poster ? (
                      <img
                        src={hero.poster}
                        alt={hero.title}
                        loading="lazy"
                        className="w-full max-w-[220px] transition-[filter] duration-700"
                        style={{
                          border: "1px solid var(--edge)",
                          filter: REST_FILTER,
                        }}
                        {...posterHover}
                      />
                    ) : (
                      <PosterSkeleton />
                    )}
                  </div>

                  <div className="md:col-span-9">
                    <span className="slug" style={{ color: "var(--white)" }}>
                      Latest watch
                    </span>
                    <h3
                      className="display mt-3 text-[clamp(1.7rem,3.4vw,2.5rem)]"
                      style={{ color: "var(--white)" }}
                    >
                      {hero.title}{" "}
                      {hero.year ? (
                        <span style={{ color: "var(--grey)" }}>{hero.year}</span>
                      ) : null}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      {hero.rating ? <Stars rating={hero.rating} /> : null}
                      {hero.liked ? (
                        <Heart
                          size={14}
                          fill="var(--white)"
                          style={{ color: "var(--white)" }}
                        />
                      ) : null}
                      {hero.rewatch ? (
                        <span className="slug flex items-center gap-1.5">
                          <Repeat size={12} /> Rewatch
                        </span>
                      ) : null}
                      <span className="slug">{fmtDate(hero.watchedDate)}</span>
                    </div>

                    {hero.review ? (
                      <p
                        className="mt-5 max-w-[62ch] whitespace-pre-line italic"
                        style={{ color: "var(--silver)" }}
                      >
                        “{hero.review}”
                      </p>
                    ) : null}

                    <span className="slug mt-6 inline-flex items-center gap-2">
                      Read on Letterboxd <ArrowUpRight size={13} />
                    </span>
                  </div>
                </a>
              </Reveal>
            ) : null}

            <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
              {rest.map((film, i) => (
                <Reveal key={film.id} delay={i * 0.03}>
                  <a
                    href={film.url}
                    target="_blank"
                    rel="noreferrer"
                    title={
                      film.review
                        ? `${film.title}, ${film.review.slice(0, 120)}`
                        : film.title
                    }
                    className="group block"
                  >
                    <div className="relative overflow-hidden">
                      {film.poster ? (
                        <img
                          src={film.poster}
                          alt={film.title}
                          loading="lazy"
                          className="aspect-[2/3] w-full object-cover transition-[filter] duration-700"
                          style={{
                            border: "1px solid var(--edge)",
                            filter: REST_FILTER,
                          }}
                          {...posterHover}
                        />
                      ) : (
                        <PosterSkeleton />
                      )}
                      {film.liked ? (
                        <Heart
                          size={12}
                          fill="var(--white)"
                          className="absolute right-2 top-2"
                          style={{ color: "var(--white)" }}
                        />
                      ) : null}
                    </div>
                    <p
                      className="mt-2 truncate text-xs"
                      style={{ color: "var(--silver)" }}
                    >
                      {film.title}
                    </p>
                    <p className="slug mt-0.5">{film.year}</p>
                  </a>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1}>
              <a
                href={profileUrl}
                target="_blank"
                rel="noreferrer"
                className="slug link-underline mt-8 inline-flex items-center gap-2.5"
                style={{ color: "var(--silver)" }}
              >
                <SiLetterboxd size={15} /> letterboxd.com/
                {data?.user ?? profile.letterboxdUser}
                <ArrowUpRight size={13} />
              </a>
            </Reveal>
          </>
        )}
      </div>
    </Section>
  );
}
