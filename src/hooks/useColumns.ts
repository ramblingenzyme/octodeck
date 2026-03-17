import { useState } from "react";
import type { ColumnConfig, ColumnType } from "@/types";
import { DEFAULT_COLUMNS, mkId } from "@/constants";

export const useColumns = () => {
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  const addCol = (type: ColumnType, title: string) => {
    const newCol: ColumnConfig = { id: mkId(), type, title };
    setColumns((cols) => [...cols, newCol]);
  };

  const removeCol = (id: number) => {
    setColumns((cols) => cols.filter((c) => c.id !== id));
  };

  const moveLeft = (id: number) => {
    setColumns((cols) => {
      const idx = cols.findIndex((c) => c.id === id);
      if (idx <= 0) return cols;
      const newCols = [...cols];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [newCols[idx - 1], newCols[idx]] = [newCols[idx]!, newCols[idx - 1]!];
      return newCols;
    });
  };

  const moveRight = (id: number) => {
    setColumns((cols) => {
      const idx = cols.findIndex((c) => c.id === id);
      if (idx < 0 || idx >= cols.length - 1) return cols;
      const newCols = [...cols];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [newCols[idx], newCols[idx + 1]] = [newCols[idx + 1]!, newCols[idx]!];
      return newCols;
    });
  };

  return { columns, addCol, removeCol, moveLeft, moveRight };
};
