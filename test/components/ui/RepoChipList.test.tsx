import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { RepoChipList } from "@/components/ui/RepoChipList";

afterEach(cleanup);

// Stub Popover API methods not implemented by happy-dom
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn();
  HTMLElement.prototype.hidePopover = vi.fn();
});

const noop = () => {};

describe("RepoChipList", () => {
  it("renders a chip for each repo in repos", () => {
    render(<RepoChipList repos={["foo/bar", "baz/qux"]} onAdd={noop} onRemove={noop} />);
    expect(screen.getByText("foo/bar")).toBeTruthy();
    expect(screen.getByText("baz/qux")).toBeTruthy();
  });

  it("clicking the remove button calls onRemove with the repo", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<RepoChipList repos={["foo/bar"]} onAdd={noop} onRemove={onRemove} />);
    await user.click(screen.getByRole("button", { name: /remove foo\/bar/i }));
    expect(onRemove).toHaveBeenCalledWith("foo/bar");
  });

  it("pressing Enter with a valid owner/repo calls onAdd and clears the input", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<RepoChipList repos={[]} onAdd={onAdd} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i }) as HTMLInputElement;
    await user.type(input, "owner/repo{Enter}");
    expect(onAdd).toHaveBeenCalledWith("owner/repo");
    expect(input.value).toBe("");
  });

  it("pressing Enter without a slash does not call onAdd", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<RepoChipList repos={[]} onAdd={onAdd} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "noslash{Enter}");
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("pressing Enter with an already-added repo does not call onAdd", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<RepoChipList repos={["owner/repo"]} onAdd={onAdd} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i });
    await user.type(input, "owner/repo{Enter}");
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("input is empty on each mount — partial text does not persist across remounts", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<RepoChipList repos={[]} onAdd={noop} onRemove={noop} />);
    const input = screen.getByRole("textbox", { name: /add repository/i }) as HTMLInputElement;
    await user.type(input, "owner/partial");
    expect(input.value).toBe("owner/partial");

    unmount();

    render(<RepoChipList repos={[]} onAdd={noop} onRemove={noop} />);
    const freshInput = screen.getByRole("textbox", {
      name: /add repository/i,
    }) as HTMLInputElement;
    expect(freshInput.value).toBe("");
  });

  it("already-added repos are excluded from suggestions", () => {
    render(
      <RepoChipList
        repos={["owner/already"]}
        suggestions={["owner/already", "owner/other"]}
        onAdd={noop}
        onRemove={noop}
      />,
    );
    // The datalist/menu options should not contain the already-added repo
    const options = document.querySelectorAll('[role="option"]');
    const labels = Array.from(options).map((o) => o.textContent);
    expect(labels).not.toContain("owner/already");
    expect(labels).toContain("owner/other");
  });
});
