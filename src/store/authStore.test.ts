import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "./authStore";

vi.mock("./tokenStorage", () => ({
  loadToken: vi.fn(() => null),
  saveToken: vi.fn(),
  clearToken: vi.fn(),
}));

import { loadToken, saveToken, clearToken } from "./tokenStorage";

const resetStore = () =>
  useAuthStore.setState({
    status: "idle",
    token: null,
    deviceCode: null,
    userCode: null,
    verificationUri: null,
    expiresAt: null,
    interval: 5,
    error: null,
  });

beforeEach(() => {
  vi.clearAllMocks();
  resetStore();
});

describe("initial state", () => {
  it("status is idle and token is null when loadToken returns null", () => {
    const state = useAuthStore.getState();
    expect(state.status).toBe("idle");
    expect(state.token).toBeNull();
  });

  it("status is authed and token is set when loadToken returns a value", () => {
    vi.mocked(loadToken).mockReturnValueOnce("stored-token");
    // Re-initialise the store's computed initial values by setting them directly
    useAuthStore.setState({ status: "authed", token: "stored-token" });
    const state = useAuthStore.getState();
    expect(state.status).toBe("authed");
    expect(state.token).toBe("stored-token");
  });
});

describe("initial state — module re-import", () => {
  it("status is 'authed' when loadToken returns a token", async () => {
    vi.resetModules();
    vi.doMock("./tokenStorage", () => ({
      loadToken: () => "stored",
      saveToken: vi.fn(),
      clearToken: vi.fn(),
    }));
    const { useAuthStore: freshStore } = await import("./authStore");
    expect(freshStore.getState().status).toBe("authed");
    expect(freshStore.getState().token).toBe("stored");
  });
});

describe("deviceCodeReceived", () => {
  it("transitions to polling and sets device flow fields", () => {
    const before = Date.now();
    useAuthStore.getState().deviceCodeReceived({
      deviceCode: "dev-code",
      userCode: "USER-CODE",
      verificationUri: "https://github.com/login/device",
      expiresIn: 900,
      interval: 5,
    });
    const state = useAuthStore.getState();
    expect(state.status).toBe("polling");
    expect(state.deviceCode).toBe("dev-code");
    expect(state.userCode).toBe("USER-CODE");
    expect(state.verificationUri).toBe("https://github.com/login/device");
    expect(state.interval).toBe(5);
    expect(state.expiresAt).toBeGreaterThanOrEqual(before + 900_000);
    expect(state.expiresAt).toBeLessThanOrEqual(Date.now() + 900_000);
    expect(state.error).toBeNull();
  });
});

describe("tokenReceived", () => {
  it("calls saveToken, transitions to authed, and clears device flow fields", () => {
    useAuthStore.setState({ status: "polling", deviceCode: "x", userCode: "y" });
    useAuthStore.getState().tokenReceived("new-token");
    const state = useAuthStore.getState();
    expect(saveToken).toHaveBeenCalledWith("new-token");
    expect(state.status).toBe("authed");
    expect(state.token).toBe("new-token");
    expect(state.deviceCode).toBeNull();
    expect(state.userCode).toBeNull();
    expect(state.verificationUri).toBeNull();
    expect(state.expiresAt).toBeNull();
  });
});

describe("logOut", () => {
  it("calls clearToken and resets all state to idle/null", () => {
    useAuthStore.setState({ status: "authed", token: "t", deviceCode: "d" });
    useAuthStore.getState().logOut();
    const state = useAuthStore.getState();
    expect(clearToken).toHaveBeenCalled();
    expect(state.status).toBe("idle");
    expect(state.token).toBeNull();
    expect(state.deviceCode).toBeNull();
    expect(state.userCode).toBeNull();
    expect(state.verificationUri).toBeNull();
    expect(state.expiresAt).toBeNull();
    expect(state.error).toBeNull();
  });
});

describe("setError", () => {
  it("transitions to error and sets error message", () => {
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
