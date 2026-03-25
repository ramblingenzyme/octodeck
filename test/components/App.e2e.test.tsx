/**
 * Full-app integration ("E2E-style") tests.
 *
 * These render <App> end-to-end and interact through the live UI using
 * userEvent — no mocked child components.  isDemoMode is forced to true so
 * the auth modal never blocks the board, except in the auth flow section
 * which sets it to false to test login/logout behaviour.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { useLayoutStore } from "@/store/layoutStore";
import { useAuthStore } from "@/store/authStore";
import { loadLayout } from "@/store/layoutStorage";

// envConfig is mutated by the auth-flow section to toggle isDemoMode.
const { envConfig, mockFetchSession, mockLogoutSession, mockRedirectToGitHub } = vi.hoisted(() => ({
  envConfig: { isDemoMode: true, GITHUB_CLIENT_ID: undefined as string | undefined },
  mockFetchSession: vi.fn(),
  mockLogoutSession: vi.fn(),
  mockRedirectToGitHub: vi.fn(),
}));

vi.mock("@/env", () => ({
  get isDemoMode() {
    return envConfig.isDemoMode;
  },
  get GITHUB_CLIENT_ID() {
    return envConfig.GITHUB_CLIENT_ID;
  },
}));

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

// Lazy-import App AFTER the mock is in place.
const { App } = await import("@/components/App");

function renderApp() {
  return render(<App />);
}

beforeEach(() => {
  // Clear persisted layout so each test starts from DEFAULT_COLUMNS.
  localStorage.clear();
  // Reset Zustand layout store so the fresh localStorage is re-read.
  useLayoutStore.setState({ columns: loadLayout() });
  // Reset auth store to its initial loading state.
  useAuthStore.setState({ status: "loading", sessionId: null, error: null });
  // happy-dom doesn't implement showModal/close; stub them so that setting
  // open=true/false on <dialog> is reflected in the DOM (enables findByRole).
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

afterEach(cleanup);

// ─── 1. Demo board loads ────────────────────────────────────────────────────

describe("demo board loads", () => {
  it("renders the four default columns", async () => {
    renderApp();

    expect(await screen.findByRole("region", { name: "Open PRs" })).toBeTruthy();
    expect(await screen.findByRole("region", { name: "Issues" })).toBeTruthy();
    expect(await screen.findByRole("region", { name: "CI / CD" })).toBeTruthy();
    expect(await screen.findByRole("region", { name: "Activity" })).toBeTruthy();
  });

  it("each column contains at least one card", async () => {
    renderApp();

    await screen.findByRole("region", { name: "Open PRs" }); // wait for columns

    for (const name of ["Open PRs", "Issues", "CI / CD", "Activity"]) {
      const col = screen.getByRole("region", { name });
      expect(within(col).getAllByRole("article").length).toBeGreaterThan(0);
    }
  });
});

// ─── 2. Add column ──────────────────────────────────────────────────────────

describe("add column flow", () => {
  it("new column appears after completing the Add Column modal", async () => {
    const user = userEvent.setup();
    renderApp();

    await screen.findByRole("region", { name: "Open PRs" }); // wait for board

    await user.click(screen.getByRole("button", { name: /add column/i }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    // Switch to Issues type and give it a custom title.
    await user.click(screen.getByRole("button", { name: /issues/i }));
    const titleInput = screen.getByLabelText(/column title/i) as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, "My Issues");

    await user.click(screen.getByRole("button", { name: /^add column$/i }));

    // Modal closes and the new column is on the board.
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("region", { name: "My Issues" })).toBeTruthy();
  });
});

// ─── 3. Column query editing ────────────────────────────────────────────────

describe("column query editing", () => {
  it("clicking the query bar opens the editor", async () => {
    const user = userEvent.setup();
    renderApp();

    const col = await screen.findByRole("region", { name: "CI / CD" });
    await user.click(within(col).getByRole("button", { name: /edit filter query/i }));

    expect(within(col).getByRole("textbox", { name: /filter query/i })).toBeTruthy();
  });

  it("cancelling the editor returns to display mode", async () => {
    const user = userEvent.setup();
    renderApp();

    const col = await screen.findByRole("region", { name: "CI / CD" });
    await user.click(within(col).getByRole("button", { name: /edit filter query/i }));
    await user.click(within(col).getByRole("button", { name: /cancel/i }));

    expect(within(col).queryByRole("textbox")).toBeNull();
    expect(within(col).getByRole("button", { name: /edit filter query/i })).toBeTruthy();
  });

  it("committing a query value persists it and returns to display mode", async () => {
    const user = userEvent.setup();
    renderApp();

    const col = await screen.findByRole("region", { name: "CI / CD" });
    await user.click(within(col).getByRole("button", { name: /edit filter query/i }));

    const textarea = within(col).getByRole("textbox", { name: /filter query/i });
    await user.type(textarea, "repo:my-org/my-repo");
    await user.keyboard("{Enter}");

    expect(within(col).queryByRole("textbox")).toBeNull();
    expect(within(col).getByRole("button", { name: /edit filter query/i })).toBeTruthy();
  });

  it("committed query is persisted to the store", async () => {
    const user = userEvent.setup();
    renderApp();

    const col = await screen.findByRole("region", { name: "CI / CD" });
    await user.click(within(col).getByRole("button", { name: /edit filter query/i }));
    await user.type(within(col).getByRole("textbox"), "repo:my-org/my-repo");
    await user.keyboard("{Enter}");

    const { columns } = useLayoutStore.getState();
    expect(columns.find((c) => c.title === "CI / CD")?.query).toBe("repo:my-org/my-repo");
  });

  it("existing query can be edited and updated", async () => {
    const user = userEvent.setup();
    renderApp();

    // "Open PRs" has a query set in DEFAULT_COLUMNS — edit it directly.
    const col = await screen.findByRole("region", { name: "Open PRs" });
    await user.click(within(col).getByRole("button", { name: /edit filter query/i }));
    const textarea = within(col).getByRole("textbox") as HTMLTextAreaElement;
    await user.clear(textarea);
    await user.type(textarea, "author:octocat");
    await user.keyboard("{Enter}");

    expect(useLayoutStore.getState().columns.find((c) => c.title === "Open PRs")?.query).toBe(
      "author:octocat",
    );
  });
});

// ─── 4. Remove column ───────────────────────────────────────────────────────

describe("remove column flow", () => {
  it("column disappears after confirming removal", async () => {
    const user = userEvent.setup();
    renderApp();

    await screen.findByRole("region", { name: "Open PRs" }); // wait for board

    // Target the "CI / CD" column.
    const ciCol = screen.getByRole("region", { name: "CI / CD" });
    expect(ciCol).toBeTruthy();

    await user.click(within(ciCol).getByRole("button", { name: /remove column/i }));

    // Confirmation prompt appears inside the column.
    const confirmBtn = within(ciCol).getByRole("button", { name: /yes, remove/i });
    await user.click(confirmBtn);

    expect(screen.queryByRole("region", { name: "CI / CD" })).toBeNull();
  });
});

// ─── 5. Auth flow ────────────────────────────────────────────────────────────

describe("auth flow", () => {
  beforeEach(() => {
    envConfig.isDemoMode = false;
    vi.clearAllMocks();
    // Stub globalThis.fetch so githubFetch (used by useGetUser) resolves with
    // a fake user without hitting the network.
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
    envConfig.isDemoMode = true;
    vi.restoreAllMocks();
  });

  it("shows a loading state while the session check is in flight", async () => {
    // fetchSession never resolves — keeps the app in the "loading" status.
    mockFetchSession.mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(await screen.findByText("Connecting…")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("login modal appears when there is no active session", async () => {
    mockFetchSession.mockRejectedValue(new Error("401"));
    render(<App />);
    expect(await screen.findByRole("dialog")).toBeTruthy();
  });

  it("'Sign in with GitHub' initiates the OAuth redirect", async () => {
    mockFetchSession.mockRejectedValue(new Error("401"));
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: /sign in with github/i }));
    expect(mockRedirectToGitHub).toHaveBeenCalledOnce();
  });

  it("'Continue in Demo Mode' closes the modal", async () => {
    mockFetchSession.mockRejectedValue(new Error("401"));
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: /continue in demo mode/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("signing out calls logoutSession and shows the login modal", async () => {
    mockFetchSession.mockResolvedValue({ accessToken: "tok", expiresAt: Date.now() + 3_600_000 });
    mockLogoutSession.mockResolvedValue(new Response(null, { status: 204 }));
    const user = userEvent.setup();
    render(<App />);
    // Wait for the user avatar to appear — only shown when authed + user data loaded.
    const signOutBtn = await screen.findByRole("button", { name: /sign out/i });
    await user.click(signOutBtn);
    expect(mockLogoutSession).toHaveBeenCalledOnce();
    expect(await screen.findByRole("dialog")).toBeTruthy();
  });
});
