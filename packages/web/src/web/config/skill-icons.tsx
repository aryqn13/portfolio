import type { ComponentType } from "react";
import {
  SiTypescript,
  SiJavascript,
  SiPython,
  SiHtml5,
  SiReact,
  SiTailwindcss,
  SiFastapi,
  SiPostgresql,
  SiSqlalchemy,
  SiSqlite,
  SiPytorch,
  SiScikitlearn,
  SiHuggingface,
  SiNumpy,
  SiPandas,
  SiGithub,
  SiGnubash,
  SiNpm,
  SiUv,
  SiFigma,
  SiNotion,
  SiLatex,
  SiReddit,
  SiDiscord,
} from "react-icons/si";
import {
  Users,
  Megaphone,
  ShieldCheck,
  MessagesSquare,
  Workflow,
  Handshake,
  CalendarDays,
  Search,
  Target,
  Crosshair,
  LineChart,
  Database,
  Network,
  Sparkles,
} from "lucide-react";

/**
 * SKILL ICONS.
 *
 * The content model keeps skills as plain strings so /studio stays a text
 * editor and saved overrides never break. Icons are resolved here by the
 * lowercased skill name.
 *
 * Tech gets its real brand mark. Growth work has no brand marks, so it gets
 * drawn monoline icons from lucide, which sit at the same weight as the Simple
 * Icons glyphs and keep the grid one consistent texture rather than two.
 *
 * Adding a skill: add the string in content.ts (or /studio), then add one line
 * here. Anything unmatched falls back to a generic glyph, so a new skill always
 * renders, just without its own mark.
 */

type Icon = ComponentType<{ size?: number; className?: string }>;

const REGISTRY: Record<string, Icon> = {
  // ── Growth, drawn ────────────────────────────────────────────────
  "reddit marketing": SiReddit,
  "subreddit dynamics": SiReddit,
  "community-led growth": Users,
  "community led growth": Users,
  "organic product distribution": Megaphone,
  "organic distribution": Megaphone,
  "spam-safe content strategy": ShieldCheck,
  "content operations": Workflow,
  "content ops": Workflow,
  "workflow design": Workflow,
  "affiliate programs": Handshake,
  "creator relations": MessagesSquare,
  "event operations": CalendarDays,
  "audience research": Search,
  positioning: Target,
  "icp mapping": Crosshair,
  reporting: LineChart,
  discord: SiDiscord,

  // ── Engineering, branded ─────────────────────────────────────────
  typescript: SiTypescript,
  javascript: SiJavascript,
  python: SiPython,
  sql: Database,
  "html/css": SiHtml5,
  html: SiHtml5,
  react: SiReact,
  "tailwind css": SiTailwindcss,
  tailwind: SiTailwindcss,
  fastapi: SiFastapi,
  "rest apis": Network,
  postgresql: SiPostgresql,
  postgres: SiPostgresql,
  sqlalchemy: SiSqlalchemy,
  sqlite: SiSqlite,
  pytorch: SiPytorch,
  "scikit-learn": SiScikitlearn,
  "hugging face": SiHuggingface,
  numpy: SiNumpy,
  pandas: SiPandas,
  "git / github": SiGithub,
  git: SiGithub,
  github: SiGithub,
  bash: SiGnubash,
  npm: SiNpm,
  uv: SiUv,
  figma: SiFigma,
  notion: SiNotion,
  latex: SiLatex,
};

export const resolveSkillIcon = (name: string): Icon =>
  REGISTRY[name.trim().toLowerCase()] ?? Sparkles;
