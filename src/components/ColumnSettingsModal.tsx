import { useState } from 'react';
import type { ColumnConfig } from '@/types';
import { useUpdateColumnQueryMutation } from '@/store/configApi';
import { Modal, ModalBody, ModalFooter, modalStyles } from './ui/Modal';
import styles from './AddColumnModal.module.css';

interface ColumnSettingsModalProps {
  col: ColumnConfig;
  onClose: () => void;
}

export const ColumnSettingsModal = ({ col, onClose }: ColumnSettingsModalProps) => {
  const [query, setQuery] = useState(col.query ?? '');
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [updateQuery] = useUpdateColumnQueryMutation();

  const handleSave = () => {
    updateQuery({ id: col.id, query: query.trim() });
    onClose();
  };

  const handleClear = () => {
    setQuery('');
    setConfirmingClear(false);
  };

  return (
    <Modal
      title={`Filter: ${col.title}`}
      titleId="col-settings-modal-title"
      onClose={onClose}
      onBackdropClick={onClose}
    >
      <ModalBody>
        <div className={styles.modalField}>
          <label htmlFor="col-query-input" className={styles.modalFieldLabel}>
            Filter Query
          </label>
          <input
            id="col-query-input"
            className={modalStyles.fieldInput}
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
      </ModalBody>
      <ModalFooter>
        {!confirmingClear && (
          <button
            type="button"
            className={`${modalStyles.btnModal} ${modalStyles.btnModalDanger}`}
            onClick={() => setConfirmingClear(true)}
            disabled={!query}
          >
            Clear
          </button>
        )}
        <button type="button" className={modalStyles.btnModal} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className={`${modalStyles.btnModal} ${modalStyles.btnModalPrimary}`}
          onClick={handleSave}
        >
          Save
        </button>
      </ModalFooter>
      {confirmingClear && (
        <div className={styles.clearConfirm} role="alert">
          <span className={styles.clearConfirmText}>Clear filter query?</span>
          <div className={styles.clearConfirmButtons}>
            <button
              type="button"
              className={modalStyles.btnModal}
              onClick={() => setConfirmingClear(false)}
            >
              No
            </button>
            <button
              type="button"
              className={`${modalStyles.btnModal} ${modalStyles.btnModalDanger}`}
              onClick={handleClear}
            >
              Yes, clear
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
