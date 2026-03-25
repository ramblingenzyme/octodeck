import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/preact";
import { useColumnDragDrop } from "@/hooks/useColumnDragDrop";

const { mockDraggable, mockDropTarget } = vi.hoisted(() => ({
  mockDraggable: vi.fn(() => () => {}),
  mockDropTarget: vi.fn(() => () => {}),
}));

vi.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({
  draggable: mockDraggable,
  dropTargetForElements: mockDropTarget,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockDraggable.mockReturnValue(() => {});
  mockDropTarget.mockReturnValue(() => {});
});

// Test component that renders the hook's output as data attributes
function TestColumn({ columnId }: { columnId: string }) {
  const { ref, handleRef, isDragging, dropEdge } = useColumnDragDrop(columnId);
  return (
    <div
      ref={ref as any}
      data-testid="column"
      data-dragging={String(isDragging)}
      data-drop-edge={dropEdge ?? ""}
    >
      <button ref={handleRef} data-testid="handle" />
    </div>
  );
}

function getColumn() {
  return screen.getByTestId("column");
}

describe("useColumnDragDrop", () => {
  it("starts with isDragging=false and dropEdge=null", () => {
    render(<TestColumn columnId="col-1" />);
    expect(getColumn().dataset.dragging).toBe("false");
    expect(getColumn().dataset.dropEdge).toBe("");
  });

  it("registers draggable and drop target on mount", () => {
    render(<TestColumn columnId="col-1" />);
    expect(mockDraggable).toHaveBeenCalledOnce();
    expect(mockDropTarget).toHaveBeenCalledOnce();
  });

  it("provides columnId in draggable initial data", () => {
    render(<TestColumn columnId="col-abc" />);
    const opts = mockDraggable.mock.calls[0]![0];
    expect(opts.getInitialData()).toEqual({ columnId: "col-abc" });
  });

  it("provides columnId in drop target data", () => {
    render(<TestColumn columnId="col-abc" />);
    const opts = mockDropTarget.mock.calls[0]![0];
    expect(opts.getData()).toEqual({ columnId: "col-abc" });
  });

  it("canDrop returns false when source columnId matches own columnId", () => {
    render(<TestColumn columnId="col-abc" />);
    const opts = mockDropTarget.mock.calls[0]![0];
    expect(opts.canDrop({ source: { data: { columnId: "col-abc" } } })).toBe(false);
  });

  it("canDrop returns true when source columnId differs", () => {
    render(<TestColumn columnId="col-abc" />);
    const opts = mockDropTarget.mock.calls[0]![0];
    expect(opts.canDrop({ source: { data: { columnId: "col-xyz" } } })).toBe(true);
  });

  it("sets isDragging to true on drag start", () => {
    render(<TestColumn columnId="col-1" />);
    const opts = mockDraggable.mock.calls[0]![0];
    act(() => opts.onDragStart());
    expect(getColumn().dataset.dragging).toBe("true");
  });

  it("sets isDragging to false after drop", () => {
    render(<TestColumn columnId="col-1" />);
    const opts = mockDraggable.mock.calls[0]![0];
    act(() => opts.onDragStart());
    act(() => opts.onDrop());
    expect(getColumn().dataset.dragging).toBe("false");
  });

  it("sets dropEdge to 'right' when clientX is to the right of the element midpoint", () => {
    render(<TestColumn columnId="col-1" />);
    const opts = mockDropTarget.mock.calls[0]![0];
    // happy-dom returns all-zero getBoundingClientRect, so mid=0; any positive clientX → "right"
    act(() => opts.onDragEnter({ location: { current: { input: { clientX: 100 } } } }));
    expect(getColumn().dataset.dropEdge).toBe("right");
  });

  it("sets dropEdge to 'left' when clientX is to the left of the element midpoint", () => {
    render(<TestColumn columnId="col-1" />);
    const opts = mockDropTarget.mock.calls[0]![0];
    // clientX < mid (0) → "left"
    act(() => opts.onDragEnter({ location: { current: { input: { clientX: -1 } } } }));
    expect(getColumn().dataset.dropEdge).toBe("left");
  });

  it("updates dropEdge during drag", () => {
    render(<TestColumn columnId="col-1" />);
    const opts = mockDropTarget.mock.calls[0]![0];
    act(() => opts.onDrag({ location: { current: { input: { clientX: 100 } } } }));
    expect(getColumn().dataset.dropEdge).toBe("right");
  });

  it("sets dropEdge to null on drag leave", () => {
    render(<TestColumn columnId="col-1" />);
    const opts = mockDropTarget.mock.calls[0]![0];
    act(() => opts.onDragLeave());
    expect(getColumn().dataset.dropEdge).toBe("");
  });

  it("sets dropEdge to null on drop (drop target)", () => {
    render(<TestColumn columnId="col-1" />);
    const opts = mockDropTarget.mock.calls[0]![0];
    act(() => opts.onDrop());
    expect(getColumn().dataset.dropEdge).toBe("");
  });

  it("cleans up on unmount", () => {
    const cleanupDraggable = vi.fn();
    const cleanupDrop = vi.fn();
    mockDraggable.mockReturnValueOnce(cleanupDraggable);
    mockDropTarget.mockReturnValueOnce(cleanupDrop);

    const { unmount } = render(<TestColumn columnId="col-1" />);
    unmount();

    expect(cleanupDraggable).toHaveBeenCalled();
    expect(cleanupDrop).toHaveBeenCalled();
  });
});
