import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { Reveal } from "./reveal";
import { useContributions } from "../queries/feeds";
import { useContent } from "../context/content";

/** Five steps of grey. Level 0 is a hole in the grid, not a colour. */
const LEVELS = [
  "var(--ink-3)",
  "#3d3d3d",
  "#6a6a6a",
  "#9c9c9c",
  "var(--white)",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Day {
  date: string;
  count: number;
  level: number;
}

/** Splits the flat day list into calendar weeks, Sunday first. */
function toWeeks(days: Day[]): (Day | null)[][] {
  if (!days.length) return [];
  const weeks: (Day | null)[][] = [];
  let week: (Day | null)[] = [];

  const firstDow = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  for (let i = 0; i < firstDow; i += 1) week.push(null);

  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
}

export function Contributions() {
  const query = useContributions();
  const { profile } = useContent();
  const data = query.data;

  const weeks = useMemo(() => toWeeks(data?.days ?? []), [data]);

  // One label per week where the month changes.
  const monthLabels = useMemo(() => {
    const labels: { index: number; label: string }[] = [];
    let last = -1;
    weeks.forEach((week, index) => {
      const first = week.find((d) => d);
      if (!first) return;
      const month = new Date(`${first.date}T00:00:00Z`).getUTCMonth();
      if (month !== last) {
        labels.push({ index, label: MONTHS[month] });
        last = month;
      }
    });
    return labels;
  }, [weeks]);

  const stats = [
    { label: "Contributions", value: data?.total ?? 0 },
    { label: "Active days", value: data?.activeDays ?? 0 },
    { label: "Longest streak", value: data?.longestStreak ?? 0 },
    { label: "Current streak", value: data?.currentStreak ?? 0 },
  ];

  return (
    <Reveal>
      <div
        className="border p-5 md:p-7"
        style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <span className="slug" style={{ color: "var(--white)" }}>
              Commit record
            </span>
            <p className="mt-2 text-sm" style={{ color: "var(--silver)" }}>
              Last twelve months, pulled live from GitHub.
            </p>
          </div>
          <a
            href={`https://github.com/${profile.githubUser}`}
            target="_blank"
            rel="noreferrer"
            className="slug link-underline inline-flex items-center gap-2"
            style={{ color: "var(--silver)" }}
          >
            <SiGithub size={13} /> {profile.githubUser} <ArrowUpRight size={11} />
          </a>
        </div>

        {query.isLoading ? (
          <div
            className="mt-6 h-[120px] w-full animate-pulse"
            style={{ background: "var(--ink-3)" }}
          />
        ) : !weeks.length ? (
          <p className="mt-6 text-sm" style={{ color: "var(--grey-hi)" }}>
            GitHub is not answering right now. The profile link above still works.
          </p>
        ) : (
          <>
            <div className="mt-6 overflow-x-auto pb-1">
              <div className="inline-block min-w-full">
                <div className="flex gap-[3px]">
                  {weeks.map((week, wi) => {
                    const label = monthLabels.find((m) => m.index === wi);
                    return (
                      <div key={wi} className="w-[13px] shrink-0">
                        <span
                          className="mb-1 block h-3 font-mono text-[9px] tracking-wider"
                          style={{ color: "var(--grey)" }}
                        >
                          {label ? label.label : ""}
                        </span>
                        <div className="flex flex-col gap-[3px]">
                          {week.map((day, di) =>
                            day ? (
                              <span
                                key={day.date}
                                title={`${day.count} on ${day.date}`}
                                className="block h-[13px] w-[13px]"
                                style={{
                                  background: LEVELS[Math.min(day.level, 4)],
                                  outline:
                                    day.level === 0
                                      ? "1px solid rgba(255,255,255,0.03)"
                                      : "none",
                                }}
                              />
                            ) : (
                              <span key={`${wi}-${di}`} className="block h-[13px] w-[13px]" />
                            ),
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p
                      className="display text-[1.5rem]"
                      style={{ color: "var(--white)" }}
                    >
                      {stat.value}
                    </p>
                    <span className="slug">{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="slug mr-1">Less</span>
                {LEVELS.map((level) => (
                  <span
                    key={level}
                    className="block h-[13px] w-[13px]"
                    style={{ background: level, border: "1px solid var(--edge)" }}
                  />
                ))}
                <span className="slug ml-1">More</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Reveal>
  );
}
