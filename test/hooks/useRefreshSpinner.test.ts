import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/preact";
import { useRefreshSpinner } from "@/hooks/useRefreshSpinner";

describe("useRefreshSpinner", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("spinning starts false", () => {
    const { result } = renderHook(() => useRefreshSpinner(false, vi.fn()));
    expect(result.current.spinning).toBe(false);
  });

  it("lastUpdated starts null", () => {
    const { result } = renderHook(() => useRefreshSpinner(false, vi.fn()));
    expect(result.current.lastUpdated).toBeNull();
  });

  it("handleRefresh calls refetch and sets spinning to true", () => {
    const refetch = vi.fn();
    const { result } = renderHook(() => useRefreshSpinner(false, refetch));

    act(() => result.current.handleRefresh());

    expect(refetch).toHaveBeenCalledOnce();
    expect(result.current.spinning).toBe(true);
  });

  // ─── Bug 1: spinner must not stop while isFetching is still true ────────────

  it("spinning stays true after 800 ms when isFetching is still true (bug fix)", () => {
    const { result, rerender } = renderHook(
      ({ isFetching }) => useRefreshSpinner(isFetching, vi.fn()),
      { initialProps: { isFetching: false } },
    );

    act(() => result.current.handleRefresh());
    rerender({ isFetching: true });

    // Old behaviour: spinner would have stopped here. New behaviour: it must not.
    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(result.current.spinning).toBe(true);
  });

  it("spinning stops after isFetching transitions from true to false", () => {
    const { result, rerender } = renderHook(
      ({ isFetching }) => useRefreshSpinner(isFetching, vi.fn()),
      { initialProps: { isFetching: false } },
    );

    act(() => result.current.handleRefresh());
    rerender({ isFetching: true });

    act(() => {
      vi.advanceTimersByTime(900);
    }); // fetch takes 900 ms
    act(() => rerender({ isFetching: false })); // fetch complete; effect schedules setTimeout(0)
    act(() => {
      vi.runAllTimers();
    }); // fire that timeout

    expect(result.current.spinning).toBe(false);
  });

  it("spinner respects minimum display time for fast fetches", () => {
    const { result, rerender } = renderHook(
      ({ isFetching }) => useRefreshSpinner(isFetching, vi.fn()),
      { initialProps: { isFetching: false } },
    );

    act(() => result.current.handleRefresh());
    rerender({ isFetching: true });

    // Fetch resolves quickly (200 ms elapsed)
    act(() => {
      vi.advanceTimersByTime(200);
    });
    act(() => rerender({ isFetching: false }));

    // Spinner should still be visible (minimum 800 ms not reached yet)
    act(() => {
      vi.advanceTimersByTime(400);
    }); // 600 ms elapsed total
    expect(result.current.spinning).toBe(true);

    // Advance past the 800 ms minimum
    act(() => {
      vi.advanceTimersByTime(300);
    }); // 900 ms elapsed total
    expect(result.current.spinning).toBe(false);
  });

  it("lastUpdated is set to the current time when fetch completes", () => {
    const now = new Date("2024-06-01T12:00:00Z");
    vi.setSystemTime(now);

    const { result, rerender } = renderHook(
      ({ isFetching }) => useRefreshSpinner(isFetching, vi.fn()),
      { initialProps: { isFetching: true } },
    );

    expect(result.current.lastUpdated).toBeNull();

    act(() => {
      rerender({ isFetching: false });
      vi.runAllTimers();
    });

    expect(result.current.lastUpdated).toEqual(now);
  });

  it("lastUpdated updates on each completed fetch", () => {
    const { result, rerender } = renderHook(
      ({ isFetching }) => useRefreshSpinner(isFetching, vi.fn()),
      { initialProps: { isFetching: false } },
    );

    // First fetch cycle
    rerender({ isFetching: true });
    vi.setSystemTime(new Date("2024-01-01T10:00:00Z"));
    act(() => {
      rerender({ isFetching: false });
      vi.runAllTimers();
    });
    const first = result.current.lastUpdated;

    // Second fetch cycle
    rerender({ isFetching: true });
    vi.setSystemTime(new Date("2024-01-01T10:05:00Z"));
    act(() => {
      rerender({ isFetching: false });
      vi.runAllTimers();
    });
    const second = result.current.lastUpdated;

    expect(second!.getTime()).toBeGreaterThan(first!.getTime());
  });
});
