import { z } from "zod";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import {
  adminOnly,
  checkPassword,
  issueToken,
  verifyToken,
} from "../lib/admin-auth";

/**
 * Content overrides. Each row is one editable block; the client merges these
 * over its compiled defaults, so a missing or malformed row simply falls back.
 */

const BLOCKS = [
  "profile",
  "positioning",
  "bio",
  "quickFacts",
  "education",
  "experience",
  "projects",
  "skills",
  "sharpening",
  "favouriteFilms",
  "filmsIntro",
  "musicIntro",
  "writingIntro",
  "writing",
  "resumes",
  "guestbookIntro",
  "socials",
] as const;

const blockSchema = z.enum(BLOCKS);

export const content = {
  /** Public: every stored override, keyed by block. */
  get: base.handler(async () => {
    const rows = await db.select().from(schema.content);
    const overrides: Record<string, unknown> = {};

    for (const row of rows) {
      try {
        overrides[row.key] = JSON.parse(row.value);
      } catch {
        // Ignore an unparseable row rather than breaking the whole site.
      }
    }

    return { overrides };
  }),

  /** Owner only: replace one block. */
  save: adminOnly
    .input(z.object({ key: blockSchema, value: z.string() }))
    .handler(async ({ input }) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(input.value);
      } catch {
        throw new ORPCError("BAD_REQUEST", {
          message: "That is not valid JSON.",
        });
      }

      await db
        .insert(schema.content)
        .values({
          key: input.key,
          value: JSON.stringify(parsed),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.content.key,
          set: { value: JSON.stringify(parsed), updatedAt: new Date() },
        });

      return { key: input.key, saved: true as const };
    }),

  /** Owner only: drop an override so the compiled default takes over again. */
  reset: adminOnly
    .input(z.object({ key: blockSchema }))
    .handler(async ({ input }) => {
      await db.delete(schema.content).where(eq(schema.content.key, input.key));
      return { key: input.key, reset: true as const };
    }),
};

export const admin = {
  login: base
    .input(z.object({ password: z.string().min(1) }))
    .handler(async ({ input }) => {
      // Constant-ish delay to blunt trivial brute forcing.
      await new Promise((resolve) => setTimeout(resolve, 350));

      if (!checkPassword(input.password))
        throw new ORPCError("UNAUTHORIZED", { message: "Wrong password." });

      return issueToken();
    }),

  session: base
    .input(z.object({ token: z.string().optional() }))
    .handler(({ input }) => ({ valid: verifyToken(input.token) })),

  /** Owner only: hide or restore a guestbook entry. */
  moderate: adminOnly
    .input(z.object({ id: z.number(), hidden: z.boolean() }))
    .handler(async ({ input }) => {
      await db
        .update(schema.guestbook)
        .set({ hidden: input.hidden })
        .where(eq(schema.guestbook.id, input.id));
      return { id: input.id, hidden: input.hidden };
    }),

  /** Owner only: guestbook including hidden rows. */
  guestbookAll: adminOnly.handler(async () => {
    const rows = await db.select().from(schema.guestbook);
    return rows
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((row) => ({
        id: row.id,
        name: row.name,
        message: row.message,
        link: row.link,
        hidden: row.hidden,
        createdAt: row.createdAt,
      }));
  }),
};
