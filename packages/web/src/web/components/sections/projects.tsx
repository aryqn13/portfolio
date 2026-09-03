import { ArrowUpRight, Star, GitFork } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { Section, Tag } from "../section";
import { Reveal } from "../reveal";
import { useContent } from "../../context/content";
import { useGithub } from "../../queries/feeds";

export function Projects() {
  const { projects, profile } = useContent();
  const github = useGithub();
  const repos = github.data?.repos ?? [];

  const repoFor = (name?: string) =>
    name ? repos.find((r) => r.name.toLowerCase() === name.toLowerCase()) : undefined;

  return (
    <Section
      id="projects"
      reel="02"
      slug="Built"
      title="Things I built to understand them."
      lead="No frameworks doing the thinking. Each of these exists because I refused to keep using a concept I could not rebuild."
    >
      <div className="grid gap-px md:grid-cols-3">
        {projects.map((project, i) => {
          const repo = repoFor(project.repo);
          const href = repo?.url ?? (project.repo
            ? `https://github.com/${profile.githubUser}/${project.repo}`
            : `https://github.com/${profile.githubUser}`);

          return (
            <Reveal key={project.name} delay={i * 0.06}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col border p-6 transition-colors duration-500"
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
                  <h3
                    className="display text-[1.4rem] leading-tight"
                    style={{ color: "var(--white)" }}
                  >
                    {project.name}
                  </h3>
                  <ArrowUpRight
                    size={16}
                    style={{ color: "var(--grey)" }}
                    className="shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </div>

                <p className="mt-3 text-[1.02rem]" style={{ color: "var(--white)" }}>
                  {project.blurb}
                </p>
                <p
                  className="mt-3 flex-1 text-[0.98rem] leading-[1.7]"
                  style={{ color: "var(--silver)" }}
                >
                  {project.detail}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <Tag key={item}>{item}</Tag>
                  ))}
                </div>

                {repo ? (
                  <div
                    className="mt-5 flex items-center gap-4 border-t pt-4"
                    style={{ borderColor: "var(--edge)" }}
                  >
                    <span className="slug flex items-center gap-1.5">
                      <SiGithub size={11} /> {repo.name}
                    </span>
                    <span className="slug flex items-center gap-1.5">
                      <Star size={11} /> {repo.stars}
                    </span>
                    <span className="slug flex items-center gap-1.5">
                      <GitFork size={11} /> {repo.forks}
                    </span>
                  </div>
                ) : null}
              </a>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
