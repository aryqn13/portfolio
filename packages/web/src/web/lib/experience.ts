import type { Experience } from "../config/content";

/**
 * Consecutive entries at the same employer collapse into one group so a
 * second stint doesn't print the company name twice. Only the newest role in
 * a group (`group.jobs[0]`) is ever rendered — a "2 roles" stepped list read
 * as clutter, and the earlier role's story (an affiliate contract that
 * converted into the internship) is already implied by the one that's
 * shown. Grouping happens here at render rather than in the content model,
 * so `experience` stays a flat list that /studio can still edit as plain
 * JSON, and adding a third Runable role needs no code change.
 */
export type ExperienceGroup = { company: string; jobs: Experience[] };

export function groupByCompany(experience: Experience[]): ExperienceGroup[] {
  const groups: ExperienceGroup[] = [];
  for (const job of experience) {
    const last = groups[groups.length - 1];
    if (last && last.company === job.company) last.jobs.push(job);
    else groups.push({ company: job.company, jobs: [job] });
  }
  return groups;
}

export const KIND_LABEL: Record<string, string> = {
  growth: "Growth",
  engineering: "Engineering",
  community: "Community",
};
