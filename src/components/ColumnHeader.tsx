import type { RefObject } from 'react';
import type { ColumnConfig } from '@/types';
import { COLUMN_TYPES } from '@/constants';
import { Icon } from './ui/Icon';
import { Tooltip } from './ui/Tooltip';
import styles from './Column.module.css';

interface ColumnHeaderProps {
  col: ColumnConfig;
  handleRef: RefObject<HTMLSpanElement | null>;
  itemCount: number;
  isFetching: boolean;
  spinning: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onConfirmRemove: () => void;
}

function formatAge(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1m ago';
  return `${mins}m ago`;
}

export const ColumnHeader = ({
  col,
  handleRef,
  itemCount,
  isFetching,
  spinning,
  lastUpdated,
  onRefresh,
  onOpenSettings,
  onConfirmRemove,
}: ColumnHeaderProps) => {
  const cfg = COLUMN_TYPES[col.type];
  const itemLabel = itemCount === 1 ? cfg.itemLabel : `${cfg.itemLabel}s`;

  return (
    <header className={styles.colHeader}>
      <span ref={handleRef} className={styles.dragHandle} aria-hidden="true">⠿</span>
      <div className={styles.colHeaderLeft}>
        <Icon className={styles.colIcon}>{cfg.icon}</Icon>
        <Tooltip text={col.title} position="below">
          <h2 className={styles.colTitle}>{col.title}</h2>
        </Tooltip>
        <Tooltip text={`${itemCount} ${itemLabel}`} position="below">
          <output
            className={styles.colBadge}
            aria-label={`${itemCount} ${itemLabel}`}
          >
            {itemCount}
          </output>
        </Tooltip>
      </div>
      <div className={styles.colControls}>
        {lastUpdated && (
          <Tooltip text={lastUpdated.toLocaleTimeString()} position="below">
            <span className={styles.lastUpdated}>{formatAge(lastUpdated)}</span>
          </Tooltip>
        )}
        <Tooltip text="Refresh" position="below">
          <button
            className={`${styles.btnIcon} ${spinning || isFetching ? styles.btnIconSpinning : ''}`}
            onClick={onRefresh}
            aria-label="Refresh"
          >
            <Icon>↻</Icon>
          </button>
        </Tooltip>
        <Tooltip text="Column filters" position="below">
          <button
            className={`${styles.btnIcon} ${col.query ? styles.btnIconActive : ''}`}
            onClick={onOpenSettings}
            aria-label="Column filters"
          >
            <Icon>⚙</Icon>
          </button>
        </Tooltip>
        <Tooltip text="Remove column" position="below">
          <button
            className={styles.btnIcon}
            onClick={onConfirmRemove}
            aria-label="Remove column"
          >
            <Icon>✕</Icon>
          </button>
        </Tooltip>
      </div>
    </header>
  );
};
