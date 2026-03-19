import { create } from "zustand";
import type { ColumnConfig, ColumnType } from "@/types";
import { mkId } from "@/constants";
import { loadLayout, saveLayout } from "./layoutStorage";
import { applyAdd, applyRemove, applyReorder, applyUpdateQuery } from "./layoutMutations";

interface LayoutState {
  columns: ColumnConfig[];
  addColumn: (type: ColumnType, title: string, query?: string) => void;
  removeColumn: (id: string) => void;
  reorder: (from: number, to: number) => void;
  updateColumnQuery: (id: string, query: string) => void;
}

export const useLayoutStore = create<LayoutState>((set, get) => {
  const mutate = (next: ColumnConfig[]) => {
    saveLayout(next);
    set({ columns: next });
  };

  return {
    columns: loadLayout(),
    addColumn(type, title, query) {
      mutate(applyAdd(get().columns, mkId(), type, title, query));
    },
    removeColumn(id) {
      mutate(applyRemove(get().columns, id));
    },
    reorder(from, to) {
      mutate(applyReorder(get().columns, from, to));
    },
    updateColumnQuery(id, query) {
      mutate(applyUpdateQuery(get().columns, id, query));
    },
  };
});
