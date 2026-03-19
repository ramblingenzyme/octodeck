/**
 * Full-app integration ("E2E-style") tests.
 *
 * These render <App> end-to-end with the real Redux store and interact through
 * the live UI using userEvent — no mocked child components.  isDemoMode is
 * forced to true so the auth modal never blocks the board.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { store } from "@/store";
import { configApi } from "@/store/configApi";

// Force demo mode so the auth modal does not open.
vi.mock("@/env", () => ({ isDemoMode: true, GITHUB_CLIENT_ID: undefined }));

// Lazy-import App AFTER the mock is in place.
const { App } = await import("./App");

function renderApp() {
  return render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
}

beforeEach(() => {
  // Clear persisted layout so each test starts from DEFAULT_COLUMNS.
  localStorage.clear();
  // Reset RTK Query cache so the fresh localStorage is re-read on mount.
  store.dispatch(configApi.util.resetApiState());
});

afterEach(cleanup);

// ─── 1. Demo board loads ────────────────────────────────────────────────────

describe("demo board loads", () => {
  it("renders the five default columns", async () => {
    renderApp();

    // findByRole waits for RTK Query to resolve its queryFn asynchronously.
    await screen.findByRole("region", { name: "Inbox" });
    expect(screen.getByRole("region", { name: "Open PRs" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Issues" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "CI / CD" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Activity" })).toBeTruthy();
  });

  it("each column contains at least one card", async () => {
    renderApp();

    await screen.findByRole("region", { name: "Inbox" }); // wait for columns

    for (const name of ["Inbox", "Open PRs", "Issues", "CI / CD", "Activity"]) {
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

    await screen.findByRole("region", { name: "Inbox" }); // wait for board

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

// ─── 3. Remove column ───────────────────────────────────────────────────────

describe("remove column flow", () => {
  it("column disappears after confirming removal", async () => {
    const user = userEvent.setup();
    renderApp();

    await screen.findByRole("region", { name: "Inbox" }); // wait for board

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
