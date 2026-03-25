import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { redirectToGitHub, fetchSession, logoutSession, refreshSession } from "@/auth/oauthFlow";

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(document, "cookie", {
    value: "__Host-csrf=test-csrf-token",
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("redirectToGitHub", () => {
  it("sets window.location.href to /api/login", () => {
    redirectToGitHub();
    expect(window.location.href).toContain("/api/login");
  });
});

describe("getCSRFHeaderValue (via fetchSession)", () => {
  it("sends empty string when no CSRF cookie is present", async () => {
    Object.defineProperty(document, "cookie", { value: "", writable: true, configurable: true });
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ accessToken: "t", expiresAt: 0 }), { status: 200 }),
      );

    await fetchSession();

    expect(spy).toHaveBeenCalledWith(
      "/api/session",
      expect.objectContaining({
        headers: expect.objectContaining({ "X-GitHub-App-CSRF": "" }),
      }),
    );
  });

  it("extracts CSRF value correctly when multiple cookies are present", async () => {
    Object.defineProperty(document, "cookie", {
      value: "session=abc; __Host-csrf=my-token; other=xyz",
      writable: true,
      configurable: true,
    });
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ accessToken: "t", expiresAt: 0 }), { status: 200 }),
      );

    await fetchSession();

    expect(spy).toHaveBeenCalledWith(
      "/api/session",
      expect.objectContaining({
        headers: expect.objectContaining({ "X-GitHub-App-CSRF": "my-token" }),
      }),
    );
  });
});

describe("fetchSession", () => {
  it("returns token set on success", async () => {
    const tokenSet = { accessToken: "tok", expiresAt: Date.now() + 3600_000 };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(tokenSet), { status: 200 }),
    );

    const result = await fetchSession();

    expect(result.accessToken).toBe("tok");
  });

  it("sends CSRF header", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ accessToken: "t", expiresAt: 0 }), { status: 200 }),
      );

    await fetchSession();

    expect(spy).toHaveBeenCalledWith(
      "/api/session",
      expect.objectContaining({
        headers: expect.objectContaining({ "X-GitHub-App-CSRF": "test-csrf-token" }),
      }),
    );
  });

  it("throws when response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 401 }));

    await expect(fetchSession()).rejects.toThrow("Session fetch failed: 401");
  });
});

describe("logoutSession", () => {
  it("POSTs to /api/logout with CSRF header", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await logoutSession();

    expect(spy).toHaveBeenCalledWith(
      "/api/logout",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-GitHub-App-CSRF": "test-csrf-token" }),
      }),
    );
  });

  it("returns the response directly", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));

    const res = await logoutSession();

    expect(res.status).toBe(204);
  });
});

describe("refreshSession", () => {
  it("returns new token set on success", async () => {
    const tokenSet = { accessToken: "new-tok", expiresAt: Date.now() + 3600_000 };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(tokenSet), { status: 200 }),
    );

    const result = await refreshSession();

    expect(result.accessToken).toBe("new-tok");
  });

  it("throws when response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 401 }));

    await expect(refreshSession()).rejects.toThrow("Refresh failed: 401");
  });
});
