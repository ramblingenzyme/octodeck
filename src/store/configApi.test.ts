import { describe, it, expect, beforeEach } from "vitest";
import type { ColumnConfig } from "@/types";
import { applyAdd, applyRemove, applyReorder, applyUpdateQuery } from "./layoutMutations";

let cols: ColumnConfig[];

beforeEach(() => {
  cols = [
    { id: "a", type: "notifications", title: "Inbox" },
    { id: "b", type: "prs", title: "PRs" },
    { id: "c", type: "ci", title: "CI" },
  ];
});

describe("applyAdd", () => {
  it("appends a new column", () => {
    const result = applyAdd(cols, "d", "issues", "Issues");
    expect(result).toHaveLength(4);
    expect(result[3]).toEqual({ id: "d", type: "issues", title: "Issues" });
  });

  it("includes query when provided", () => {
    const result = applyAdd(cols, "d", "prs", "My PRs", "author:me");
    expect(result[3]).toEqual({ id: "d", type: "prs", title: "My PRs", query: "author:me" });
  });

  it("does not mutate the original array", () => {
    applyAdd(cols, "d", "issues", "Issues");
    expect(cols).toHaveLength(3);
  });
});

describe("applyRemove", () => {
  it("removes the column with the given id", () => {
    const result = applyRemove(cols, "b");
    expect(result).toHaveLength(2);
    expect(result.find((c) => c.id === "b")).toBeUndefined();
  });

  it("preserves order of remaining columns", () => {
    const result = applyRemove(cols, "b");
    expect(result.map((c) => c.id)).toEqual(["a", "c"]);
  });

  it("is a no-op when id does not exist", () => {
    const result = applyRemove(cols, "nonexistent");
    expect(result.map((c) => c.id)).toEqual(["a", "b", "c"]);
  });
});

describe("applyReorder", () => {
  it("moves forward (from < to)", () => {
    const result = applyReorder(cols, 0, 2);
    expect(result.map((c) => c.id)).toEqual(["b", "c", "a"]);
  });

  it("moves backward (from > to)", () => {
    const result = applyReorder(cols, 2, 0);
    expect(result.map((c) => c.id)).toEqual(["c", "a", "b"]);
  });

  it("is a no-op when same index", () => {
    const result = applyReorder(cols, 1, 1);
    expect(result.map((c) => c.id)).toEqual(["a", "b", "c"]);
  });

  it("preserves column data", () => {
    const result = applyReorder(cols, 1, 0);
    expect(result[0]).toEqual({ id: "b", type: "prs", title: "PRs" });
    expect(result[1]).toEqual({ id: "a", type: "notifications", title: "Inbox" });
  });

  it("produces no duplicate ids", () => {
    const result = applyReorder(cols, 0, 2);
    const ids = result.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("applyUpdateQuery", () => {
  it("sets the query on the matching column", () => {
    const result = applyUpdateQuery(cols, "b", "author:me");
    expect(result.find((c) => c.id === "b")?.query).toBe("author:me");
  });

  it("clears query when empty string is given", () => {
    const withQuery = applyUpdateQuery(cols, "b", "author:me");
    const result = applyUpdateQuery(withQuery, "b", "");
    expect(result.find((c) => c.id === "b")?.query).toBeUndefined();
  });

  it("is a no-op when id does not exist", () => {
    const result = applyUpdateQuery(cols, "nonexistent", "foo");
    expect(result).toEqual(cols);
  });
});
