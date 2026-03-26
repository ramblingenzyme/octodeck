import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup, waitFor } from "@testing-library/preact";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { UnauthorizedError } from "@/auth/token";

const { mockFetchSession, mockLogoutSession } = vi.hoisted(() => ({
  mockFetchSession: vi.fn(),
  mockLogoutSession: vi.fn(),
}));

vi.mock("@/env", () => ({ isDemo: false }));

vi.mock("@/auth/token", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/auth/token")>();
  return { ...actual, setToken: vi.fn(), clearToken: vi.fn() };
});

vi.mock("@/auth/oauthFlow", () => ({
  fetchSession: mockFetchSession,
  logoutSession: mockLogoutSession,
  refreshSession: vi.fn(),
}));

const resetStore = () => useAuthStore.setState({ status: "loading", sessionId: null, error: null });

beforeEach(() => {
  vi.clearAllMocks();
  resetStore();
  mockLogoutSession.mockResolvedValue(new Response(null, { status: 204 }));
});

afterEach(cleanup);

describe("useAuth — session bootstrap", () => {
  it("sets authed state when session fetch succeeds", async () => {
    mockFetchSession.mockResolvedValue({ accessToken: "tok", expiresAt: Date.now() + 3600_000 });

    const { result } = renderHook(() => useAuth());

    await act(async () => {});

    expect(result.current.isLoading).toBe(false);
    expect(result.current.modalOpen).toBe(false);
    expect(useAuthStore.getState().status).toBe("authed");
  });

  it("opens login modal when session fetch fails (no session)", async () => {
    mockFetchSession.mockRejectedValue(new Error("401"));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.modalOpen).toBe(true);
    expect(useAuthStore.getState().status).toBe("idle");
  });
});

describe("useAuth — sign out", () => {
  it("calls logoutSession, clears auth state, and opens modal", async () => {
    mockFetchSession.mockResolvedValue({ accessToken: "tok", expiresAt: Date.now() + 3600_000 });

    const { result } = renderHook(() => useAuth());
    await act(async () => {});

    expect(useAuthStore.getState().status).toBe("authed");

    act(() => result.current.onSignOut());

    expect(mockLogoutSession).toHaveBeenCalledOnce();
    expect(useAuthStore.getState().status).toBe("idle");
    expect(result.current.modalOpen).toBe(true);
  });
});

describe("useAuth — SWR error handler", () => {
  it("opens modal on UnauthorizedError", async () => {
    mockFetchSession.mockResolvedValue({ accessToken: "tok", expiresAt: Date.now() + 3600_000 });

    const { result } = renderHook(() => useAuth());
    await act(async () => {});

    act(() => result.current.onSWRError(new UnauthorizedError()));

    expect(useAuthStore.getState().status).toBe("idle");
    expect(result.current.modalOpen).toBe(true);
  });

  it("does not call logoutSession on UnauthorizedError", async () => {
    mockFetchSession.mockResolvedValue({ accessToken: "tok", expiresAt: Date.now() + 3600_000 });

    const { result } = renderHook(() => useAuth());
    await act(async () => {});

    act(() => result.current.onSWRError(new UnauthorizedError()));

    expect(mockLogoutSession).not.toHaveBeenCalled();
  });

  it("ignores non-UnauthorizedError errors", async () => {
    mockFetchSession.mockResolvedValue({ accessToken: "tok", expiresAt: Date.now() + 3600_000 });

    const { result } = renderHook(() => useAuth());
    await act(async () => {});

    act(() => result.current.onSWRError(new Error("network error")));

    expect(useAuthStore.getState().status).toBe("authed");
    expect(result.current.modalOpen).toBe(false);
  });
});
