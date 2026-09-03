import { createHmac, timingSafeEqual } from "node:crypto";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";

/**
 * Single-owner auth. There is exactly one operator (me), so there is no user
 * table: a password from the environment is exchanged for a short-lived signed
 * token, and every write procedure verifies that token.
 */

const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const secret = () =>
  process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "";

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("hex");

const safeEqual = (a: string, b: string) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
};

export function issueToken(): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + TTL_MS;
  const payload = String(expiresAt);
  return { token: `${payload}.${sign(payload)}`, expiresAt };
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;
  return Number(payload) > Date.now();
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

/** Procedure base that only the token holder can call. */
export const adminOnly = base.use(async ({ next, context }) => {
  const header =
    context.headers?.get?.("authorization") ??
    context.headers?.get?.("x-admin-token") ??
    "";
  const token = header.replace(/^Bearer\s+/i, "").trim();

  if (!verifyToken(token))
    throw new ORPCError("UNAUTHORIZED", {
      message: "Sign in to the studio first.",
    });

  return next();
});
