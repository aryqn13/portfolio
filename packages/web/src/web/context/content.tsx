import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import { defaultContent } from "../config/content";
import type { SiteContent } from "../config/content";
import { defaultSocials } from "../config/socials";
import type { Social } from "../config/socials";

export interface Site extends SiteContent {
  socials: Social[];
}

const base: Site = { ...defaultContent, socials: defaultSocials };

const ContentContext = createContext<Site>(base);

/**
 * Merges studio overrides on top of the compiled defaults, one block at a time.
 * A block is replaced wholesale, so a broken edit can only affect its own block.
 */
function merge(overrides: Record<string, unknown> | undefined): Site {
  if (!overrides) return base;
  const next = { ...base } as Record<string, unknown>;

  for (const [key, value] of Object.entries(overrides)) {
    if (value === null || value === undefined) continue;
    if (!(key in next)) continue;

    const current = next[key];
    if (Array.isArray(current) && !Array.isArray(value)) continue;
    if (
      !Array.isArray(current) &&
      typeof current === "object" &&
      (typeof value !== "object" || Array.isArray(value))
    )
      continue;

    next[key] =
      !Array.isArray(current) && typeof current === "object"
        ? { ...(current as object), ...(value as object) }
        : value;
  }

  return next as unknown as Site;
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const query = useQuery(
    orpc.content.get.queryOptions({ staleTime: 60_000 }),
  );

  const value = useMemo(() => merge(query.data?.overrides), [query.data]);

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}

export const useContent = () => useContext(ContentContext);
