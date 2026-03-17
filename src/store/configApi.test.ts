import { describe, it, expect, beforeEach, vi } from "vitest";
import { produce } from "immer";
import type { ColumnConfig } from "@/types";

// --- helpers mirroring the logic in configApi.ts ---

let stored: ColumnConfig[] = [];
const loadLayout = () => stored;
const saveLayout = (c: ColumnConfig[]) => { stored = c; };

function mutateLayout(fn: (draft: ColumnConfig[]) => void): ColumnConfig[] {
  const next = produce(loadLayout(), fn);
  saveLayout(next);
  return next;
}

function addColumn(id: number, type: ColumnConfig["type"], title: string) {
  return mutateLayout((d) => { d.push({ id, type, title }); });
}

function removeColumn(id: number) {
  return mutateLayout((d) => { d.splice(d.findIndex((c) => c.id === id), 1); });
}

function moveLeft(id: number) {
  return mutateLayout((d) => {
    const i = d.findIndex((c) => c.id === id);
    if (i > 0) [d[i - 1], d[i]] = [d[i]!, d[i - 1]!];
  });
}

function moveRight(id: number) {
  return mutateLayout((d) => {
    const i = d.findIndex((c) => c.id === id);
    if (i >= 0 && i < d.length - 1) [d[i], d[i + 1]] = [d[i + 1]!, d[i]!];
  });
}

// ---

beforeEach(() => {
  stored = [
    { id: 1, type: "notifications", title: "Inbox" },
    { id: 2, type: "prs", title: "PRs" },
    { id: 3, type: "ci", title: "CI" },
  ];
});

describe("addColumn", () => {
  it("appends a new column", () => {
    const result = addColumn(4, "issues", "Issues");
    expect(result).toHaveLength(4);
    expect(result[3]).toEqual({ id: 4, type: "issues", title: "Issues" });
  });

  it("does not mutate the previous state", () => {
    const before = stored;
    addColumn(4, "issues", "Issues");
    expect(before).toHaveLength(3);
  });
});

describe("removeColumn", () => {
  it("removes the column with the given id", () => {
    const result = removeColumn(2);
    expect(result).toHaveLength(2);
    expect(result.find((c) => c.id === 2)).toBeUndefined();
  });

  it("preserves order of remaining columns", () => {
    const result = removeColumn(2);
    expect(result.map((c) => c.id)).toEqual([1, 3]);
  });
});

describe("moveLeft", () => {
  it("moves a column one position to the left", () => {
    const result = moveLeft(2);
    expect(result.map((c) => c.id)).toEqual([2, 1, 3]);
  });

  it("does not move the first column", () => {
    const result = moveLeft(1);
    expect(result.map((c) => c.id)).toEqual([1, 2, 3]);
  });

  it("preserves all column data after move", () => {
    const result = moveLeft(2);
    expect(result[0]).toEqual({ id: 2, type: "prs", title: "PRs" });
    expect(result[1]).toEqual({ id: 1, type: "notifications", title: "Inbox" });
  });

  it("produces no duplicate ids", () => {
    const result = moveLeft(2);
    const ids = result.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("moveRight", () => {
  it("moves a column one position to the right", () => {
    const result = moveRight(2);
    expect(result.map((c) => c.id)).toEqual([1, 3, 2]);
  });

  it("does not move the last column", () => {
    const result = moveRight(3);
    expect(result.map((c) => c.id)).toEqual([1, 2, 3]);
  });

  it("preserves all column data after move", () => {
    const result = moveRight(2);
    expect(result[1]).toEqual({ id: 3, type: "ci", title: "CI" });
    expect(result[2]).toEqual({ id: 2, type: "prs", title: "PRs" });
  });

  it("produces no duplicate ids", () => {
    const result = moveRight(2);
    const ids = result.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
