import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "@/store/authStore";

// Stub navigator.serviceWorker so logOut() doesn't throw in jsdom/happy-dom
vi.stubGlobal("navigator", {
  serviceWorker: { controller: null },
});

const resetStore = () =>
  useAuthStore.setState({ status: "idle", sessionId: null, error: null });

beforeEach(() => {
  vi.clearAllMocks();
  resetStore();
});

describe("initial state", () => {
  it("status is idle and sessionId is null", () => {
    const state = useAuthStore.getState();
    expect(state.status).toBe("idle");
    expect(state.sessionId).toBeNull();
    expect(state.error).toBeNull();
  });
});

describe("authSuccess", () => {
  it("transitions to authed and generates a sessionId", () => {
    useAuthStore.getState().authSuccess();
    const state = useAuthStore.getState();
    expect(state.status).toBe("authed");
    expect(state.sessionId).not.toBeNull();
    expect(typeof state.sessionId).toBe("string");
    expect(state.error).toBeNull();
  });

  it("each call generates a different sessionId", () => {
    useAuthStore.getState().authSuccess();
    const first = useAuthStore.getState().sessionId;
    useAuthStore.getState().authSuccess();
    const second = useAuthStore.getState().sessionId;
    expect(first).not.toBe(second);
  });
});

describe("logOut", () => {
  it("resets state to idle and clears sessionId", () => {
    useAuthStore.getState().authSuccess();
    useAuthStore.getState().logOut();
    const state = useAuthStore.getState();
    expect(state.status).toBe("idle");
    expect(state.sessionId).toBeNull();
    expect(state.error).toBeNull();
  });
});

describe("setError", () => {
  it("transitions to error and sets message", () => {
    useAuthStore.getState().setError("something went wrong");
    const state = useAuthStore.getState();
    expect(state.status).toBe("error");
    expect(state.error).toBe("something went wrong");
  });
});

describe("clearError", () => {
  it("transitions back to idle and clears error", () => {
    useAuthStore.setState({ status: "error", error: "oops" });
    useAuthStore.getState().clearError();
    const state = useAuthStore.getState();
    expect(state.status).toBe("idle");
    expect(state.error).toBeNull();
  });
});
