import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { githubFetch } from "./githubClient";

describe("githubFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns parsed JSON on success", async () => {
    const mockData = { login: "alice", avatar_url: "https://example.com/avatar", name: "Alice" };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await githubFetch("/user", "tok123");
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith("https://api.github.com/user", {
      headers: {
        Authorization: "Bearer tok123",
        Accept: "application/vnd.github+json",
      },
      signal: undefined,
    });
  });

  it("throws on non-200 response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    await expect(githubFetch("/user", "tok123")).rejects.toThrow("GitHub API error: 404 Not Found");
  });

  it("forwards AbortSignal to fetch", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    const controller = new AbortController();
    await githubFetch("/user", "tok123", controller.signal);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/user",
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});
