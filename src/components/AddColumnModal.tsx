import { useState } from "react";
import type { ColumnType } from "@/types";
import { COLUMN_TYPES } from "@/constants";
import colStyles from "./Column.module.css";
import styles from "./AddColumnModal.module.css";

interface AddColumnModalProps {
  onAdd: (type: ColumnType, title: string) => void;
  onClose: () => void;
}

export const AddColumnModal = ({ onAdd, onClose }: AddColumnModalProps) => {
  const [selectedType, setSelectedType] = useState<ColumnType>("prs");
  const [title, setTitle] = useState(COLUMN_TYPES[selectedType].label);

  const handleTypeChange = (type: ColumnType) => {
    setSelectedType(type);
    setTitle(COLUMN_TYPES[type].label);
  };

  const handleAdd = () => {
    onAdd(selectedType, title);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add Column</h2>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalTypes}>
            {(Object.keys(COLUMN_TYPES) as ColumnType[]).map((type) => {
              const cfg = COLUMN_TYPES[type];
              return (
                <button
                  key={type}
                  className={`${styles.typeBtn} ${colStyles[type]} ${selectedType === type ? styles.active : ""}`}
                  onClick={() => handleTypeChange(type)}
                >
                  <span className={styles.colIcon}>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
          <div className={styles.modalField}>
            <label className={styles.modalFieldLabel}>Column Title</label>
            <input
              className={styles.fieldInput}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnModal} onClick={onClose}>
            Cancel
          </button>
          <button className={`${styles.btnModal} ${styles.btnModalPrimary}`} onClick={handleAdd}>
            Add Column
          </button>
        </div>
      </div>
    </div>
  );
};
