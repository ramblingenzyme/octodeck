import { useEffect, useRef, useState } from "react";
import type { ColumnType } from "@/types";
import { COLUMN_TYPES } from "@/constants";
import colStyles from "./Column.module.css";
import { Icon } from "./Icon";
import styles from "./AddColumnModal.module.css";

interface AddColumnModalProps {
  onAdd: (type: ColumnType, title: string, query?: string) => void;
  onClose: () => void;
}

export const AddColumnModal = ({ onAdd, onClose }: AddColumnModalProps) => {
  const [selectedType, setSelectedType] = useState<ColumnType>("prs");
  const [title, setTitle] = useState(COLUMN_TYPES[selectedType].label);
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleTypeChange = (type: ColumnType) => {
    setSelectedType(type);
    setTitle(COLUMN_TYPES[type].label);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(selectedType, title, query.trim() || undefined);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="add-column-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 id="add-column-modal-title" className={styles.modalTitle}>
            Add Column
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.modalTypes}>
              {(Object.keys(COLUMN_TYPES) as ColumnType[]).map((type) => {
                const cfg = COLUMN_TYPES[type];
                return (
                  <button
                    key={type}
                    type="button"
                    className={`${styles.typeBtn} ${colStyles[type]} ${selectedType === type ? styles.active : ""}`}
                    onClick={() => handleTypeChange(type)}
                    aria-pressed={selectedType === type}
                  >
                    <Icon className={styles.colIcon}>{cfg.icon}</Icon>
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
            <div className={styles.modalField}>
              <label htmlFor="column-title-input" className={styles.modalFieldLabel}>
                Column Title
              </label>
              <input
                id="column-title-input"
                className={styles.fieldInput}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
              />
            </div>
            <div className={styles.modalField}>
              <label htmlFor="column-query-input" className={styles.modalFieldLabel}>
                Filter Query
              </label>
              <input
                id="column-query-input"
                className={styles.fieldInput}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="repo:owner/repo label:bug is:open"
              />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnModal} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={`${styles.btnModal} ${styles.btnModalPrimary}`}>
              Add Column
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
