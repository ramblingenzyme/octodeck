import { useState, useEffect } from "preact/hooks";
import type { ColumnConfig } from "@/types";
import { useLayoutStore } from "@/store/layoutStore";
import { useAuthStore } from "@/store/authStore";
import { useGetUserRepos } from "@/store/githubQueries";
import { MULTI_REPO_COLUMN_TYPES } from "@/constants";
import { Modal, ModalBody, ModalFooter, modalStyles } from "./ui/Modal";
import { RepoChipList } from "./ui/RepoChipList";
import styles from "./ColumnSettingsModal.module.css";

interface ColumnSettingsModalProps {
  open: boolean;
  col: ColumnConfig;
  onClose: () => void;
}

export const ColumnSettingsModal = ({ open, col, onClose }: ColumnSettingsModalProps) => {
  const isMultiRepo = MULTI_REPO_COLUMN_TYPES.has(col.type);
  const [repos, setRepos] = useState<string[]>(col.repos ?? []);
  const token = useAuthStore((s) => s.token);
  const { data: repoSuggestions } = useGetUserRepos(isMultiRepo ? token : null);
  const updateColumnTitle = useLayoutStore((s) => s.updateColumnTitle);
  const updateColumnQuery = useLayoutStore((s) => s.updateColumnQuery);
  const updateColumnRepos = useLayoutStore((s) => s.updateColumnRepos);

  useEffect(() => {
    if (!open) return;
    setRepos(col.repos ?? []);
  }, [open]);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = (data.get("title") as string).trim();
    const query = (data.get("query") as string).trim();
    if (title) updateColumnTitle(col.id, title);
    if (isMultiRepo) updateColumnRepos(col.id, repos);
    updateColumnQuery(col.id, query);
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Column Settings"
      titleId="column-settings-modal-title"
      onClose={onClose}
      onBackdropClick={onClose}
    >
      <form key={String(open)} onSubmit={handleSave}>
        <ModalBody>
          <div className={styles.field}>
            <label htmlFor="col-settings-title">Title</label>
            <input
              id="col-settings-title"
              name="title"
              className={modalStyles.fieldInput}
              type="text"
              defaultValue={col.title}
              placeholder="Enter title…"
              required
            />
          </div>
          {isMultiRepo && (
            <div className={styles.field}>
              <label>Repositories</label>
              <RepoChipList
                key={String(open)}
                repos={repos}
                suggestions={repoSuggestions}
                onAdd={(r) => setRepos((prev) => [...prev, r])}
                onRemove={(r) => setRepos((prev) => prev.filter((x) => x !== r))}
              />
            </div>
          )}
          <div className={styles.field}>
            <label htmlFor="col-settings-query">Filter Query</label>
            <input
              id="col-settings-query"
              name="query"
              className={modalStyles.fieldInput}
              type="text"
              defaultValue={col.query ?? ""}
              placeholder={
                isMultiRepo ? "status:failure branch:main" : "repo:owner/repo label:bug is:open"
              }
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
            Save
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
