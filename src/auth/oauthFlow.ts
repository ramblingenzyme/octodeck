import { GITHUB_CLIENT_ID } from "@/env";

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const STATE_KEY = "gh-deck:oauth-state";

export function redirectToGitHub(redirectUri: string): void {
  if (!GITHUB_CLIENT_ID) throw new Error("VITE_GITHUB_CLIENT_ID is not set");

  const state = crypto.randomUUID();
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "repo notifications read:user security_events",
    state,
  });

  window.location.href = `https://github.com/login/oauth/authorize?${params}`;
}

export async function exchangeCode(code: string, redirectUri: string): Promise<TokenSet> {
  const res = await fetch("/api/exchange-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirect_uri: redirectUri }),
  });

  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);

  const data = (await res.json()) as Record<string, string | number>;

  if (data["error"]) {
    throw new Error(String(data["error_description"] ?? data["error"]));
  }
  if (!data["access_token"]) throw new Error("No access token in response");

  return {
    accessToken: data["access_token"] as string,
    refreshToken: data["refresh_token"] as string,
    expiresAt: Date.now() + (data["expires_in"] as number) * 1000,
  };
}

export function consumeOAuthState(): string | null {
  const state = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);
  return state;
}
