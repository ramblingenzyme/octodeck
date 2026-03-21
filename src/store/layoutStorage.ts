import type { ColumnConfig } from "@/types";
import { DEFAULT_COLUMNS } from "@/constants";

const STORAGE_KEY = "gh-deck:layout";

export function loadLayout(): ColumnConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COLUMNS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_COLUMNS;
    return parsed as ColumnConfig[];
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
