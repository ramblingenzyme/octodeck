import type { ColumnConfig, ColumnType } from "@/types";

export function applyAdd(
  cols: ColumnConfig[],
  id: string,
  type: ColumnType,
  title: string,
  query?: string,
): ColumnConfig[] {
  return [...cols, { id, type, title, ...(query ? { query } : {}) }];
}

export function applyRemove(cols: ColumnConfig[], id: string): ColumnConfig[] {
  return cols.filter((c) => c.id !== id);
}

export function applyReorder(cols: ColumnConfig[], from: number, to: number): ColumnConfig[] {
  const next = [...cols];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}

export function applyUpdateQuery(cols: ColumnConfig[], id: string, query: string): ColumnConfig[] {
  return cols.map((c) =>
    c.id === id ? { ...c, ...(query ? { query } : { query: undefined }) } : c,
  );
}
