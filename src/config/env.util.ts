/**
 * Shared environment helpers — the single source of truth for production
 * detection and origin resolution across the Momen Tasks backend.
 *
 * WHY THIS EXISTS: Vercel does NOT set `NODE_ENV` for you; it injects
 * `VERCEL_ENV`. Checking `NODE_ENV === "production"` alone is precisely how
 * production builds silently fell back to `localhost` defaults (see
 * docs/AUTH-PRODUCTION-ROOT-CAUSE.md). Centralizing the check here guarantees
 * every config factory, strategy, gateway, and serverless handler agrees on
 * what "production" means.
 */
export function isProduction(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

const DEV_FRONTEND_ORIGIN = "http://localhost:5173";

/**
 * Resolves the frontend origin used for CORS, WebSocket, and OAuth-redirect
 * origins, and to build magic-link / verification links in emails.
 *
 * Production NEVER falls back to localhost: if `FRONTEND_URL` is unset in
 * production we throw a loud, actionable error instead, so the app cannot
 * silently serve localhost redirects to real users.
 */
export function resolveFrontendOrigin(): string {
  const url = process.env.FRONTEND_URL?.trim().replace(/\/+$/, "") || "";
  if (url) return url;
  if (isProduction()) {
    throw new Error(
      "FRONTEND_URL is required in production to set CORS/redirect/WebSocket origin (see docs/vercel-env-setup.md).",
    );
  }
  return DEV_FRONTEND_ORIGIN;
}
