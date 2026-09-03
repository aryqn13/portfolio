import { base } from "../__core/app";
import { cached, fetchText } from "../lib/cache";

const LETTERBOXD_USER = "aryqn13";
const TTL = 30 * 60 * 1000; // 30 min

export interface Film {
  id: string;
  title: string;
  year: string | null;
  url: string;
  poster: string | null;
  watchedDate: string | null;
  rating: number | null;
  liked: boolean;
  rewatch: boolean;
  review: string | null;
  isList: boolean;
}

const tag = (block: string, name: string): string | null => {
  const m = block.match(
    new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"),
  );
  return m ? m[1].trim() : null;
};

const decode = (s: string): string =>
  s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

function parseFeed(xml: string): Film[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  return items.map((item, index) => {
    const rawTitle = tag(item, "title") ?? "";
    const filmTitle = tag(item, "letterboxd:filmTitle");
    const year = tag(item, "letterboxd:filmYear");
    const description = tag(item, "description") ?? "";
    const cdata = description
      .replace(/^<!\[CDATA\[/, "")
      .replace(/\]\]>$/, "")
      .trim();

    const poster = cdata.match(/<img src="([^"]+)"/)?.[1] ?? null;
    const starsFromTitle = rawTitle.match(/★+½?|½/)?.[0] ?? null;
    const ratingTag = tag(item, "letterboxd:memberRating");

    let rating: number | null = null;
    if (ratingTag) rating = Number(ratingTag);
    else if (starsFromTitle) {
      rating =
        (starsFromTitle.match(/★/g)?.length ?? 0) +
        (starsFromTitle.includes("½") ? 0.5 : 0);
    }

    // Drop the poster paragraph, then the "Watched on …" boilerplate.
    const body = decode(cdata.replace(/<p>\s*<img[^>]*>\s*<\/p>/i, ""));
    const review =
      body && !/^Watched on [A-Z][a-z]+day/.test(body) ? body : null;

    return {
      id: tag(item, "guid") ?? `film-${index}`,
      title: filmTitle ?? rawTitle.replace(/,\s*\d{4}.*$/, ""),
      year,
      url: tag(item, "link") ?? `https://letterboxd.com/${LETTERBOXD_USER}/`,
      poster: poster ? poster.replace(/&amp;/g, "&") : null,
      watchedDate: tag(item, "letterboxd:watchedDate"),
      rating,
      liked: tag(item, "letterboxd:memberLike") === "Yes",
      rewatch: tag(item, "letterboxd:rewatch") === "Yes",
      review,
      isList: !filmTitle,
    };
  });
}

export const letterboxd = {
  recent: base.handler(async () => {
    try {
      const films = await cached("letterboxd:rss", TTL, async () => {
        const xml = await fetchText(
          `https://letterboxd.com/${LETTERBOXD_USER}/rss/`,
        );
        return parseFeed(xml).filter((f) => !f.isList);
      });

      return {
        ok: true as const,
        user: LETTERBOXD_USER,
        profileUrl: `https://letterboxd.com/${LETTERBOXD_USER}/`,
        films: films.slice(0, 12),
        totalLogged: films.length,
      };
    } catch {
      return {
        ok: false as const,
        user: LETTERBOXD_USER,
        profileUrl: `https://letterboxd.com/${LETTERBOXD_USER}/`,
        films: [] as Film[],
        totalLogged: 0,
      };
    }
  }),
};
