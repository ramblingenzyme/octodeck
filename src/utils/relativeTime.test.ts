import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatAge } from "./relativeTime";

const NOW = new Date("2024-06-15T12:00:00Z").getTime();

function isoAgo(ms: number): string {
  return new Date(NOW - ms).toISOString();
}

describe("formatAge", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "1m" for very recent timestamps (< 60s)', () => {
    expect(formatAge(isoAgo(30_000))).toBe("1m");
  });

  it('returns "1m" for exactly 0 seconds ago', () => {
    expect(formatAge(isoAgo(0))).toBe("1m");
  });

  it('returns "5m" for 5 minutes ago', () => {
    expect(formatAge(isoAgo(5 * 60_000))).toBe("5m");
  });

  it('returns "59m" for 59 minutes ago', () => {
    expect(formatAge(isoAgo(59 * 60_000))).toBe("59m");
  });

  it('returns "2h" for 2 hours ago', () => {
    expect(formatAge(isoAgo(2 * 60 * 60_000))).toBe("2h");
  });

  it('returns "23h" for 23 hours ago', () => {
    expect(formatAge(isoAgo(23 * 60 * 60_000))).toBe("23h");
  });

  it('returns "3d" for 3 days ago', () => {
    expect(formatAge(isoAgo(3 * 24 * 60 * 60_000))).toBe("3d");
  });

  it('returns "29d" for 29 days ago', () => {
    expect(formatAge(isoAgo(29 * 24 * 60 * 60_000))).toBe("29d");
  });

  it('returns "2mo" for 60 days ago', () => {
    expect(formatAge(isoAgo(60 * 24 * 60 * 60_000))).toBe("2mo");
  });
});
