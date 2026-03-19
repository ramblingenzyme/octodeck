import type { ColumnConfig } from '@/types';
import styles from './Column.module.css';

interface ColumnConfirmDeleteProps {
  col: ColumnConfig;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ColumnConfirmDelete = ({ col, onCancel, onConfirm }: ColumnConfirmDeleteProps) => (
  <div className={styles.colConfirmation} role="alert">
    <span className={styles.colConfirmationText}>Remove &quot;{col.title}&quot;?</span>
    <div className={styles.colConfirmationButtons}>
      <button className={styles.btnConfirmCancel} onClick={onCancel}>
        No
      </button>
      <button className={styles.btnConfirmDanger} onClick={onConfirm}>
        Yes, remove
      </button>
    </div>
  </div>
);
