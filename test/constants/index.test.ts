import { describe, it, expect } from "vitest";
import { mkId } from "@/constants";

describe("mkId", () => {
  it("returns a non-empty string", () => {
    const id = mkId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("produces no duplicates across many calls", () => {
    const ids = Array.from({ length: 50 }, () => mkId());
    const unique = new Set(ids);
    expect(unique.size).toBe(50);
  });
});
