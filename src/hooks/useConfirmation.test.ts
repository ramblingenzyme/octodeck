import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/preact";
import { useConfirmation } from "./useConfirmation";

describe("useConfirmation", () => {
  it("starts with isConfirming false", () => {
    const { result } = renderHook(() => useConfirmation());
    expect(result.current.isConfirming).toBe(false);
  });

  it("startConfirm sets isConfirming to true", () => {
    const { result } = renderHook(() => useConfirmation());
    act(() => result.current.startConfirm());
    expect(result.current.isConfirming).toBe(true);
  });

  it("cancelConfirm sets isConfirming back to false", () => {
    const { result } = renderHook(() => useConfirmation());
    act(() => result.current.startConfirm());
    act(() => result.current.cancelConfirm());
    expect(result.current.isConfirming).toBe(false);
  });
});
