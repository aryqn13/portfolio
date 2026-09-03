import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/** Guestbook entries, no login, lightly moderated by a hidden flag. */
export const guestbook = sqliteTable("guestbook", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Single-row counters keyed by name, e.g. "views". */
export const counters = sqliteTable("counters", {
  key: text("key").primaryKey(),
  value: integer("value").notNull().default(0),
});

/**
 * Editable site content. One row per block (profile, bio, experience, ...),
 * each holding a JSON payload that overrides the compiled defaults.
 * Written only by the authenticated studio.
 */
export const content = sqliteTable("content", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
