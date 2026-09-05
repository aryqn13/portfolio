/**
 * Vercel entry point for the API.
 *
 * On Runable the site runs as one Bun process (`packages/web/src/__server.ts`)
 * that serves the built frontend and mounts this same Hono app under /api.
 * Vercel has no long-running process: the frontend is served as static files
 * from the CDN, and this file becomes a serverless function that answers every
 * /api/* request. `vercel.json` is what routes them here.
 *
 * The Hono app itself is untouched and shared by both, so there is only ever
 * one copy of the API.
 */
import { handle } from "hono/vercel";
import app from "../packages/web/src/api";

export default handle(app);
