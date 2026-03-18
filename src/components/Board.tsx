import { useEffect } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { ColumnConfig } from "@/types";
import { useReorderMutation } from "@/store/configApi";
import { Column } from "./Column";
import styles from "./Board.module.css";

interface BoardProps {
  columns: ColumnConfig[];
  onAddColumn: () => void;
  onRemove: (id: string) => void;
}

export const Board = ({ columns, onAddColumn, onRemove }: BoardProps) => {
  const [reorder] = useReorderMutation();
  const columnIds = columns.map((c) => c.id);

  useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        const target = location.current.dropTargets[0];
        if (!target) return;
        const fromId = source.data.columnId as string;
        const toId = target.data.columnId as string;
        if (fromId === toId) return;
        const from = columnIds.indexOf(fromId);
        const to = columnIds.indexOf(toId);
        if (from !== -1 && to !== -1) reorder({ from, to });
      },
    });
  }, [columnIds, reorder]);

  if (columns.length === 0) {
    return (
      <main className={styles.boardEmpty} tabIndex={-1}>
        <div className={styles.boardEmptyIcon} aria-hidden="true">
          ▪
        </div>
        <p className={styles.boardEmptyText}>No columns yet</p>
        <button className={styles.boardEmptyBtn} onClick={onAddColumn}>
          + Add your first column
        </button>
      </main>
    );
  }

  return (
    <main className={styles.board} tabIndex={-1}>
      {columns.map((col) => (
        <Column key={col.id} col={col} onRemove={onRemove} />
      ))}
    </main>
  );
};
