/**
 * E2E-style integration tests for <DemoApp>.
 * All data is client-side — no auth required.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { useLayoutStore } from "@/store/layoutStore";
import { DEMO_COLUMNS } from "@/constants";

vi.mock("@/env", () => ({ isDemo: true }));

vi.mock("@/auth/oauthFlow", () => ({
  fetchSession: vi.fn(),
  logoutSession: vi.fn(),
  redirectToGitHub: vi.fn(),
  refreshSession: vi.fn(),
}));

// Lazy-import after mocks are in place.
const { DemoApp } = await import("@/components/DemoApp");

function renderDemoApp() {
  return render(<DemoApp />);
}

beforeEach(() => {
  useLayoutStore.setState({ columns: DEMO_COLUMNS });
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
  it("renders all six demo columns", async () => {
    renderDemoApp();

    expect(await screen.findByRole("region", { name: "Pull Requests" })).toBeTruthy();
    expect(await screen.findByRole("region", { name: "Issues" })).toBeTruthy();
    expect(await screen.findByRole("region", { name: "CI / CD" })).toBeTruthy();
    expect(await screen.findByRole("region", { name: "Activity" })).toBeTruthy();
    expect(await screen.findByRole("region", { name: "Releases" })).toBeTruthy();
    expect(await screen.findByRole("region", { name: "Deployments" })).toBeTruthy();
  });

  it("each column contains at least one card", async () => {
    renderDemoApp();

    await screen.findByRole("region", { name: "Pull Requests" }); // wait for columns

    for (const name of [
      "Pull Requests",
      "Issues",
      "CI / CD",
      "Activity",
      "Releases",
      "Deployments",
    ]) {
      const col = screen.getByRole("region", { name });
      expect(within(col).getAllByRole("article").length).toBeGreaterThan(0);
    }
  });
});

// ─── 2. Add column ──────────────────────────────────────────────────────────

describe("add column flow", () => {
  it("new column appears after completing the Add Column modal", async () => {
    const user = userEvent.setup();
    renderDemoApp();

    await screen.findByRole("region", { name: "Pull Requests" }); // wait for board

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
    renderDemoApp();

    const col = await screen.findByRole("region", { name: "CI / CD" });
    await user.click(within(col).getByRole("button", { name: /edit filter query/i }));

    expect(within(col).getByRole("textbox", { name: /filter query/i })).toBeTruthy();
  });

  it("cancelling the editor returns to display mode", async () => {
    const user = userEvent.setup();
    renderDemoApp();

    const col = await screen.findByRole("region", { name: "CI / CD" });
    await user.click(within(col).getByRole("button", { name: /edit filter query/i }));
    await user.click(within(col).getByRole("button", { name: /cancel/i }));

    expect(within(col).queryByRole("textbox")).toBeNull();
    expect(within(col).getByRole("button", { name: /edit filter query/i })).toBeTruthy();
  });

  it("committing a query value persists it and returns to display mode", async () => {
    const user = userEvent.setup();
    renderDemoApp();

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
    renderDemoApp();

    const col = await screen.findByRole("region", { name: "CI / CD" });
    await user.click(within(col).getByRole("button", { name: /edit filter query/i }));
    await user.type(within(col).getByRole("textbox"), "repo:my-org/my-repo");
    await user.keyboard("{Enter}");

    const { columns } = useLayoutStore.getState();
    expect(columns.find((c) => c.title === "CI / CD")?.query).toBe("repo:my-org/my-repo");
  });

  it("existing query can be edited and updated", async () => {
    const user = userEvent.setup();
    renderDemoApp();

    const col = await screen.findByRole("region", { name: "Pull Requests" });
    await user.click(within(col).getByRole("button", { name: /edit filter query/i }));
    const textarea = within(col).getByRole("textbox") as HTMLTextAreaElement;
    await user.clear(textarea);
    await user.type(textarea, "author:octocat");
    await user.keyboard("{Enter}");

    expect(useLayoutStore.getState().columns.find((c) => c.title === "Pull Requests")?.query).toBe(
      "author:octocat",
    );
  });
});

// ─── 4. Remove column ───────────────────────────────────────────────────────

describe("remove column flow", () => {
  it("column disappears after confirming removal", async () => {
    const user = userEvent.setup();
    renderDemoApp();

    await screen.findByRole("region", { name: "Pull Requests" }); // wait for board

    const ciCol = screen.getByRole("region", { name: "CI / CD" });
    expect(ciCol).toBeTruthy();

    await user.click(within(ciCol).getByRole("button", { name: /remove column/i }));

    const confirmBtn = within(ciCol).getByRole("button", { name: /yes, remove/i });
    await user.click(confirmBtn);

    expect(screen.queryByRole("region", { name: "CI / CD" })).toBeNull();
  });
});
