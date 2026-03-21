import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/preact";
import { useCountdownTimer } from "./useCountdownTimer";

describe("useCountdownTimer", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("expiresAt = null → returns 0 immediately", () => {
    const { result } = renderHook(() => useCountdownTimer(null));
    expect(result.current).toBe(0);
  });

  it("expiresAt 30s in the future → returns ~30 immediately", () => {
    const expiresAt = Date.now() + 30_000;
    const { result } = renderHook(() => useCountdownTimer(expiresAt));
    expect(result.current).toBe(30);
  });

  it("expiresAt in the past → clamps to 0", () => {
    const expiresAt = Date.now() - 5_000;
    const { result } = renderHook(() => useCountdownTimer(expiresAt));
    expect(result.current).toBe(0);
  });

  it("after 1s tick, secondsLeft decrements by 1", () => {
    const expiresAt = Date.now() + 30_000;
    const { result } = renderHook(() => useCountdownTimer(expiresAt));
    expect(result.current).toBe(30);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(29);
  });

  it("interval is cleaned up on unmount (no state update after unmount)", () => {
    const expiresAt = Date.now() + 30_000;
    const { unmount } = renderHook(() => useCountdownTimer(expiresAt));
    unmount();
    // Advancing timers after unmount should not cause act warnings
    act(() => {
      vi.advanceTimersByTime(2000);
    });
  });
});
