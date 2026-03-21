import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { requestDeviceCode, pollForToken } from "./deviceFlow";

describe("requestDeviceCode", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns device code fields on success", async () => {
    const mockData = {
      device_code: "abc123",
      user_code: "ABCD-1234",
      verification_uri: "https://github.com/login/device",
      expires_in: 900,
      interval: 5,
    };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await requestDeviceCode("client_id_123");
    expect(result).toEqual(mockData);
  });

  it("throws on HTTP error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await expect(requestDeviceCode("client_id_123")).rejects.toThrow(
      "Device code request failed: 500",
    );
  });

  it("propagates network errors", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network failure"));

    await expect(requestDeviceCode("client_id_123")).rejects.toThrow("Network failure");
  });
});

describe("pollForToken", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function makePollResponse(data: Record<string, string>) {
    return {
      ok: true,
      json: () => Promise.resolve(data),
    } as Response;
  }

  it("resolves with access_token when present", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makePollResponse({ access_token: "ghp_token123" }));

    const controller = new AbortController();
    const promise = pollForToken("client_id", "device_code", 0, controller.signal);
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe("ghp_token123");
  });

  it("retries on authorization_pending", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(makePollResponse({ error: "authorization_pending" }))
      .mockResolvedValueOnce(makePollResponse({ access_token: "ghp_token456" }));

    const controller = new AbortController();
    const promise = pollForToken("client_id", "device_code", 0, controller.signal);

    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe("ghp_token456");
  });

  it("increments interval by 5000ms on slow_down", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(makePollResponse({ error: "slow_down" }))
      .mockResolvedValueOnce(makePollResponse({ access_token: "ghp_slow" }));

    const controller = new AbortController();
    const promise = pollForToken("client_id", "device_code", 0, controller.signal);

    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe("ghp_slow");
  });

  it("throws on expired_token", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makePollResponse({ error: "expired_token" }));

    const controller = new AbortController();
    const promise = pollForToken("client_id", "device_code", 0, controller.signal);
    const assertion = expect(promise).rejects.toThrow("Device code expired. Please try again.");
    await vi.runAllTimersAsync();
    await assertion;
  });

  it("throws on access_denied", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makePollResponse({ error: "access_denied" }));

    const controller = new AbortController();
    const promise = pollForToken("client_id", "device_code", 0, controller.signal);
    const assertion = expect(promise).rejects.toThrow("Access denied by user.");
    await vi.runAllTimersAsync();
    await assertion;
  });

  it("throws with error_description for unknown errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makePollResponse({ error: "bad_verification_code", error_description: "The code is bad" }),
    );

    const controller = new AbortController();
    const promise = pollForToken("client_id", "device_code", 0, controller.signal);
    const assertion = expect(promise).rejects.toThrow("The code is bad");
    await vi.runAllTimersAsync();
    await assertion;
  });

  it("throws with error field when error_description is absent", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makePollResponse({ error: "some_unknown_error" }));

    const controller = new AbortController();
    const promise = pollForToken("client_id", "device_code", 0, controller.signal);
    const assertion = expect(promise).rejects.toThrow("some_unknown_error");
    await vi.runAllTimersAsync();
    await assertion;
  });

  it("throws AbortError when signal is aborted mid-wait", async () => {
    const controller = new AbortController();
    const promise = pollForToken("client_id", "device_code", 5, controller.signal);

    // Abort before the timer fires
    controller.abort();

    await expect(promise).rejects.toThrow("Aborted");
  });
});
