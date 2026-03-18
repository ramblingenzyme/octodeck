import { useState } from "react";
import type { ColumnConfig, PRItem, IssueItem, CIItem, NotifItem, ActivityItem } from "@/types";
import { COLUMN_TYPES } from "@/constants";
import { useColumnData } from "@/hooks/useColumnData";
import styles from "./Column.module.css";
import { Icon } from "./Icon";
import { PRCard } from "./cards/PRCard";
import { IssueCard } from "./cards/IssueCard";
import { CICard } from "./cards/CICard";
import { NotifCard } from "./cards/NotifCard";
import { ActivityCard } from "./cards/ActivityCard";
import { ColumnSettingsModal } from "./ColumnSettingsModal";

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

export const Column = ({
  col,
  onRemove,
  onMoveLeft,
  onMoveRight,
  isFirst,
  isLast,
}: ColumnProps) => {
  const [confirming, setConfirming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const cfg = COLUMN_TYPES[col.type];
  const { data, isLoading, error } = useColumnData(col);

  const renderCard = (item: PRItem | IssueItem | CIItem | NotifItem | ActivityItem) => {
    switch (col.type) {
      case "prs":
        return <PRCard key={item.id} item={item as PRItem} />;
      case "issues":
        return <IssueCard key={item.id} item={item as IssueItem} />;
      case "ci":
        return <CICard key={item.id} item={item as CIItem} />;
      case "notifications":
        return <NotifCard key={item.id} item={item as NotifItem} />;
      case "activity":
        return <ActivityCard key={item.id} item={item as ActivityItem} />;
    }
  };

  return (
    <section className={`${styles.column} ${styles[col.type]}`} aria-label={col.title}>
      <header className={styles.colHeader}>
        <div className={styles.colHeaderLeft}>
          <Icon className={styles.colIcon}>{cfg.icon}</Icon>
          <h2 className={styles.colTitle}>{col.title}</h2>
          <output className={styles.colBadge} aria-label={`${data.length} items`}>
            {data.length}
          </output>
        </div>
        <div className={styles.colControls}>
          <button
            className={`${styles.btnIcon} ${col.query ? styles.btnIconActive : ""}`}
            onClick={() => setShowSettings(true)}
            aria-label="Column filters"
            title="Column filters"
          >
            <Icon>⚙</Icon>
          </button>
          <button
            className={styles.btnIcon}
            onClick={() => onMoveLeft(col.id)}
            disabled={isFirst}
            aria-label="Move left"
          >
            <Icon>←</Icon>
          </button>
          <button
            className={styles.btnIcon}
            onClick={() => onMoveRight(col.id)}
            disabled={isLast}
            aria-label="Move right"
          >
            <Icon>→</Icon>
          </button>
          <button
            className={styles.btnIcon}
            onClick={() => setConfirming(true)}
            aria-label="Remove column"
          >
            <Icon>✕</Icon>
          </button>
        </div>
      </header>

      {col.query && (
        <div className={styles.colQuery} title={col.query}>
          <span className={styles.colQueryText}>{col.query}</span>
          <button
            className={styles.colQueryEdit}
            onClick={() => setShowSettings(true)}
            aria-label="Edit filter query"
          >
            edit
          </button>
        </div>
      )}

      {confirming && (
        <div className={styles.colConfirmation} role="alert">
          <span className={styles.colConfirmationText}>Remove "{col.title}"?</span>
          <div className={styles.colConfirmationButtons}>
            <button className={styles.btnConfirmCancel} onClick={() => setConfirming(false)}>
              No
            </button>
            <button className={styles.btnConfirmDanger} onClick={() => onRemove(col.id)}>
              Yes, remove
            </button>
          </div>
        </div>
      )}

      <div className={styles.colBody}>
        {isLoading && (
          <div className={styles.skeletonWrapper} aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        )}
        {error && !isLoading && (
          <div className={styles.errorState} role="alert">
            {error}
          </div>
        )}
        {!isLoading &&
          !error &&
          data.map((item) => renderCard(item))}
      </div>

      {showSettings && <ColumnSettingsModal col={col} onClose={() => setShowSettings(false)} />}
    </section>
  );
};
