import { base } from "../__core/app";
import { cached, fetchJson } from "../lib/cache";

const USER = "aryqn13";
const TTL = 60 * 60 * 1000; // 1 hour

interface GhUser {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
  avatar_url: string;
}

interface GhRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  topics?: string[];
}

const headers = () => {
  const token = process.env.GITHUB_TOKEN;
  return token ? { authorization: `Bearer ${token}` } : undefined;
};


interface ContributionsResponse {
  total: Record<string, number>;
  contributions: { date: string; count: number; level: number }[];
}

/** Contribution calendar, sourced from a public mirror of the GitHub graph. */
const contributionsProcedure = base.handler(async () => {
  try {
    return await cached(`github:contrib:${USER}`, 6 * 60 * 60 * 1000, async () => {
      const data = await fetchJson<ContributionsResponse>(
        `https://github-contributions-api.jogruber.de/v4/${USER}?y=last`,
      );

      const days = data.contributions.map((d) => ({
        date: d.date,
        count: d.count,
        level: d.level,
      }));

      let best = 0;
      let streak = 0;
      let current = 0;
      for (const day of days) {
        if (day.count > 0) {
          streak += 1;
          if (streak > best) best = streak;
        } else {
          streak = 0;
        }
      }
      for (let i = days.length - 1; i >= 0; i -= 1) {
        if (days[i].count > 0) current += 1;
        else break;
      }

      return {
        ok: true as const,
        total: data.total.lastYear ?? Object.values(data.total)[0] ?? 0,
        longestStreak: best,
        currentStreak: current,
        activeDays: days.filter((d) => d.count > 0).length,
        days,
      };
    });
  } catch {
    return {
      ok: false as const,
      total: 0,
      longestStreak: 0,
      currentStreak: 0,
      activeDays: 0,
      days: [] as { date: string; count: number; level: number }[],
    };
  }
});

export const github = {
  contributions: contributionsProcedure,
  overview: base.handler(async () => {
    try {
      return await cached(`github:overview:${USER}`, TTL, async () => {
        const [user, repos] = await Promise.all([
          fetchJson<GhUser>(`https://api.github.com/users/${USER}`, {
            headers: headers(),
          }),
          fetchJson<GhRepo[]>(
            `https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`,
            { headers: headers() },
          ),
        ]);

        const owned = repos.filter((r) => !r.fork && !r.archived);
        const languages = new Map<string, number>();
        for (const repo of owned) {
          if (repo.language)
            languages.set(repo.language, (languages.get(repo.language) ?? 0) + 1);
        }

        return {
          ok: true as const,
          user: {
            login: user.login,
            name: user.name,
            bio: user.bio,
            location: user.location,
            url: user.html_url,
            avatar: user.avatar_url,
            publicRepos: user.public_repos,
            followers: user.followers,
            since: user.created_at,
          },
          stars: owned.reduce((sum, r) => sum + r.stargazers_count, 0),
          languages: [...languages.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name, count]) => ({ name, count })),
          repos: owned.slice(0, 8).map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            url: r.html_url,
            language: r.language,
            stars: r.stargazers_count,
            forks: r.forks_count,
            pushedAt: r.pushed_at,
            topics: r.topics ?? [],
          })),
        };
      });
    } catch {
      return {
        ok: false as const,
        user: null,
        stars: 0,
        languages: [] as { name: string; count: number }[],
        repos: [] as {
          id: number;
          name: string;
          description: string | null;
          url: string;
          language: string | null;
          stars: number;
          forks: number;
          pushedAt: string;
          topics: string[];
        }[],
      };
    }
  }),
};
