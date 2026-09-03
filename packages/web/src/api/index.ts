import type { RouterClient } from "@orpc/server";
import { createApp } from "./__core/app";
import { ping } from "./routes/ping";
import { letterboxd } from "./routes/letterboxd";
import { github } from "./routes/github";
import { guestbook, counters } from "./routes/guestbook";
import { content, admin } from "./routes/content";

// API features are oRPC procedures, one file per feature in ./routes/,
// composed into this router and typed end to end via the clients.
export const router = {
  ping,
  letterboxd,
  github,
  guestbook,
  counters,
  content,
  admin,
};

export type AppRouter = typeof router;
/** Typed client for the router, used by the web and mobile api clients. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);

export default app;
