import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/preact";
afterEach(cleanup);
import userEvent from "@testing-library/user-event";
import { Board } from "@/components/Board";
import type { ColumnConfig } from "@/types";

const noop = () => {};

const SAMPLE_COLUMNS: ColumnConfig[] = [
  { id: "col-1", type: "prs", title: "PRs" },
  { id: "col-2", type: "issues", title: "Issues" },
];

function wrap(ui: preact.ComponentChild) {
  return render(ui);
}

describe("Board", () => {
  it('shows empty state with "Add your first column" button when columns is empty', () => {
    wrap(<Board columns={[]} onAddColumn={noop} onRemove={noop} />);
    expect(screen.getByText(/no columns yet/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /add your first column/i })).toBeTruthy();
  });

  it('"Add a column" button in empty state calls onAddColumn', async () => {
    const user = userEvent.setup();
    const onAddColumn = vi.fn();
    wrap(<Board columns={[]} onAddColumn={onAddColumn} onRemove={noop} />);
    await user.click(screen.getByRole("button", { name: /add your first column/i }));
    expect(onAddColumn).toHaveBeenCalled();
  });

  it("renders one column per entry in columns", async () => {
    wrap(<Board columns={SAMPLE_COLUMNS} onAddColumn={noop} onRemove={noop} />);
    expect(await screen.findByRole("region", { name: "PRs" })).toBeTruthy();
    expect(await screen.findByRole("region", { name: "Issues" })).toBeTruthy();
  });
});
