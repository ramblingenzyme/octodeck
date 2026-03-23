export interface TokenSet {
  accessToken: string;
  expiresAt: number;
}

export function redirectToGitHub(): void {
  window.location.href = "/api/login";
}

export async function fetchSession(): Promise<TokenSet> {
  const res = await fetch("/api/session", {
    headers: { "X-GitHub-App-CSRF": "1" },
  });
  if (!res.ok) throw new Error(`Session fetch failed: ${res.status}`);
  return res.json() as Promise<TokenSet>;
}

export async function refreshSession(): Promise<TokenSet> {
  const res = await fetch("/api/refresh", {
    method: "POST",
    headers: { "X-GitHub-App-CSRF": "1" },
  });
  if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
  return res.json() as Promise<TokenSet>;
}
