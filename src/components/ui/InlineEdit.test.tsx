import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { InlineEdit } from "./InlineEdit";

afterEach(cleanup);

describe("InlineEdit display mode", () => {
  it("renders the value as a button", () => {
    render(<InlineEdit value="is:open author:me" onCommit={() => {}} />);
    expect(screen.getByRole("button", { name: /is:open author:me/i })).toBeTruthy();
  });

  it("does not show a textarea initially", () => {
    render(<InlineEdit value="is:open" onCommit={() => {}} aria-label="Filter query" />);
    expect(screen.queryByRole("textbox")).toBeNull();
  });
});

describe("InlineEdit switching to edit mode", () => {
  it("clicking the display button shows the textarea", async () => {
    const user = userEvent.setup();
    render(<InlineEdit value="is:open" onCommit={() => {}} aria-label="Filter query" />);
    await user.click(screen.getByRole("button", { name: /edit filter query/i }));
    expect(screen.getByRole("textbox", { name: /filter query/i })).toBeTruthy();
  });

  it("textarea is pre-filled with the current value", async () => {
    const user = userEvent.setup();
    render(<InlineEdit value="is:open author:me" onCommit={() => {}} aria-label="Filter query" />);
    await user.click(screen.getByRole("button", { name: /edit filter query/i }));
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("is:open author:me");
  });
});

describe("InlineEdit committing", () => {
  it("Enter calls onCommit with the draft value", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(<InlineEdit value="is:open" onCommit={onCommit} aria-label="Filter query" />);
    await user.click(screen.getByRole("button", { name: /edit filter query/i }));
    const textarea = screen.getByRole("textbox");
    await user.clear(textarea);
    await user.type(textarea, "is:open label:bug");
    await user.keyboard("{Enter}");
    expect(onCommit).toHaveBeenCalledWith("is:open label:bug");
  });

  it("clicking Confirm calls onCommit with the draft value", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(<InlineEdit value="is:open" onCommit={onCommit} aria-label="Filter query" />);
    await user.click(screen.getByRole("button", { name: /edit filter query/i }));
    const textarea = screen.getByRole("textbox");
    await user.clear(textarea);
    await user.type(textarea, "is:closed");
    await user.click(screen.getByRole("button", { name: /confirm/i }));
    expect(onCommit).toHaveBeenCalledWith("is:closed");
  });

  it("returns to display mode after committing", async () => {
    const user = userEvent.setup();
    render(<InlineEdit value="is:open" onCommit={() => {}} aria-label="Filter query" />);
    await user.click(screen.getByRole("button", { name: /edit filter query/i }));
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("textbox")).toBeNull();
  });
});

describe("InlineEdit cancelling", () => {
  it("Escape cancels and returns to display mode", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(<InlineEdit value="is:open" onCommit={onCommit} aria-label="Filter query" />);
    await user.click(screen.getByRole("button", { name: /edit filter query/i }));
    await user.keyboard("{Escape}");
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("clicking Cancel returns to display mode without calling onCommit", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(<InlineEdit value="is:open" onCommit={onCommit} aria-label="Filter query" />);
    await user.click(screen.getByRole("button", { name: /edit filter query/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).toBeNull();
  });
});
