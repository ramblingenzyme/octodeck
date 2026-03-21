import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/preact";
import { useMinuteTicker } from "./useMinuteTicker";

afterEach(() => {
  vi.useRealTimers();
});

describe("useMinuteTicker", () => {
  it("triggers a re-render after 60 seconds", () => {
    vi.useFakeTimers();

    let renderCount = 0;
    const { result: _ } = renderHook(() => {
      renderCount++;
      useMinuteTicker();
    });

    const countBefore = renderCount;
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(renderCount).toBeGreaterThan(countBefore);
  });

  it("does not error after unmount when timer fires", () => {
    vi.useFakeTimers();

    const { unmount } = renderHook(() => useMinuteTicker());
    unmount();

    // Should not throw or warn about updating unmounted component
    expect(() => vi.runAllTimers()).not.toThrow();
  });
});
