/// <reference lib="WebWorker" />
declare const self: ServiceWorkerGlobalScope;

interface TokenMessage {
  type: "SET_TOKENS";
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface ClearMessage {
  type: "CLEAR_TOKENS";
}

interface StatusMessage {
  type: "GET_STATUS";
}

type InboundMessage = TokenMessage | ClearMessage | StatusMessage;

let accessToken: string | null = null;
let refreshToken: string | null = null;
let expiresAt: number | null = null;

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

async function refreshTokens(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch("/api/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as Record<string, string | number>;
    if (!data["access_token"]) return false;
    accessToken = data["access_token"] as string;
    refreshToken = (data["refresh_token"] as string) ?? refreshToken;
    expiresAt = Date.now() + (data["expires_in"] as number) * 1000;
    return true;
  } catch {
    return false;
  }
}

async function notifyAuthExpired(): Promise<void> {
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage({ type: "AUTH_EXPIRED" });
  }
}

self.addEventListener("message", (event: ExtendableMessageEvent) => {
  const msg = event.data as InboundMessage;
  switch (msg.type) {
    case "SET_TOKENS":
      accessToken = msg.accessToken;
      refreshToken = msg.refreshToken;
      expiresAt = msg.expiresAt;
      break;
    case "CLEAR_TOKENS":
      accessToken = null;
      refreshToken = null;
      expiresAt = null;
      break;
    case "GET_STATUS":
      (event.source as Client | null)?.postMessage({
        type: "AUTH_STATUS",
        authed: accessToken !== null,
      });
      break;
  }
});

self.addEventListener("fetch", (event: FetchEvent) => {
  const url = new URL(event.request.url);
  if (url.hostname !== "api.github.com") return;
  event.respondWith(handleGitHubRequest(event.request));
});

async function handleGitHubRequest(request: Request): Promise<Response> {
  if (accessToken && expiresAt !== null && Date.now() > expiresAt - REFRESH_BUFFER_MS) {
    await refreshTokens();
  }

  if (!accessToken) return fetch(request);

  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  const authedRequest = new Request(request, { headers });

  const res = await fetch(authedRequest);

  if (res.status === 401) {
    const refreshed = await refreshTokens();
    if (!refreshed) {
      accessToken = null;
      refreshToken = null;
      expiresAt = null;
      void notifyAuthExpired();
      return res;
    }
    const retryHeaders = new Headers(request.headers);
    retryHeaders.set("Authorization", `Bearer ${accessToken}`);
    return fetch(new Request(request, { headers: retryHeaders }));
  }

  return res;
}

self.addEventListener("install", () => {
  void self.skipWaiting();
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});
