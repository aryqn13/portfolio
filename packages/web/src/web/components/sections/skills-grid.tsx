import { Reveal } from "../reveal";
import { resolveSkillIcon } from "../../config/skill-icons";
import type { SkillColumn } from "../../config/content";

/**
 * The skill grid, shared by the home page and /work.
 *
 * Same component both places so the two never drift. `compact` drops the group
 * titles and tightens the tiles, which is what the home page wants: a fast
 * read of capability, not a taxonomy.
 */

export function SkillTile({ name, compact }: { name: string; compact?: boolean }) {
  const Icon = resolveSkillIcon(name);

  return (
    <span
      className={`group/tile flex items-center gap-2.5 border transition-colors ${
        compact ? "px-2.5 py-2" : "px-3 py-2.5"
      }`}
      style={{ borderColor: "var(--edge)", background: "var(--ink-3)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--edge-hi)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--edge)";
      }}
    >
      <Icon
        size={compact ? 14 : 16}
        className="shrink-0 transition-colors duration-300 group-hover/tile:text-[var(--mark)]"
      />
      <span
        className={compact ? "text-[0.86rem]" : "text-[0.94rem]"}
        style={{ color: "var(--silver)" }}
      >
        {name}
      </span>
    </span>
  );
}

export function SkillGrid({
  column,
  delay = 0,
  compact,
  bare,
}: {
  column: SkillColumn;
  delay?: number;
  /** Tighter tiles, no group titles. Used on the home page. */
  compact?: boolean;
  /** No surrounding card. Used when the parent already draws one. */
  bare?: boolean;
}) {
  const body = (
    <>
      {!bare ? (
        <h3
          className={`display ${compact ? "text-[1.05rem]" : "text-[1.3rem]"}`}
          style={{ color: "var(--white)" }}
        >
          {column.label}
        </h3>
      ) : null}

      {compact ? (
        <div className={`flex flex-wrap gap-1.5 ${bare ? "" : "mt-4"}`}>
          {column.groups
            .flatMap((group) => group.items)
            .map((item) => (
              <SkillTile key={item} name={item} compact />
            ))}
        </div>
      ) : (
        <div className={`space-y-5 ${bare ? "" : "mt-6"}`}>
          {column.groups.map((group) => (
            <div key={group.title}>
              <span className="slug">{group.title}</span>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <SkillTile key={item} name={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (bare) return body;

  return (
    <Reveal delay={delay}>
      <div
        className={`h-full border ${compact ? "p-5" : "p-6"}`}
        style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
      >
        {body}
      </div>
    </Reveal>
  );
}
