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

const IMAGES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
];

/** CVs are uploaded the same way, and read back through the same route. */
const DOCUMENTS = ["application/pdf"];

const ALLOWED = [...IMAGES, ...DOCUMENTS];

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
        throw new Error(
          "Images (png, jpeg, webp, avif, gif) or a PDF.",
        );
      }

      // Documents and photographs live under separate prefixes so the bucket
      // stays readable. Both are served back through /api/files/*.
      const folder = DOCUMENTS.includes(input.contentType) ? "resumes" : "photos";
      const key = `${folder}/${Date.now()}-${slug(input.filename)}`;

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
