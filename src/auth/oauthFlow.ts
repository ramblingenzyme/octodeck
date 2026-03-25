export interface TokenSet {
  accessToken: string;
  expiresAt: number;
}

export function redirectToGitHub(): void {
  window.location.href = "/api/login";
}

function getCSRFHeaderValue() {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("__Host-csrf"))
      ?.split("=")[1] || ""
  );
}

export async function fetchSession(): Promise<TokenSet> {
  const res = await fetch("/api/session", {
    headers: { "X-GitHub-App-CSRF": getCSRFHeaderValue() },
  });
  if (!res.ok) throw new Error(`Session fetch failed: ${res.status}`);
  return res.json() as Promise<TokenSet>;
}

export function logoutSession(): Promise<Response> {
  return fetch("/api/logout", {
    method: "POST",
    headers: { "X-GitHub-App-CSRF": getCSRFHeaderValue() },
  });
}

export async function refreshSession(): Promise<TokenSet> {
  const res = await fetch("/api/refresh", {
    method: "POST",
    headers: { "X-GitHub-App-CSRF": getCSRFHeaderValue() },
  });
  if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
  return res.json() as Promise<TokenSet>;
}
