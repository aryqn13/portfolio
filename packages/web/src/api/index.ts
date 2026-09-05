import type { RouterClient } from "@orpc/server";
import { createApp } from "./__core/app";
import { ping } from "./routes/ping";
import { letterboxd } from "./routes/letterboxd";
import { github } from "./routes/github";
import { guestbook, counters } from "./routes/guestbook";
import { content, admin } from "./routes/content";
import { upload } from "./routes/upload";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3, bucket } from "./lib/s3";

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
  upload,
};

export type AppRouter = typeof router;
/** Typed client for the router, used by the web and mobile api clients. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);

/**
 * Reads an uploaded photograph back out of Tigris. Streaming, so it is a plain
 * HTTP route rather than a procedure. Stored content keeps this stable path
 * instead of a presigned URL, which would expire.
 */
app.get("/api/files/*", async (c) => {
  const key = c.req.path.replace(/^\/api\/files\//, "");
  if (!key || key.includes("..")) return c.json({ error: "Bad key" }, 400);

  try {
    const object = await s3.send(
      new GetObjectCommand({ Bucket: bucket(), Key: key }),
    );
    if (!object.Body) return c.json({ error: "Not found" }, 404);

    return c.newResponse(object.Body.transformToWebStream(), 200, {
      "Content-Type": object.ContentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    });
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

export default app;
