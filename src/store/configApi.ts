import { produce } from "immer";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ColumnConfig, ColumnType } from "@/types";
import { mkId } from "@/constants";
import { loadLayout, saveLayout } from "./layoutStorage";

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
        data: mutateLayout((d) => { d.push({ id: mkId(), type, title, ...(query ? { query } : {}) }); }),
      }),
      invalidatesTags: ["Layout"],
    }),
    removeColumn: build.mutation<ColumnConfig[], string>({
      queryFn: (id) => ({
        data: mutateLayout((d) => { d.splice(d.findIndex((c) => c.id === id), 1); }),
      }),
      invalidatesTags: ["Layout"],
    }),
    moveLeft: build.mutation<ColumnConfig[], string>({
      queryFn: (id) => ({
        data: mutateLayout((d) => {
          const i = d.findIndex((c) => c.id === id);
          if (i > 0) [d[i - 1], d[i]] = [d[i]!, d[i - 1]!];
        }),
      }),
      invalidatesTags: ["Layout"],
    }),
    moveRight: build.mutation<ColumnConfig[], string>({
      queryFn: (id) => ({
        data: mutateLayout((d) => {
          const i = d.findIndex((c) => c.id === id);
          if (i >= 0 && i < d.length - 1) [d[i], d[i + 1]] = [d[i + 1]!, d[i]!];
        }),
      }),
      invalidatesTags: ["Layout"],
    }),
    updateColumnQuery: build.mutation<ColumnConfig[], { id: string; query: string }>({
      queryFn: ({ id, query }) => ({
        data: mutateLayout((d) => {
          const col = d.find((c) => c.id === id);
          if (col) col.query = query || undefined;
        }),
      }),
      invalidatesTags: ["Layout"],
    }),
  }),
});

export const {
  useGetLayoutQuery,
  useAddColumnMutation,
  useRemoveColumnMutation,
  useMoveLeftMutation,
  useMoveRightMutation,
  useUpdateColumnQueryMutation,
} = configApi;
