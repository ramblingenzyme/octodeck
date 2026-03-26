import { useState } from "preact/hooks";
import type { ColumnType } from "@/types";
import { COLUMN_TYPES, MULTI_REPO_COLUMN_TYPES } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { useGetUserRepos } from "@/store/githubQueries";
import prStyles from "./columns/PRColumn.module.css";
import issueStyles from "./columns/IssueColumn.module.css";
import ciStyles from "./columns/CIColumn.module.css";
import activityStyles from "./columns/ActivityColumn.module.css";
import releasesStyles from "./columns/ReleasesColumn.module.css";
import deploymentsStyles from "./columns/DeploymentsColumn.module.css";

const ACCENT_CLASS: Record<ColumnType, string | undefined> = {
  prs: prStyles.accent,
  issues: issueStyles.accent,
  ci: ciStyles.accent,
  activity: activityStyles.accent,
  releases: releasesStyles.accent,
  deployments: deploymentsStyles.accent,
};
import { SvgIcon } from "./ui/SvgIcon";
import { Modal, ModalBody, ModalFooter, modalStyles } from "./ui/Modal";
import { RepoChipList } from "./ui/RepoChipList";
import { FilterHelpPopover } from "./ui/FilterHelpPopover";
import styles from "./AddColumnModal.module.css";

interface AddColumnModalProps {
  open: boolean;
  onAdd: (type: ColumnType, title: string, query?: string, repos?: string[]) => void;
  onClose: () => void;
}

export const AddColumnModal = ({ open, onAdd, onClose }: AddColumnModalProps) => {
  const [selectedType, setSelectedType] = useState<ColumnType>("prs");
  const [title, setTitle] = useState(COLUMN_TYPES[selectedType].label);
  const [query, setQuery] = useState(COLUMN_TYPES[selectedType].defaultQuery);
  const [repos, setRepos] = useState<string[]>([]);

  const isMultiRepo = MULTI_REPO_COLUMN_TYPES.has(selectedType);
  const sessionId = useAuthStore((s) => s.sessionId);
  const { data: repoSuggestions } = useGetUserRepos(isMultiRepo ? sessionId : null);

  const handleTypeChange = (type: ColumnType) => {
    setSelectedType(type);
    setTitle(COLUMN_TYPES[type].label);
    setQuery(COLUMN_TYPES[type].defaultQuery);
    setRepos([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(selectedType, title, query.trim() || undefined, isMultiRepo ? repos : undefined);
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
      className={styles.modal}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className={styles.layout}>
            <div className={styles.typesList}>
              <span className={modalStyles.fieldLabel}>Column Type</span>
              {columnTypeButtons}
            </div>
            <div className={styles.fields}>
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
                <div className={styles.labelRow}>
                  <label htmlFor="column-query-input">Filter Query</label>
                  <FilterHelpPopover columnType={selectedType} />
                </div>
                <input
                  id="column-query-input"
                  className={modalStyles.fieldInput}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
                  placeholder={
                    isMultiRepo ? "status:failure branch:main" : "repo:owner/repo label:bug is:open"
                  }
                />
              </div>
              {isMultiRepo && (
                <div className={styles.modalField}>
                  <label>Repositories</label>
                  <RepoChipList
                    repos={repos}
                    suggestions={repoSuggestions}
                    onAdd={(r) => setRepos((prev) => [...prev, r])}
                    onRemove={(r) => setRepos((prev) => prev.filter((x) => x !== r))}
                  />
                </div>
              )}
            </div>
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
