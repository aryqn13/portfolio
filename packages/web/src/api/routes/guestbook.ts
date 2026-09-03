import { z } from "zod";
import { desc, eq, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";

const nameSchema = z
  .string()
  .trim()
  .min(1, "Add a name")
  .max(40, "Keep the name under 40 characters");

const messageSchema = z
  .string()
  .trim()
  .min(2, "Say a little more")
  .max(280, "Keep it under 280 characters");

/** Naive per-process rate limit — one entry per IP every 30 seconds. */
const lastPost = new Map<string, number>();

export const guestbook = {
  list: base.handler(async () => {
    const rows = await db
      .select()
      .from(schema.guestbook)
      .where(eq(schema.guestbook.hidden, false))
      .orderBy(desc(schema.guestbook.createdAt))
      .limit(50);

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      message: row.message,
      link: row.link,
      createdAt: row.createdAt,
    }));
  }),

  sign: base
    .input(
      z.object({
        name: nameSchema,
        message: messageSchema,
        link: z
          .string()
          .trim()
          .max(120)
          .optional()
          .transform((v) => (v ? v : undefined)),
      }),
    )
    .handler(async ({ input, context }) => {
      const ip =
        context.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown";
      const previous = lastPost.get(ip) ?? 0;
      if (Date.now() - previous < 30_000)
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: "Give it half a minute before signing again.",
        });
      lastPost.set(ip, Date.now());

      const [row] = await db
        .insert(schema.guestbook)
        .values({
          name: input.name,
          message: input.message,
          link: input.link ?? null,
        })
        .returning();

      return {
        id: row.id,
        name: row.name,
        message: row.message,
        link: row.link,
        createdAt: row.createdAt,
      };
    }),
};

export const counters = {
  views: base.handler(async () => {
    const [row] = await db
      .select()
      .from(schema.counters)
      .where(eq(schema.counters.key, "views"));
    return { views: row?.value ?? 0 };
  }),

  visit: base.handler(async () => {
    const [row] = await db
      .insert(schema.counters)
      .values({ key: "views", value: 1 })
      .onConflictDoUpdate({
        target: schema.counters.key,
        set: { value: sql`${schema.counters.value} + 1` },
      })
      .returning();
    return { views: row?.value ?? 1 };
  }),
};
