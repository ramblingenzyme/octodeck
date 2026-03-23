import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { githubFetch, UnauthorizedError } from "@/auth/token";

describe("githubFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the Response on success", async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({}) } as Response;
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

    const result = await githubFetch("/user");
    expect(result).toBe(mockResponse);
    expect(fetch).toHaveBeenCalledWith("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
      },
      signal: undefined,
    });
  });

  it("returns the Response on non-200 without throwing", async () => {
    const mockResponse = { ok: false, status: 404, statusText: "Not Found" } as Response;
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

    const result = await githubFetch("/user");
    expect(result).toBe(mockResponse);
    expect(result.ok).toBe(false);
  });

  it("forwards AbortSignal to fetch", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    const controller = new AbortController();
    await githubFetch("/user", controller.signal);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/user",
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});

describe("UnauthorizedError", () => {
  it("is an Error with name UnauthorizedError", () => {
    const err = new UnauthorizedError();
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("UnauthorizedError");
  });
});
