import { describe, it, expect } from "vitest";
import {
  applyAdd,
  applyRemove,
  applyReorder,
  applyUpdateQuery,
  applyUpdateTitle,
  applyUpdateRepos,
} from "@/store/layoutMutations";
import type { ColumnConfig } from "@/types";

const col = (id: string, overrides: Partial<ColumnConfig> = {}): ColumnConfig => ({
  id,
  type: "prs",
  title: `Column ${id}`,
  ...overrides,
});

describe("applyAdd", () => {
  it("appends a new column", () => {
    const result = applyAdd([col("a")], "b", "issues", "Issues");
    expect(result).toHaveLength(2);
    expect(result[1]!.id).toBe("b");
    expect(result[1]!.type).toBe("issues");
  });

  it("includes query when provided", () => {
    const result = applyAdd([], "b", "prs", "PRs", "author:me");
    expect(result[0]!.query).toBe("author:me");
  });

  it("omits query key when query is empty string", () => {
    const result = applyAdd([], "b", "prs", "PRs", "");
    expect("query" in result[0]!).toBe(false);
  });

  it("includes repos when provided", () => {
    const result = applyAdd([], "b", "ci", "CI", undefined, ["org/repo"]);
    expect(result[0]!.repos).toEqual(["org/repo"]);
  });

  it("omits repos key when repos array is empty", () => {
    const result = applyAdd([], "b", "ci", "CI", undefined, []);
    expect("repos" in result[0]!).toBe(false);
  });

  it("does not mutate the original array", () => {
    const original = [col("a")];
    applyAdd(original, "b", "prs", "PRs");
    expect(original).toHaveLength(1);
  });
});

describe("applyRemove", () => {
  it("removes the column with the given id", () => {
    const result = applyRemove([col("a"), col("b"), col("c")], "b");
    expect(result.map((c) => c.id)).toEqual(["a", "c"]);
  });

  it("returns unchanged array when id is not found", () => {
    const cols = [col("a"), col("b")];
    const result = applyRemove(cols, "z");
    expect(result).toHaveLength(2);
  });

  it("does not mutate the original array", () => {
    const original = [col("a"), col("b")];
    applyRemove(original, "a");
    expect(original).toHaveLength(2);
  });
});

describe("applyReorder", () => {
  it("moves a column forward", () => {
    const result = applyReorder([col("a"), col("b"), col("c")], 0, 2);
    expect(result.map((c) => c.id)).toEqual(["b", "c", "a"]);
  });

  it("moves a column backward", () => {
    const result = applyReorder([col("a"), col("b"), col("c")], 2, 0);
    expect(result.map((c) => c.id)).toEqual(["c", "a", "b"]);
  });

  it("moving to same index is a no-op", () => {
    const result = applyReorder([col("a"), col("b")], 0, 0);
    expect(result.map((c) => c.id)).toEqual(["a", "b"]);
  });
});

describe("applyUpdateQuery", () => {
  it("sets the query on the matching column", () => {
    const result = applyUpdateQuery([col("a"), col("b")], "a", "author:me");
    expect(result[0]!.query).toBe("author:me");
    expect(result[1]!.query).toBeUndefined();
  });

  it("sets query to undefined when query is empty string", () => {
    const result = applyUpdateQuery([col("a", { query: "old" })], "a", "");
    expect(result[0]!.query).toBeUndefined();
  });

  it("leaves other columns unchanged when id not found", () => {
    const cols = [col("a", { query: "old" })];
    const result = applyUpdateQuery(cols, "z", "new");
    expect(result[0]!.query).toBe("old");
  });
});

describe("applyUpdateTitle", () => {
  it("updates the title on the matching column", () => {
    const result = applyUpdateTitle([col("a"), col("b")], "a", "New Title");
    expect(result[0]!.title).toBe("New Title");
    expect(result[1]!.title).toBe("Column b");
  });

  it("leaves other columns unchanged when id not found", () => {
    const cols = [col("a")];
    const result = applyUpdateTitle(cols, "z", "New Title");
    expect(result[0]!.title).toBe("Column a");
  });
});

describe("applyUpdateRepos", () => {
  it("sets repos on the matching column", () => {
    const result = applyUpdateRepos([col("a")], "a", ["org/repo"]);
    expect(result[0]!.repos).toEqual(["org/repo"]);
  });

  it("sets repos to undefined when repos array is empty", () => {
    const result = applyUpdateRepos([col("a", { repos: ["org/repo"] })], "a", []);
    expect(result[0]!.repos).toBeUndefined();
  });

  it("leaves other columns unchanged when id not found", () => {
    const cols = [col("a", { repos: ["org/repo"] })];
    const result = applyUpdateRepos(cols, "z", ["other/repo"]);
    expect(result[0]!.repos).toEqual(["org/repo"]);
  });
});
