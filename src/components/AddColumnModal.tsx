import { useState } from "preact/hooks";
import type { ColumnType } from "@/types";
import { COLUMN_TYPES } from "@/constants";
import colStyles from "./Column.module.css";
import { Icon } from "./ui/Icon";
import { Modal, ModalBody, ModalFooter, modalStyles } from "./ui/Modal";
import styles from "./AddColumnModal.module.css";

interface AddColumnModalProps {
  onAdd: (type: ColumnType, title: string, query?: string) => void;
  onClose: () => void;
}

export const AddColumnModal = ({ onAdd, onClose }: AddColumnModalProps) => {
  const [selectedType, setSelectedType] = useState<ColumnType>("prs");
  const [title, setTitle] = useState(COLUMN_TYPES[selectedType].label);
  const [query, setQuery] = useState(COLUMN_TYPES[selectedType].defaultQuery);

  const handleTypeChange = (type: ColumnType) => {
    setSelectedType(type);
    setTitle(COLUMN_TYPES[type].label);
    setQuery(COLUMN_TYPES[type].defaultQuery);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(selectedType, title, query.trim() || undefined);
    onClose();
  };

  return (
    <Modal
      title="Add Column"
      titleId="add-column-modal-title"
      onClose={onClose}
      onBackdropClick={onClose}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
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
              className={modalStyles.fieldInput}
              type="text"
              value={title}
              onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
              placeholder="Enter title..."
            />
          </div>
          <div className={styles.modalField}>
            <label htmlFor="column-query-input" className={styles.modalFieldLabel}>
              Filter Query
            </label>
            <input
              id="column-query-input"
              className={modalStyles.fieldInput}
              type="text"
              value={query}
              onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
              placeholder="repo:owner/repo label:bug is:open"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <button type="button" className={modalStyles.btnModal} onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className={`${modalStyles.btnModal} ${modalStyles.btnModalPrimary}`}
          >
            Add Column
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
