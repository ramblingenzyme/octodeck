import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/preact";
afterEach(cleanup);
import userEvent from "@testing-library/user-event";
import { DemoColumn } from "@/demo/DemoColumn";
import type { ColumnConfig } from "@/types";

const noop = () => {};

function makeCol(type: ColumnConfig["type"], title = "Test Column"): ColumnConfig {
  return { id: "col-1", type, title };
}

function renderColumn(
  col: ColumnConfig,
  overrides: Partial<{
    onRemove: (id: string) => void;
  }> = {},
) {
  return render(<DemoColumn col={col} onRemove={overrides.onRemove ?? noop} />);
}

describe("Column card type switching", () => {
  it("renders PR cards for prs type", async () => {
    renderColumn(makeCol("prs", "PRs"));
    expect((await screen.findAllByRole("article")).length).toBeGreaterThan(0);
  });

  it("renders Issue cards for issues type", async () => {
    renderColumn(makeCol("issues", "Issues"));
    expect((await screen.findAllByRole("article")).length).toBeGreaterThan(0);
  });

  it("renders CI cards for ci type", async () => {
    renderColumn(makeCol("ci", "CI"));
    expect((await screen.findAllByRole("article")).length).toBeGreaterThan(0);
  });

  it("renders Activity cards for activity type", async () => {
    renderColumn(makeCol("activity", "Activity"));
    expect((await screen.findAllByRole("article")).length).toBeGreaterThan(0);
  });
});

describe("Column header", () => {
  it("shows the column title", async () => {
    renderColumn(makeCol("prs", "My Pull Requests"));
    expect((await screen.findAllByText("My Pull Requests")).length).toBeGreaterThan(0);
  });
});

describe("Column remove confirmation", () => {
  it("calls onRemove after confirming removal", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    renderColumn(makeCol("prs", "My PRs"), { onRemove });

    await user.click(await screen.findByRole("button", { name: /remove column/i }));
    expect(screen.getByRole("alertdialog")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /yes, remove/i }));
    expect(onRemove).toHaveBeenCalledWith("col-1");
  });
});
