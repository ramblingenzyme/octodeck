import { useEffect, useRef, useState } from "react";
import type { ColumnConfig } from "@/types";
import { useUpdateColumnQueryMutation } from "@/store/configApi";
import styles from "./AddColumnModal.module.css";

interface ColumnSettingsModalProps {
  col: ColumnConfig;
  onClose: () => void;
}

export const ColumnSettingsModal = ({ col, onClose }: ColumnSettingsModalProps) => {
  const [query, setQuery] = useState(col.query ?? "");
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [updateQuery] = useUpdateColumnQueryMutation();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleSave = () => {
    updateQuery({ id: col.id, query: query.trim() });
    onClose();
  };

  const handleClear = () => {
    setQuery("");
    setConfirmingClear(false);
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="col-settings-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 id="col-settings-modal-title" className={styles.modalTitle}>
            Filter: {col.title}
          </h2>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalField}>
            <label htmlFor="col-query-input" className={styles.modalFieldLabel}>
              Filter Query
            </label>
            <input
              id="col-query-input"
              className={styles.fieldInput}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setConfirmingClear(false);
              }}
              placeholder="repo:owner/repo label:bug is:open"
              autoFocus
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          {!confirmingClear && (
            <button
              type="button"
              className={`${styles.btnModal} ${styles.btnModalDanger}`}
              onClick={() => setConfirmingClear(true)}
              disabled={!query}
            >
              Clear
            </button>
          )}
          <button type="button" className={styles.btnModal} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`${styles.btnModal} ${styles.btnModalPrimary}`}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
        {confirmingClear && (
          <div className={styles.clearConfirm} role="alert">
            <span className={styles.clearConfirmText}>Clear filter query?</span>
            <div className={styles.clearConfirmButtons}>
              <button
                type="button"
                className={styles.btnModal}
                onClick={() => setConfirmingClear(false)}
              >
                No
              </button>
              <button
                type="button"
                className={`${styles.btnModal} ${styles.btnModalDanger}`}
                onClick={handleClear}
              >
                Yes, clear
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
};
