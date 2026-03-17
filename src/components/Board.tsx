import type { ColumnConfig } from "@/types";
import { Column } from "./Column";
import styles from "./Board.module.css";

interface BoardProps {
  columns: ColumnConfig[];
  onAddColumn: () => void;
  onRemove: (id: string) => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
}

export const Board = ({ columns, onAddColumn, onRemove, onMoveLeft, onMoveRight }: BoardProps) => {
  if (columns.length === 0) {
    return (
      <main className={styles.boardEmpty} tabIndex={-1}>
        <div className={styles.boardEmptyIcon} aria-hidden="true">▪</div>
        <p className={styles.boardEmptyText}>No columns yet</p>
        <button className={styles.boardEmptyBtn} onClick={onAddColumn}>
          + Add your first column
        </button>
      </main>
    );
  }

  return (
    <main className={styles.board} tabIndex={-1}>
      {columns.map((col, idx) => (
        <Column
          key={col.id}
          col={col}
          onRemove={onRemove}
          onMoveLeft={onMoveLeft}
          onMoveRight={onMoveRight}
          isFirst={idx === 0}
          isLast={idx === columns.length - 1}
        />
      ))}
    </main>
  );
};
