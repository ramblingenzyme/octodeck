import { refreshSession } from "./oauthFlow";

export class UnauthorizedError extends Error {
  constructor() {
    super("GitHub token is invalid or has been revoked");
    this.name = "UnauthorizedError";
  }
}

let accessToken: string | null = null;
let expiresAt: number | null = null;
let refreshPromise: Promise<boolean> | null = null;

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export function setToken(token: string, exp: number): void {
  accessToken = token;
  expiresAt = exp;
}

export function clearToken(): void {
  accessToken = null;
  expiresAt = null;
}

export function hasToken(): boolean {
  return accessToken !== null;
}

function ensureRefreshed(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshSession()
      .then((t) => {
        setToken(t.accessToken, t.expiresAt);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function githubFetch(path: string, signal?: AbortSignal): Promise<Response> {
  if (accessToken && expiresAt !== null && Date.now() > expiresAt - REFRESH_BUFFER_MS) {
    const ok = await ensureRefreshed();
    if (!ok && Date.now() > (expiresAt ?? 0)) {
      clearToken();
      throw new UnauthorizedError();
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`https://api.github.com${path}`, { headers, signal });

  if (res.status === 401) {
    const ok = await ensureRefreshed();
    if (!ok) {
      clearToken();
      throw new UnauthorizedError();
    }
    return fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    });
  }

  return res;
}
