import { useEffect, useState } from 'react';
import type { ColumnType } from '@/types';
import { COLUMN_TYPES } from '@/constants';
import colStyles from './Column.module.css';
import { Icon } from './Icon';
import styles from './AddColumnModal.module.css';

interface AddColumnModalProps {
  onAdd: (type: ColumnType, title: string, repos?: string[]) => void;
  onClose: () => void;
}

export const AddColumnModal = ({ onAdd, onClose }: AddColumnModalProps) => {
  const [selectedType, setSelectedType] = useState<ColumnType>('prs');
  const [title, setTitle] = useState(COLUMN_TYPES[selectedType].label);
  const [reposText, setReposText] = useState('');

  const handleTypeChange = (type: ColumnType) => {
    setSelectedType(type);
    setTitle(COLUMN_TYPES[type].label);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const repos =
      selectedType === 'ci'
        ? reposText
            .split('\n')
            .map((r) => r.trim())
            .filter(Boolean)
        : undefined;
    if (repos !== undefined) {
      onAdd(selectedType, title, repos);
    } else {
      onAdd(selectedType, title);
    }
    onClose();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-column-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 id="add-column-modal-title" className={styles.modalTitle}>Add Column</h2>
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
                    className={`${styles.typeBtn} ${colStyles[type]} ${selectedType === type ? styles.active : ''}`}
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
              <label htmlFor="column-title-input" className={styles.modalFieldLabel}>Column Title</label>
              <input
                id="column-title-input"
                className={styles.fieldInput}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
              />
            </div>
            {selectedType === 'ci' && (
              <div className={styles.modalField}>
                <label htmlFor="ci-repos-input" className={styles.modalFieldLabel}>
                  Repos to watch (one per line, e.g. owner/repo)
                </label>
                <textarea
                  id="ci-repos-input"
                  className={styles.fieldInput}
                  value={reposText}
                  onChange={(e) => setReposText(e.target.value)}
                  placeholder="owner/repo&#10;owner/another-repo"
                  rows={4}
                />
              </div>
            )}
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
    </div>
  );
};
