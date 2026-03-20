/**
 * Full-app integration ("E2E-style") tests.
 *
 * These render <App> end-to-end and interact through the live UI using
 * userEvent — no mocked child components.  isDemoMode is forced to true so
 * the auth modal never blocks the board.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { useLayoutStore } from "@/store/layoutStore";
import { loadLayout } from "@/store/layoutStorage";

// Force demo mode so the auth modal does not open.
vi.mock("@/env", () => ({ isDemoMode: true, GITHUB_CLIENT_ID: undefined }));

// Lazy-import App AFTER the mock is in place.
const { App } = await import("./App");

function renderApp() {
  return render(<App />);
}

beforeEach(() => {
  // Clear persisted layout so each test starts from DEFAULT_COLUMNS.
  localStorage.clear();
  // Reset Zustand layout store so the fresh localStorage is re-read.
  useLayoutStore.setState({ columns: loadLayout() });
});

afterEach(cleanup);

// ─── 1. Demo board loads ────────────────────────────────────────────────────

describe("demo board loads", () => {
  it("renders the five default columns", async () => {
    renderApp();

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

// ─── 3. Column query editing ────────────────────────────────────────────────

describe("column query editing", () => {
  it("Add filter button opens the query editor in edit mode", async () => {
    const user = userEvent.setup();
    renderApp();

    const col = await screen.findByRole("region", { name: "CI / CD" });
    await user.click(within(col).getByRole("button", { name: /add filter/i }));

    expect(within(col).getByRole("textbox", { name: /filter query/i })).toBeTruthy();
  });

  it("cancelling Add filter hides the query editor", async () => {
    const user = userEvent.setup();
    renderApp();

    const col = await screen.findByRole("region", { name: "CI / CD" });
    await user.click(within(col).getByRole("button", { name: /add filter/i }));
    await user.click(within(col).getByRole("button", { name: /cancel/i }));

    expect(within(col).queryByRole("textbox")).toBeNull();
    expect(within(col).queryByRole("button", { name: /edit filter query/i })).toBeNull();
  });

  it("committing a query value persists it and shows the display button", async () => {
    const user = userEvent.setup();
    renderApp();

    const col = await screen.findByRole("region", { name: "CI / CD" });
    await user.click(within(col).getByRole("button", { name: /add filter/i }));

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
    await user.click(within(col).getByRole("button", { name: /add filter/i }));
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

  it("Add filter button is hidden once a query is set", async () => {
    const user = userEvent.setup();
    renderApp();

    const col = await screen.findByRole("region", { name: "CI / CD" });
    await user.click(within(col).getByRole("button", { name: /add filter/i }));
    await user.type(within(col).getByRole("textbox"), "repo:my-org/my-repo");
    await user.keyboard("{Enter}");

    expect(within(col).queryByRole("button", { name: /add filter/i })).toBeNull();
  });
});

// ─── 4. Remove column ───────────────────────────────────────────────────────

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
