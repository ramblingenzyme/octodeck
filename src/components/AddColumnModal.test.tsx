import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

afterEach(cleanup);
import userEvent from "@testing-library/user-event";
import { AddColumnModal } from "./AddColumnModal";
import { COLUMN_TYPES } from "@/constants";

const noop = () => {};

describe("AddColumnModal", () => {
  it("renders the modal when mounted", () => {
    render(<AddColumnModal onAdd={noop} onClose={noop} />);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("title input defaults to the label of the initially selected type (prs)", () => {
    render(<AddColumnModal onAdd={noop} onClose={noop} />);
    const input = screen.getByLabelText(/column title/i) as HTMLInputElement;
    expect(input.value).toBe(COLUMN_TYPES["prs"].label);
  });

  it("title input can be changed by the user", async () => {
    const user = userEvent.setup();
    render(<AddColumnModal onAdd={noop} onClose={noop} />);
    const input = screen.getByLabelText(/column title/i) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "Custom Title");
    expect(input.value).toBe("Custom Title");
  });

  it("clicking a type button updates the title to that type label", async () => {
    const user = userEvent.setup();
    render(<AddColumnModal onAdd={noop} onClose={noop} />);
    await user.click(
      screen.getByRole("button", { name: new RegExp(COLUMN_TYPES["issues"].label, "i") }),
    );
    const input = screen.getByLabelText(/column title/i) as HTMLInputElement;
    expect(input.value).toBe(COLUMN_TYPES["issues"].label);
  });

  it("submitting the form calls onAdd with selected type and title", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddColumnModal onAdd={onAdd} onClose={noop} />);
    await user.click(screen.getByRole("button", { name: /add column/i }));
    expect(onAdd).toHaveBeenCalledWith(
      "prs",
      COLUMN_TYPES["prs"].label,
      COLUMN_TYPES["prs"].defaultQuery,
    );
  });

  it("ESC keydown calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddColumnModal onAdd={noop} onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("clicking the backdrop calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddColumnModal onAdd={noop} onClose={onClose} />);
    await user.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalled();
  });
});
