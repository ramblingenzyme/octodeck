import type { ColumnConfig } from "@/types";
import { Column } from "./Column";
import styles from "./Board.module.css";

interface BoardProps {
  columns: ColumnConfig[];
  onAddColumn: () => void;
  onRemove: (id: number) => void;
  onMoveLeft: (id: number) => void;
  onMoveRight: (id: number) => void;
}

export const Board = ({ columns, onAddColumn, onRemove, onMoveLeft, onMoveRight }: BoardProps) => {
  if (columns.length === 0) {
    return (
      <div className={styles.boardEmpty}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>▪</div>
          <div style={{ fontSize: "12px", marginBottom: "16px" }}>No columns yet</div>
          <button className={styles.btn} onClick={onAddColumn} style={{ fontSize: "11px" }}>
            + Add your first column
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.board}>
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
    </div>
  );
};
