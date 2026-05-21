/**
 * Netlify Function — API handler
 *
 * Receives all requests matching /api/* (via netlify.toml redirect).
 * Netlify may pass the original path (/api/trpc/…) or the stripped path (/trpc/…)
 * depending on whether :splat was used in the redirect rule, so we mount tRPC
 * under both prefixes to be safe.
 */
import "dotenv/config";
import express from "express";
import serverless from "serverless-http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

const app = express();

// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Mount tRPC under both prefixes:
//   /api/trpc  – when Netlify passes the original URL path
//   /trpc      – when Netlify strips /api/ via :splat redirect
const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});
app.use("/api/trpc", trpcMiddleware);
app.use("/trpc", trpcMiddleware);

// Health-check
app.get(["/api/health", "/health"], (_req, res) => res.json({ ok: true }));

export const handler = serverless(app);
