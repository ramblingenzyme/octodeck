import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { ColumnSettingsModal } from "@/components/ColumnSettingsModal";
import type { ColumnConfig } from "@/types";

afterEach(cleanup);

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
  HTMLElement.prototype.showPopover = vi.fn();
  HTMLElement.prototype.hidePopover = vi.fn();
});

vi.mock("@/store/layoutStore", () => ({
  useLayoutStore: (selector: any) =>
    selector({
      updateColumnTitle: vi.fn(),
      updateColumnQuery: vi.fn(),
      updateColumnRepos: vi.fn(),
    }),
}));

vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector: any) => selector({ token: null }),
}));

vi.mock("@/store/githubQueries", () => ({
  useGetUserRepos: () => ({ data: undefined }),
}));

const noop = () => {};

const col: ColumnConfig = {
  id: "col-1",
  type: "prs",
  title: "My PRs",
  query: "is:open",
};


describe("ColumnSettingsModal", () => {
  it("title input shows the current column title", () => {
    render(<ColumnSettingsModal open={true} col={col} onClose={noop} />);
    const input = screen.getByLabelText(/title/i) as HTMLInputElement;
    expect(input.value).toBe("My PRs");
  });

  it("query input shows the current column query", () => {
    render(<ColumnSettingsModal open={true} col={col} onClose={noop} />);
    const input = screen.getByLabelText(/filter query/i) as HTMLInputElement;
    expect(input.value).toBe("is:open");
  });

  it("unsaved edits to the query field are discarded when the modal is closed and reopened", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ColumnSettingsModal open={true} col={col} onClose={noop} />);

    const input = screen.getByLabelText(/filter query/i) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "unsaved changes");
    expect(input.value).toBe("unsaved changes");

    // Close the modal
    rerender(<ColumnSettingsModal open={false} col={col} onClose={noop} />);
    // Reopen
    rerender(<ColumnSettingsModal open={true} col={col} onClose={noop} />);

    const resetInput = screen.getByLabelText(/filter query/i) as HTMLInputElement;
    expect(resetInput.value).toBe("is:open");
  });

  it("unsaved edits to the title field are discarded when the modal is closed and reopened", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ColumnSettingsModal open={true} col={col} onClose={noop} />);

    const input = screen.getByLabelText(/title/i) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "unsaved title");
    expect(input.value).toBe("unsaved title");

    rerender(<ColumnSettingsModal open={false} col={col} onClose={noop} />);
    rerender(<ColumnSettingsModal open={true} col={col} onClose={noop} />);

    const resetInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    expect(resetInput.value).toBe("My PRs");
  });

});
