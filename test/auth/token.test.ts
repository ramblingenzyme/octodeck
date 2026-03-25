import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockRefreshSession } = vi.hoisted(() => ({
  mockRefreshSession: vi.fn(),
}));

vi.mock("@/auth/oauthFlow", () => ({
  refreshSession: mockRefreshSession,
}));

import { setToken, clearToken, hasToken, githubFetch, UnauthorizedError } from "@/auth/token";

beforeEach(() => {
  clearToken();
  vi.clearAllMocks();
});

describe("hasToken", () => {
  it("returns false when no token is set", () => {
    expect(hasToken()).toBe(false);
  });

  it("returns true after setToken", () => {
    setToken("abc", Date.now() + 3600_000);
    expect(hasToken()).toBe(true);
  });

  it("returns false after clearToken", () => {
    setToken("abc", Date.now() + 3600_000);
    clearToken();
    expect(hasToken()).toBe(false);
  });
});

describe("clearToken", () => {
  it("is idempotent — clearing when already cleared does not throw", () => {
    expect(() => clearToken()).not.toThrow();
    expect(() => clearToken()).not.toThrow();
  });
});

describe("githubFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends Authorization header when token is set", async () => {
    setToken("my-token", Date.now() + 3600_000);
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    await githubFetch("/user");

    expect(spy).toHaveBeenCalledWith(
      "https://api.github.com/user",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer my-token" }),
      }),
    );
  });

  it("omits Authorization header when no token is set", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    await githubFetch("/user");

    const [, init] = spy.mock.calls[0]!;
    expect((init?.headers as Record<string, string>)["Authorization"]).toBeUndefined();
  });

  it("returns the response directly without throwing on non-2xx", async () => {
    setToken("tok", Date.now() + 3600_000);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 404 }));

    const res = await githubFetch("/nonexistent");

    expect(res.status).toBe(404);
  });

  it("retries with refreshed token after 401 and returns new response", async () => {
    setToken("old-token", Date.now() + 3600_000);
    mockRefreshSession.mockResolvedValue({
      accessToken: "new-token",
      expiresAt: Date.now() + 3600_000,
    });

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const res = await githubFetch("/user");

    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("throws UnauthorizedError when refresh fails after 401", async () => {
    setToken("old-token", Date.now() + 3600_000);
    mockRefreshSession.mockRejectedValue(new Error("refresh failed"));
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 401 }));

    await expect(githubFetch("/user")).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("proactively refreshes when token is near expiry", async () => {
    // Set token that expires in less than 5 minutes (the REFRESH_BUFFER_MS)
    const nearlyExpired = Date.now() + 2 * 60 * 1000;
    setToken("expiring-token", nearlyExpired);
    mockRefreshSession.mockResolvedValue({
      accessToken: "fresh-token",
      expiresAt: Date.now() + 3600_000,
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));

    await githubFetch("/user");

    expect(mockRefreshSession).toHaveBeenCalledOnce();
  });

  it("proceeds with old token when proactive refresh fails but token is still valid", async () => {
    // Token within the refresh buffer but not yet expired
    const nearlyExpired = Date.now() + 2 * 60 * 1000;
    setToken("expiring-token", nearlyExpired);
    mockRefreshSession.mockRejectedValue(new Error("refresh failed"));
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    const res = await githubFetch("/user");

    // Should not throw — proceeds with the still-valid old token
    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.github.com/user",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer expiring-token" }),
      }),
    );
  });
});
