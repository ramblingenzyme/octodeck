import { create } from "zustand";
import type { ColumnConfig, ColumnType } from "@/types";
import { mkId } from "@/constants";
import {
  applyAdd,
  applyRemove,
  applyReorder,
  applyUpdateQuery,
  applyUpdateTitle,
  applyUpdateRepos,
} from "./layoutMutations";

interface LayoutState {
  columns: ColumnConfig[];
  addColumn: (type: ColumnType, title: string, query?: string, repos?: string[]) => void;
  removeColumn: (id: string) => void;
  reorder: (from: number, to: number) => void;
  updateColumnQuery: (id: string, query: string) => void;
  updateColumnTitle: (id: string, title: string) => void;
  updateColumnRepos: (id: string, repos: string[]) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  columns: [],
  addColumn(type, title, query, repos) {
    set((s) => ({ columns: applyAdd(s.columns, mkId(), type, title, query, repos) }));
  },
  removeColumn(id) {
    set((s) => ({ columns: applyRemove(s.columns, id) }));
  },
  reorder(from, to) {
    set((s) => ({ columns: applyReorder(s.columns, from, to) }));
  },
  updateColumnQuery(id, query) {
    set((s) => ({ columns: applyUpdateQuery(s.columns, id, query) }));
  },
  updateColumnTitle(id, title) {
    set((s) => ({ columns: applyUpdateTitle(s.columns, id, title) }));
  },
  updateColumnRepos(id, repos) {
    set((s) => ({ columns: applyUpdateRepos(s.columns, id, repos) }));
  },
}));
