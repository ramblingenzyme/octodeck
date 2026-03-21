import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/preact";
import { useDeviceFlow } from "@/auth/useDeviceFlow";
import type { AuthState, AuthStatus } from "@/store/authStore";

const mockSetError = vi.fn();
const mockDeviceCodeReceived = vi.fn();
const mockTokenReceived = vi.fn();

function makeState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    status: "idle" as AuthStatus,
    token: null,
    userCode: null,
    verificationUri: null,
    expiresAt: null,
    deviceCode: null,
    interval: 5,
    error: null,
    setError: mockSetError,
    deviceCodeReceived: mockDeviceCodeReceived,
    tokenReceived: mockTokenReceived,
    logOut: vi.fn(),
    clearError: vi.fn(),
    ...overrides,
  };
}

let storeState: AuthState = makeState();

vi.mock("@/store/authStore", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useAuthStore: vi.fn((selector?: (s: AuthState) => unknown) =>
    selector ? selector(storeState) : storeState,
  ) as any,
}));

vi.mock("@/auth/deviceFlow", () => ({
  requestDeviceCode: vi.fn(),
  pollForToken: vi.fn(),
}));

vi.mock("@/env", () => ({
  GITHUB_CLIENT_ID: "test-client-id",
  isDemoMode: false,
}));

import { useAuthStore } from "@/store/authStore";
import { requestDeviceCode, pollForToken } from "@/auth/deviceFlow";

function applyMock() {
  vi.mocked(useAuthStore).mockImplementation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((selector?: (s: AuthState) => unknown) =>
      selector ? selector(storeState) : storeState) as any,
  );
}

function setStatus(status: AuthStatus, extra: Partial<AuthState> = {}) {
  storeState = makeState({ ...storeState, status, ...extra });
  applyMock();
}

beforeEach(() => {
  vi.clearAllMocks();
  storeState = makeState();
  applyMock();
});

describe("useDeviceFlow — start()", () => {
  it("calls setError when GITHUB_CLIENT_ID is missing", async () => {
    vi.resetModules();
    vi.doMock("@/env", () => ({ GITHUB_CLIENT_ID: undefined, isDemoMode: false }));
    vi.doMock("@/store/authStore", () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useAuthStore: vi.fn((selector?: (s: AuthState) => unknown) =>
        selector ? selector(storeState) : storeState,
      ) as any,
    }));
    vi.doMock("@/auth/deviceFlow", () => ({
      requestDeviceCode: vi.fn(),
      pollForToken: vi.fn(),
    }));
    const { useDeviceFlow: freshHook } = await import("@/auth/useDeviceFlow");
    const { result } = renderHook(() => freshHook());
    await act(async () => {
      await result.current.start();
    });
    expect(mockSetError).toHaveBeenCalledWith(
      "VITE_GITHUB_CLIENT_ID is not set. Check your .env.local file.",
    );
    vi.resetModules();
  });

  it("calls deviceCodeReceived on success", async () => {
    vi.mocked(requestDeviceCode).mockResolvedValueOnce({
      device_code: "dev-code",
      user_code: "USER-CODE",
      verification_uri: "https://github.com/login/device",
      expires_in: 900,
      interval: 5,
    });
    const { result } = renderHook(() => useDeviceFlow());
    await act(async () => {
      await result.current.start();
    });
    expect(mockDeviceCodeReceived).toHaveBeenCalledWith({
      deviceCode: "dev-code",
      userCode: "USER-CODE",
      verificationUri: "https://github.com/login/device",
      expiresIn: 900,
      interval: 5,
    });
  });

  it("calls setError when requestDeviceCode throws", async () => {
    vi.mocked(requestDeviceCode).mockRejectedValueOnce(new Error("network error"));
    const { result } = renderHook(() => useDeviceFlow());
    await act(async () => {
      await result.current.start();
    });
    expect(mockSetError).toHaveBeenCalledWith("network error");
  });
});

describe("useDeviceFlow — polling effect", () => {
  it("calls pollForToken when status is polling", async () => {
    vi.mocked(pollForToken).mockResolvedValue("my-token");
    setStatus("polling", { deviceCode: "dev-code", interval: 5 });
    const { unmount } = renderHook(() => useDeviceFlow());
    await act(async () => {
      await Promise.resolve();
    });
    expect(pollForToken).toHaveBeenCalledWith(
      "test-client-id",
      "dev-code",
      5,
      expect.any(AbortSignal),
    );
    unmount();
  });

  it("calls tokenReceived on poll success", async () => {
    vi.mocked(pollForToken).mockResolvedValue("my-token");
    setStatus("polling", { deviceCode: "dev-code", interval: 5 });
    const { unmount } = renderHook(() => useDeviceFlow());
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockTokenReceived).toHaveBeenCalledWith("my-token");
    unmount();
  });

  it("calls setError on non-AbortError poll failure", async () => {
    vi.mocked(pollForToken).mockRejectedValue(new Error("poll failed"));
    setStatus("polling", { deviceCode: "dev-code", interval: 5 });
    const { unmount } = renderHook(() => useDeviceFlow());
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockSetError).toHaveBeenCalledWith("poll failed");
    unmount();
  });

  it("does not call setError on AbortError", async () => {
    vi.mocked(pollForToken).mockRejectedValue(new DOMException("Aborted", "AbortError"));
    setStatus("polling", { deviceCode: "dev-code", interval: 5 });
    const { unmount } = renderHook(() => useDeviceFlow());
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockSetError).not.toHaveBeenCalled();
    unmount();
  });

  it("aborts signal on unmount", async () => {
    let capturedSignal: AbortSignal | undefined;
    vi.mocked(pollForToken).mockImplementation((_cid, _dc, _int, signal) => {
      capturedSignal = signal;
      return new Promise(() => {}); // never resolves
    });
    setStatus("polling", { deviceCode: "dev-code", interval: 5 });
    const { unmount } = renderHook(() => useDeviceFlow());
    await act(async () => {
      await Promise.resolve();
    });
    expect(capturedSignal?.aborted).toBe(false);
    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });
});
