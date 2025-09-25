// src/lib/erp-oauth.ts
// OAuth2 (PKCE) client for ERPNext — cookie-less, Bearer token auth.
// Uses sessionStorage (tokens persist across reloads in the same browser session).

// ---- Config ----
export const BASE = String(import.meta.env.VITE_ERP_BASE_URL || "").replace(/\/$/, "");
export const CLIENT_ID = String(import.meta.env.VITE_OAUTH_CLIENT_ID || "");

// Dynamically fall back to current origin in the browser if env is missing.
export const REDIRECT_URI = String(
  import.meta.env.VITE_OAUTH_REDIRECT_URI ||
    (typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "http://localhost:5173/auth/callback")
);

// ---- Auth change broadcaster ----
type AuthListener = () => void;
const authListeners = new Set<AuthListener>();
function notifyAuth() {
  for (const fn of [...authListeners]) {
    try {
      fn();
    } catch {}
  }
}
export function onAuthChange(fn: AuthListener) {
  authListeners.add(fn);
  return () => authListeners.delete(fn);
}

// ---- Token + ID Token storage (sessionStorage + memory) ----
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const ID_TOKEN_KEY = "id_token";

// initialize from sessionStorage at module load
let accessTokenMem: string | null = null;
let refreshTokenMem: string | null = null;
let idTokenMem: string | null = null;
try {
  accessTokenMem = sessionStorage.getItem(ACCESS_KEY);
  refreshTokenMem = sessionStorage.getItem(REFRESH_KEY);
  idTokenMem = sessionStorage.getItem(ID_TOKEN_KEY);
} catch { /* noop */ }

export function setAccessToken(tok: string | null, refreshTok?: string | null) {
  accessTokenMem = tok;
  if (tok) sessionStorage.setItem(ACCESS_KEY, tok);
  else sessionStorage.removeItem(ACCESS_KEY);

  if (typeof refreshTok !== "undefined") {
    refreshTokenMem = refreshTok;
    if (refreshTok) sessionStorage.setItem(REFRESH_KEY, refreshTok);
    else sessionStorage.removeItem(REFRESH_KEY);
  }
  notifyAuth();
}
export function setIdToken(tok: string | null) {
  idTokenMem = tok;
  if (tok) sessionStorage.setItem(ID_TOKEN_KEY, tok);
  else sessionStorage.removeItem(ID_TOKEN_KEY);
  // no notify; presence of id_token is not required for auth state
}

export function getAccessToken() {
  return accessTokenMem || sessionStorage.getItem(ACCESS_KEY);
}
export function getRefreshToken() {
  return refreshTokenMem || sessionStorage.getItem(REFRESH_KEY);
}
export function getIdToken() {
  return idTokenMem || sessionStorage.getItem(ID_TOKEN_KEY);
}

export function isAuthenticated() {
  return !!getAccessToken();
}
export function logoutLocal() {
  setAccessToken(null, null);
  setIdToken(null);
  // notifyAuth already called by setAccessToken
}

// ---- Utilities ----
async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}
function pickErrMsg(j: any, fallback: string) {
  return j?.error_description || j?.error || j?.message || j?._server_messages || j?.exception || fallback;
}
function parseJwt<T = any>(token: string | null): T | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    // handle URL-safe base64
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(payload);
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    try {
      return JSON.parse(atob(parts[1]));
    } catch {
      return null;
    }
  }
}
export function getIdClaims(): any | null {
  return parseJwt(getIdToken());
}

// ---- Bearer fetch with 401 -> refresh retry ----
export async function erpFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const tok = getAccessToken();
  if (tok && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${tok}`);

  const url = `${BASE}/${String(path).replace(/^\/+/, "")}`;

  const run = (h: Headers) => fetch(url, { ...init, headers: h });

  let res = await run(headers);

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const h2 = new Headers(init.headers || {});
      if (init.body && !h2.has("Content-Type")) h2.set("Content-Type", "application/json");
      const tok2 = getAccessToken();
      if (tok2) h2.set("Authorization", `Bearer ${tok2}`);
      res = await run(h2);
    }
  }

  const json = await parseJsonSafe(res);
  if (!res.ok) throw new Error(pickErrMsg(json, res.statusText));
  return json;
}

// ---- ERPNext OAuth endpoints ----
const AUTHZ_PATH = "/api/method/frappe.integrations.oauth2.authorize";
const TOKEN_PATH = "/api/method/frappe.integrations.oauth2.get_token";
const OPENID_PROFILE_PATH = "/api/method/frappe.integrations.oauth2.openid_profile";

// Build authorize URL (use with your PKCE challenge)
export function buildAuthorizeUrl(params: {
  client_id?: string;
  redirect_uri?: string;
  scope?: string;          // e.g., "openid all"
  code_challenge: string;
  state?: string;
}) {
  const qs = new URLSearchParams({
    response_type: "code",
    client_id: params.client_id || CLIENT_ID,
    redirect_uri: params.redirect_uri || REDIRECT_URI,
    scope: params.scope || "openid all",
    code_challenge_method: "S256",
    code_challenge: params.code_challenge,
  });
  if (params.state) qs.set("state", params.state);
  return `${BASE}${AUTHZ_PATH}?${qs.toString()}`;
}

// Exchange authorization code (PKCE) for tokens
export async function exchangeCodeForToken(args: {
  code: string;
  code_verifier: string;
  client_id?: string;
  redirect_uri?: string;
}) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: args.code,
    client_id: args.client_id || CLIENT_ID,
    redirect_uri: args.redirect_uri || REDIRECT_URI,
    code_verifier: args.code_verifier,
  });

  const res = await fetch(`${BASE}${TOKEN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const j = await parseJsonSafe(res);
  if (!res.ok) throw new Error(pickErrMsg(j, "Token exchange failed"));

  // j: { access_token, token_type, expires_in, refresh_token?, scope, id_token? }
  setAccessToken(j.access_token, j.refresh_token ?? undefined);
  if (j.id_token) setIdToken(j.id_token);
  return j as {
    access_token: string;
    token_type: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
    id_token?: string;
  };
}

// Refresh token flow
export async function refreshAccessToken() {
  const rt = getRefreshToken();
  if (!rt) return null;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: rt,
    client_id: CLIENT_ID,
  });

  const res = await fetch(`${BASE}${TOKEN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const j = await parseJsonSafe(res);
  if (!res.ok) throw new Error(pickErrMsg(j, "Token refresh failed"));

  setAccessToken(j.access_token, j.refresh_token ?? undefined);
  if (j.id_token) setIdToken(j.id_token);
  return j.access_token as string;
}

async function tryRefresh() {
  try {
    const tok = await refreshAccessToken();
    return !!tok;
  } catch {
    logoutLocal();
    return false;
  }
}

// Optional: OpenID user profile (requires `openid` scope)
export async function getOpenIdProfile() {
  const tok = getAccessToken();
  const headers: HeadersInit = tok ? { Authorization: `Bearer ${tok}` } : {};
  const res = await fetch(`${BASE}${OPENID_PROFILE_PATH}`, { headers });
  if (!res.ok) return null;
  return parseJsonSafe(res);
}

// ---- Identity helpers (fast + robust) ----

/**
 * Best-effort user identifier (email/username/name/sub).
 * 1) Prefer id_token claims (instant)
 * 2) Fallback to openid_profile (network)
 */
export async function getCurrentUserIdentifier(): Promise<string | null> {
  const claims = getIdClaims();
  const idFromClaims =
    claims?.email ||
    claims?.preferred_username ||
    claims?.username ||
    claims?.name ||
    claims?.sub ||
    null;
  if (idFromClaims) return String(idFromClaims);

  try {
    const p = await getOpenIdProfile();
    const m = (p as any)?.message ?? p ?? {};
    const idFromProfile =
      m.email || m.username || m.name || m.preferred_username || m.sub || null;
    return idFromProfile ? String(idFromProfile) : null;
  } catch {
    return null;
  }
}

/**
 * Resolve { email, user_default_location, user_name } for current user.
 * Tries direct User/<id> then falls back to queries by email / username.
 */
export async function getUserEmailAndLocation(): Promise<{
  email: string | null;
  user_default_location: string | null;
  user_name: string | null; // the User.name actually used/found
}> {
  const id = await getCurrentUserIdentifier();
  if (!id) return { email: null, user_default_location: null, user_name: null };

  const fields = ["name", "email", "user_default_location"];

  // Direct by name
  try {
    const u = await erpFetch(
      `api/resource/User/${encodeURIComponent(id)}?fields=${encodeURIComponent(JSON.stringify(fields))}`
    );
    const d = (u as any)?.data || {};
    return {
      email: d.email || d.name || null,
      user_default_location: d.user_default_location || null,
      user_name: d.name || null,
    };
  } catch {
    // By email
    try {
      const qs = new URLSearchParams();
      qs.set("filters", JSON.stringify([["User", "email", "=", id]]));
      qs.set("fields", JSON.stringify(fields));
      const list = await erpFetch(`api/resource/User?${qs.toString()}`);
      const d = (list as any)?.data?.[0] || {};
      if (d?.name || d?.email) {
        return {
          email: d.email || d.name || null,
          user_default_location: d.user_default_location || null,
          user_name: d.name || null,
        };
      }
    } catch {}

    // By username
    try {
      const qs2 = new URLSearchParams();
      qs2.set("filters", JSON.stringify([["User", "username", "=", id]]));
      qs2.set("fields", JSON.stringify(fields));
      const list2 = await erpFetch(`api/resource/User?${qs2.toString()}`);
      const d2 = (list2 as any)?.data?.[0] || {};
      return {
        email: d2.email || d2.name || null,
        user_default_location: d2.user_default_location || null,
        user_name: d2.name || null,
      };
    } catch {}
  }

  return { email: null, user_default_location: null, user_name: null };
}

// Re-sync in-memory tokens from sessionStorage (for early app boot)
export function loadAccessTokenFromStorage() {
  try {
    // These vars must already exist in this module:
    // accessTokenMem, refreshTokenMem, idTokenMem, ACCESS_KEY, REFRESH_KEY, ID_TOKEN_KEY
    accessTokenMem = sessionStorage.getItem(ACCESS_KEY);
    refreshTokenMem = sessionStorage.getItem(REFRESH_KEY);
    idTokenMem = sessionStorage.getItem(ID_TOKEN_KEY);
  } catch {
    // ignore
  }
}