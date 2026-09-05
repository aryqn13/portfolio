import { S3Client } from "@aws-sdk/client-s3";

/**
 * Tigris object storage over the S3 API. Used for photographs uploaded from
 * the studio, which cannot live in the repo because the site is edited after
 * it is built.
 */
export const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export const bucket = () => process.env.S3_BUCKET!;
