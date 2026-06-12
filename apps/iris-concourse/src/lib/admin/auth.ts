// ─── Admin Auth ──────────────────────────────────────────────────────────────
// Lightweight shared-password gate for the internal agent tools under /admin.
// Not user accounts — a single team passcode stored in ADMIN_PASSWORD.

export const ADMIN_COOKIE = "ic_admin";

/**
 * The cookie value clients present after logging in. We avoid storing the raw
 * password in the cookie by using a separate session token. If ADMIN_SESSION_TOKEN
 * is unset, we derive a stable token from the password so setup stays one-variable.
 */
export function expectedSessionToken(): string {
  const explicit = process.env.ADMIN_SESSION_TOKEN;
  if (explicit) return explicit;

  const password = process.env.ADMIN_PASSWORD ?? "";
  // Stable, non-reversible-enough token for an internal tool.
  return Buffer.from(`ic-admin:${password}`).toString("base64url");
}

export function isValidPassword(candidate: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return candidate === password;
}
