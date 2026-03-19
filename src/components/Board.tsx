import { useEffect } from "preact/hooks";
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

  useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        const target = location.current.dropTargets[0];
        if (!target) return;
        const fromId = source.data.columnId;
        const toId = target.data.columnId;
        if (typeof fromId !== "string" || typeof toId !== "string") return;
        if (fromId === toId) return;
        const from = columns.findIndex((c) => c.id === fromId);
        const to = columns.findIndex((c) => c.id === toId);
        if (from !== -1 && to !== -1) reorder({ from, to });
      },
    });
  }, [columns, reorder]);

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
