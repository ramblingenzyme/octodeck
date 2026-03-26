/**
 * E2E-style integration tests for <App> — real auth flow.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { useAuthStore } from "@/store/authStore";

const { mockFetchSession, mockLogoutSession, mockRedirectToGitHub } = vi.hoisted(() => ({
  mockFetchSession: vi.fn(),
  mockLogoutSession: vi.fn(),
  mockRedirectToGitHub: vi.fn(),
}));

vi.mock("@/env", () => ({ isDemo: false }));

vi.mock("@/auth/oauthFlow", () => ({
  fetchSession: mockFetchSession,
  logoutSession: mockLogoutSession,
  redirectToGitHub: mockRedirectToGitHub,
  refreshSession: vi.fn(),
}));

// Stub navigator.serviceWorker (not available in happy-dom).
vi.stubGlobal("navigator", {
  serviceWorker: {
    register: vi.fn().mockResolvedValue({ active: null, installing: null, waiting: null }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    controller: null,
  },
});

// Lazy-import after mocks are in place.
const { App } = await import("@/components/App");

function renderApp() {
  return render(<App />);
}

beforeEach(() => {
  useAuthStore.setState({ status: "loading", sessionId: null, error: null });
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

afterEach(cleanup);

// ─── Auth flow ────────────────────────────────────────────────────────────

describe("auth flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      if (url.startsWith("https://api.github.com/user")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              login: "octocat",
              avatar_url: "https://github.com/octocat.png",
              name: null,
            }),
            { headers: { "Content-Type": "application/json" } },
          ),
        );
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a loading state while the session check is in flight", async () => {
    mockFetchSession.mockReturnValue(new Promise(() => {}));
    renderApp();
    expect(await screen.findByText("Connecting…")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("login modal appears when there is no active session", async () => {
    mockFetchSession.mockRejectedValue(new Error("401"));
    renderApp();
    expect(await screen.findByRole("dialog")).toBeTruthy();
  });

  it("'Sign in with GitHub' initiates the OAuth redirect", async () => {
    mockFetchSession.mockRejectedValue(new Error("401"));
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: /sign in with github/i }));
    expect(mockRedirectToGitHub).toHaveBeenCalledOnce();
  });

  it("signing out calls logoutSession and shows the login modal", async () => {
    mockFetchSession.mockResolvedValue({ accessToken: "tok", expiresAt: Date.now() + 3_600_000 });
    mockLogoutSession.mockResolvedValue(new Response(null, { status: 204 }));
    const user = userEvent.setup();
    renderApp();
    const signOutBtn = await screen.findByRole("button", { name: /sign out/i });
    await user.click(signOutBtn);
    expect(mockLogoutSession).toHaveBeenCalledOnce();
    expect(await screen.findByRole("dialog")).toBeTruthy();
  });
});
