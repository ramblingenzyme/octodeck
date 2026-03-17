import { describe, it, expect, beforeEach } from "vitest";
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

function addColumn(id: string, type: ColumnConfig["type"], title: string) {
  return mutateLayout((d) => { d.push({ id, type, title }); });
}

function removeColumn(id: string) {
  return mutateLayout((d) => { d.splice(d.findIndex((c) => c.id === id), 1); });
}

function moveLeft(id: string) {
  return mutateLayout((d) => {
    const i = d.findIndex((c) => c.id === id);
    if (i > 0) [d[i - 1], d[i]] = [d[i]!, d[i - 1]!];
  });
}

function moveRight(id: string) {
  return mutateLayout((d) => {
    const i = d.findIndex((c) => c.id === id);
    if (i >= 0 && i < d.length - 1) [d[i], d[i + 1]] = [d[i + 1]!, d[i]!];
  });
}

// ---

beforeEach(() => {
  stored = [
    { id: "a", type: "notifications", title: "Inbox" },
    { id: "b", type: "prs", title: "PRs" },
    { id: "c", type: "ci", title: "CI" },
  ];
});

describe("addColumn", () => {
  it("appends a new column", () => {
    const result = addColumn("d", "issues", "Issues");
    expect(result).toHaveLength(4);
    expect(result[3]).toEqual({ id: "d", type: "issues", title: "Issues" });
  });

  it("does not mutate the previous state", () => {
    const before = stored;
    addColumn("d", "issues", "Issues");
    expect(before).toHaveLength(3);
  });
});

describe("removeColumn", () => {
  it("removes the column with the given id", () => {
    const result = removeColumn("b");
    expect(result).toHaveLength(2);
    expect(result.find((c) => c.id === "b")).toBeUndefined();
  });

  it("preserves order of remaining columns", () => {
    const result = removeColumn("b");
    expect(result.map((c) => c.id)).toEqual(["a", "c"]);
  });
});

describe("moveLeft", () => {
  it("moves a column one position to the left", () => {
    const result = moveLeft("b");
    expect(result.map((c) => c.id)).toEqual(["b", "a", "c"]);
  });

  it("does not move the first column", () => {
    const result = moveLeft("a");
    expect(result.map((c) => c.id)).toEqual(["a", "b", "c"]);
  });

  it("preserves all column data after move", () => {
    const result = moveLeft("b");
    expect(result[0]).toEqual({ id: "b", type: "prs", title: "PRs" });
    expect(result[1]).toEqual({ id: "a", type: "notifications", title: "Inbox" });
  });

  it("produces no duplicate ids", () => {
    const result = moveLeft("b");
    const ids = result.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("moveRight", () => {
  it("moves a column one position to the right", () => {
    const result = moveRight("b");
    expect(result.map((c) => c.id)).toEqual(["a", "c", "b"]);
  });

  it("does not move the last column", () => {
    const result = moveRight("c");
    expect(result.map((c) => c.id)).toEqual(["a", "b", "c"]);
  });

  it("preserves all column data after move", () => {
    const result = moveRight("b");
    expect(result[1]).toEqual({ id: "c", type: "ci", title: "CI" });
    expect(result[2]).toEqual({ id: "b", type: "prs", title: "PRs" });
  });

  it("produces no duplicate ids", () => {
    const result = moveRight("b");
    const ids = result.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
