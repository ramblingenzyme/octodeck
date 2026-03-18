import { produce } from "immer";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ColumnConfig, ColumnType } from "@/types";
import { mkId } from "@/constants";
import { loadLayout, saveLayout } from "./layoutStorage";
import {
  applyAdd,
  applyRemove,
  applyReorder,
  applyUpdateQuery,
} from "./layoutMutations";

function mutateLayout(fn: (draft: ColumnConfig[]) => void): ColumnConfig[] {
  const next = produce(loadLayout(), fn);
  saveLayout(next);
  return next;
}

export const configApi = createApi({
  reducerPath: "configApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Layout"],
  endpoints: (build) => ({
    getLayout: build.query<ColumnConfig[], void>({
      queryFn: () => ({ data: loadLayout() }),
      providesTags: ["Layout"],
    }),
    addColumn: build.mutation<ColumnConfig[], { type: ColumnType; title: string; query?: string }>({
      queryFn: ({ type, title, query }) => ({
        data: mutateLayout((d) => applyAdd(d, mkId(), type, title, query)),
      }),
      invalidatesTags: ["Layout"],
    }),
    removeColumn: build.mutation<ColumnConfig[], string>({
      queryFn: (id) => ({
        data: mutateLayout((d) => applyRemove(d, id)),
      }),
      invalidatesTags: ["Layout"],
    }),
    reorder: build.mutation<ColumnConfig[], { from: number; to: number }>({
      queryFn: ({ from, to }) => ({
        data: mutateLayout((d) => applyReorder(d, from, to)),
      }),
      invalidatesTags: ["Layout"],
    }),
    updateColumnQuery: build.mutation<ColumnConfig[], { id: string; query: string }>({
      queryFn: ({ id, query }) => ({
        data: mutateLayout((d) => applyUpdateQuery(d, id, query)),
      }),
      invalidatesTags: ["Layout"],
    }),
  }),
});

export const {
  useGetLayoutQuery,
  useAddColumnMutation,
  useRemoveColumnMutation,
  useReorderMutation,
  useUpdateColumnQueryMutation,
} = configApi;
