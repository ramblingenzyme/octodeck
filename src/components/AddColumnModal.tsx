import { useState } from "preact/hooks";
import type { ColumnType } from "@/types";
import { COLUMN_TYPES } from "@/constants";
import prStyles from "./columns/PRColumn.module.css";
import issueStyles from "./columns/IssueColumn.module.css";
import ciStyles from "./columns/CIColumn.module.css";
import activityStyles from "./columns/ActivityColumn.module.css";
import releasesStyles from "./columns/ReleasesColumn.module.css";
import deploymentsStyles from "./columns/DeploymentsColumn.module.css";
import securityStyles from "./columns/SecurityColumn.module.css";

const ACCENT_CLASS: Record<ColumnType, string | undefined> = {
  prs: prStyles.accent,
  issues: issueStyles.accent,
  ci: ciStyles.accent,
  activity: activityStyles.accent,
  releases: releasesStyles.accent,
  deployments: deploymentsStyles.accent,
  security: securityStyles.accent,
};
import { SvgIcon } from "./ui/SvgIcon";
import { Modal, ModalBody, ModalFooter, modalStyles } from "./ui/Modal";
import styles from "./AddColumnModal.module.css";

interface AddColumnModalProps {
  open: boolean;
  onAdd: (type: ColumnType, title: string, query?: string) => void;
  onClose: () => void;
}

export const AddColumnModal = ({ open, onAdd, onClose }: AddColumnModalProps) => {
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

  const columnTypeButtons = (Object.keys(COLUMN_TYPES) as ColumnType[]).map((type) => {
    const cfg = COLUMN_TYPES[type];
    return (
      <button
        key={type}
        type="button"
        className={`${styles.typeBtn} ${ACCENT_CLASS[type]} ${selectedType === type ? styles.active : ""}`}
        onClick={() => handleTypeChange(type)}
        aria-pressed={selectedType === type}
      >
        <SvgIcon name={cfg.icon} className={styles.colIcon} />
        <span>{cfg.label}</span>
      </button>
    );
  });

  return (
    <Modal
      open={open}
      title="Add Column"
      titleId="add-column-modal-title"
      onClose={onClose}
      onBackdropClick={onClose}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className={styles.modalTypes}>{columnTypeButtons}</div>
          <div className={styles.modalField}>
            <label htmlFor="column-title-input">Column Title</label>
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
            <label htmlFor="column-query-input">Filter Query</label>
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
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit">Add Column</button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
