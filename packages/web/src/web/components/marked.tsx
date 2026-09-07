import { Fragment, type ReactNode } from "react";

/**
 * Accent highlighting for prose.
 *
 * Content is edited from /studio, so highlights have to be something the owner
 * can type. Wrap a phrase in double asterisks and it renders in the accent
 * colour:
 *
 *     "I run **growth at Runable** and write the code around it."
 *
 * Anything not wrapped renders untouched. Unclosed markers are left as text
 * rather than swallowing the rest of the paragraph.
 */

const PATTERN = /\*\*([^*]+)\*\*/g;

export function marked(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  PATTERN.lastIndex = 0;
  while ((match = PATTERN.exec(text)) !== null) {
    if (match.index > cursor) out.push(text.slice(cursor, match.index));
    out.push(
      <span className="mark" key={`${match.index}-${match[1].slice(0, 12)}`}>
        {match[1]}
      </span>,
    );
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

/** Component form, for when a string lands straight in JSX. */
export function Marked({ children }: { children: string }) {
  return <Fragment>{marked(children)}</Fragment>;
}

/** Strips the markers, for places that need plain text (alt, title, keys). */
export const unmark = (text: string) => text.replace(/\*\*/g, "");
