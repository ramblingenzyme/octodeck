import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/preact";
import { useEffect } from "preact/hooks";
import { useModal } from "@/hooks/useModal";

describe("useModal", () => {
  it("starts closed by default", () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBe(false);
  });

  it("starts open when initialOpen is true", () => {
    const { result } = renderHook(() => useModal(true));
    expect(result.current.isOpen).toBe(true);
  });

  it("open() sets isOpen to true", () => {
    const { result } = renderHook(() => useModal());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it("close() sets isOpen to false", () => {
    const { result } = renderHook(() => useModal(true));
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  // ─── Bug 2: close and open must be stable references ─────────────────────

  it("close reference is stable across re-renders (useCallback fix)", () => {
    const { result, rerender } = renderHook(() => useModal());
    const closeRef = result.current.close;

    act(() => result.current.open()); // trigger a re-render
    rerender();

    expect(result.current.close).toBe(closeRef);
  });

  it("open reference is stable across re-renders (useCallback fix)", () => {
    const { result, rerender } = renderHook(() => useModal());
    const openRef = result.current.open;

    rerender();

    expect(result.current.open).toBe(openRef);
  });
});

// ─── Bug 2: auth modal closes when auth becomes authed ──────────────────────
//
// App.tsx has:
//   useEffect(() => { if (auth.status === 'authed') authModal.close(); }, [auth.status, authModal.close])
//
// This tests that the effect correctly fires and closes the modal when the
// status transitions, with the now-stable authModal.close reference in deps.

describe("auth modal closes when status becomes authed (App.tsx effect)", () => {
  it("modal is open on idle, closes on authed", () => {
    const { result, rerender } = renderHook(
      ({ status }: { status: string }) => {
        const modal = useModal(status === "idle");
        const { close } = modal;
        useEffect(() => {
          if (status === "authed") close();
        }, [status, close]);
        return modal;
      },
      { initialProps: { status: "idle" } },
    );

    expect(result.current.isOpen).toBe(true);

    act(() => rerender({ status: "authed" }));

    expect(result.current.isOpen).toBe(false);
  });

  it("modal stays open while status is polling", () => {
    const { result, rerender } = renderHook(
      ({ status }: { status: string }) => {
        const modal = useModal(status === "idle");
        const { close } = modal;
        useEffect(() => {
          if (status === "authed") close();
        }, [status, close]);
        return modal;
      },
      { initialProps: { status: "idle" } },
    );

    act(() => rerender({ status: "polling" }));

    expect(result.current.isOpen).toBe(true);
  });

  it("effect re-runs correctly with stable close reference on each status change", () => {
    // Verifies that a stale closure cannot prevent the modal from closing.
    // Before the fix: close was a new function ref each render but missing from deps —
    // a re-render between idle→authed could leave a stale close in the closure.
    const { result, rerender } = renderHook(
      ({ status }: { status: string }) => {
        const modal = useModal(status === "idle");
        const { close } = modal;
        useEffect(() => {
          if (status === "authed") close();
        }, [status, close]);
        return modal;
      },
      { initialProps: { status: "idle" } },
    );

    // Simulate an unrelated re-render before auth completes
    act(() => rerender({ status: "idle" }));
    act(() => rerender({ status: "idle" }));

    // Auth completes
    act(() => rerender({ status: "authed" }));

    expect(result.current.isOpen).toBe(false);
  });
});
