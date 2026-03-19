import type { ColumnConfig } from "@/types";
import { DEFAULT_COLUMNS } from "@/constants";

const STORAGE_KEY = "gh-deck:layout";

export function loadLayout(): ColumnConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COLUMNS;
    const cols = JSON.parse(raw) as (ColumnConfig & { repos?: string[] })[];
    // Migrate old repos field to a query string
    return cols.map(({ repos, ...col }) => {
      if (repos?.length && !col.query) {
        return { ...col, query: repos.map((r) => `repo:${r}`).join(" ") };
      }
      return col;
    });
  } catch {
    return DEFAULT_COLUMNS;
  }
}

export function saveLayout(columns: ColumnConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
  } catch {
    // Ignore storage errors (e.g. private browsing quota exceeded)
  }
}
