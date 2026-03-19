import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/preact";
import { Provider } from "react-redux";
import { store } from "@/store";

afterEach(cleanup);
import userEvent from "@testing-library/user-event";
import { Board } from "./Board";
import type { ColumnConfig } from "@/types";

const noop = () => {};

const SAMPLE_COLUMNS: ColumnConfig[] = [
  { id: "col-1", type: "prs", title: "PRs" },
  { id: "col-2", type: "issues", title: "Issues" },
];

describe("Board", () => {
  it('shows empty state with "Add your first column" button when columns is empty', () => {
    render(
      <Provider store={store}>
        <Board columns={[]} onAddColumn={noop} onRemove={noop} />
      </Provider>,
    );
    expect(screen.getByText(/no columns yet/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /add your first column/i })).toBeTruthy();
  });

  it('"Add a column" button in empty state calls onAddColumn', async () => {
    const user = userEvent.setup();
    const onAddColumn = vi.fn();
    render(
      <Provider store={store}>
        <Board columns={[]} onAddColumn={onAddColumn} onRemove={noop} />
      </Provider>,
    );
    await user.click(screen.getByRole("button", { name: /add your first column/i }));
    expect(onAddColumn).toHaveBeenCalled();
  });

  it("renders one column per entry in columns", () => {
    render(
      <Provider store={store}>
        <Board columns={SAMPLE_COLUMNS} onAddColumn={noop} onRemove={noop} />
      </Provider>,
    );
    expect(screen.getByRole("region", { name: "PRs" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Issues" })).toBeTruthy();
  });
});
