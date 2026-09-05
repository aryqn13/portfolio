import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { adminOnly } from "../lib/admin-auth";
import { s3, bucket } from "../lib/s3";

/**
 * Studio uploads. The browser asks for a presigned PUT, sends the file straight
 * to Tigris, and stores the returned path in the content block. Files are read
 * back through the /api/files/* route, so the stored path never expires.
 *
 * Owner only: an anonymous visitor cannot mint an upload URL.
 */

const ALLOWED = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
];

/** Keeps the key predictable and safe to put in a URL. */
const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-80) || "photo";

export const upload = {
  presign: adminOnly
    .input(
      z.object({
        filename: z.string().min(1),
        contentType: z.string().min(1),
      }),
    )
    .handler(async ({ input }) => {
      if (!ALLOWED.includes(input.contentType)) {
        throw new Error("Images only: png, jpeg, webp, avif or gif.");
      }

      const key = `photos/${Date.now()}-${slug(input.filename)}`;

      const url = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: bucket(),
          Key: key,
          ContentType: input.contentType,
        }),
        { expiresIn: 600 },
      );

      return { url, key, path: `/api/files/${key}` };
    }),
};
