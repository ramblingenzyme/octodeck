import { useEffect } from "preact/hooks";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { ComponentType } from "preact";
import type { ColumnConfig } from "@/types";
import { useLayoutStore } from "@/store/layoutStore";
import { Column } from "./Column";
import type { ColumnProps } from "./BaseColumn";
import styles from "./Board.module.css";

export interface BoardProps {
  columns: ColumnConfig[];
  onAddColumn: () => void;
  onRemove: (id: string) => void;
  loading?: boolean;
  columnComponent?: ComponentType<ColumnProps>;
}

export const Board = ({
  columns,
  onAddColumn,
  onRemove,
  loading,
  columnComponent: ColumnComponent = Column,
}: BoardProps) => {
  const reorder = useLayoutStore((s) => s.reorder);

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
        if (from !== -1 && to !== -1) reorder(from, to);
      },
    });
  }, [columns, reorder]);

  if (loading) {
    return (
      <main className={styles.boardLoading} tabIndex={-1}>
        <div className={styles.spinner} aria-hidden="true" />
        <p>Connecting…</p>
      </main>
    );
  }

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
        <ColumnComponent key={col.id} col={col} onRemove={onRemove} />
      ))}
    </main>
  );
};
