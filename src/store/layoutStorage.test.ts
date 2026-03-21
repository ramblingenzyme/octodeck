import { describe, it, expect, beforeEach } from "vitest";
import { loadLayout, saveLayout } from "./layoutStorage";
import { DEFAULT_COLUMNS } from "@/constants";
import type { ColumnConfig } from "@/types";

const STORAGE_KEY = "gh-deck:layout";

beforeEach(() => {
  localStorage.clear();
});

describe("loadLayout", () => {
  it("returns DEFAULT_COLUMNS when localStorage is empty", () => {
    expect(loadLayout()).toEqual(DEFAULT_COLUMNS);
  });

  it("returns DEFAULT_COLUMNS when localStorage contains invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not-json{{{");
    expect(loadLayout()).toEqual(DEFAULT_COLUMNS);
  });

  it("returns stored columns when valid JSON is present", () => {
    const cols: ColumnConfig[] = [{ id: "col-1", type: "prs", title: "My PRs" }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cols));
    expect(loadLayout()).toEqual(cols);
  });

  it("returns DEFAULT_COLUMNS when localStorage contains valid JSON that is not an array", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: "an array" }));
    expect(loadLayout()).toEqual(DEFAULT_COLUMNS);
  });

  it("migrates old repos field to query string", () => {
    const old = [{ id: "col-1", type: "ci", title: "CI", repos: ["acme/api", "acme/worker"] }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old));
    expect(loadLayout()).toEqual([
      { id: "col-1", type: "ci", title: "CI", query: "repo:acme/api repo:acme/worker" },
    ]);
  });
});

describe("saveLayout + loadLayout round-trip", () => {
  it("persists and restores a custom layout", () => {
    const cols: ColumnConfig[] = [
      { id: "col-10", type: "ci", title: "Build" },
      { id: "col-11", type: "issues", title: "Bugs" },
    ];
    saveLayout(cols);
    expect(loadLayout()).toEqual(cols);
  });

  it("last saveLayout call wins", () => {
    const first: ColumnConfig[] = [{ id: "col-1", type: "prs", title: "First" }];
    const second: ColumnConfig[] = [{ id: "col-2", type: "activity", title: "Second" }];
    saveLayout(first);
    saveLayout(second);
    expect(loadLayout()).toEqual(second);
  });
});
