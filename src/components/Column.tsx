import { useState } from "react";
import type { ColumnConfig } from "@/types";
import { COLUMN_TYPES } from "@/constants";
import styles from "./Column.module.css";
import { MOCK_PRS, MOCK_ISSUES, MOCK_CI, MOCK_NOTIFS, MOCK_ACTIVITY } from "@/data/mock";
import { PRCard } from "./cards/PRCard";
import { IssueCard } from "./cards/IssueCard";
import { CICard } from "./cards/CICard";
import { NotifCard } from "./cards/NotifCard";
import { ActivityCard } from "./cards/ActivityCard";

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: number) => void;
  onMoveLeft: (id: number) => void;
  onMoveRight: (id: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

const DATA_MAP = {
  prs: MOCK_PRS,
  issues: MOCK_ISSUES,
  ci: MOCK_CI,
  notifications: MOCK_NOTIFS,
  activity: MOCK_ACTIVITY,
};

export const Column = ({
  col,
  onRemove,
  onMoveLeft,
  onMoveRight,
  isFirst,
  isLast,
}: ColumnProps) => {
  const [confirming, setConfirming] = useState(false);
  const cfg = COLUMN_TYPES[col.type];

  // Type-safe card rendering by discriminated union
  const renderCard = (item: (typeof DATA_MAP)[typeof col.type][number]) => {
    switch (col.type) {
      case "prs":
        return <PRCard key={item.id} item={item as (typeof MOCK_PRS)[number]} />;
      case "issues":
        return <IssueCard key={item.id} item={item as (typeof MOCK_ISSUES)[number]} />;
      case "ci":
        return <CICard key={item.id} item={item as (typeof MOCK_CI)[number]} />;
      case "notifications":
        return <NotifCard key={item.id} item={item as (typeof MOCK_NOTIFS)[number]} />;
      case "activity":
        return <ActivityCard key={item.id} item={item as (typeof MOCK_ACTIVITY)[number]} />;
    }
  };

  const data = DATA_MAP[col.type];

  return (
    <div className={`${styles.column} ${styles[col.type]}`}>
      <div className={styles.colHeader}>
        <div className={styles.colHeaderLeft}>
          <span className={styles.colIcon}>{cfg.icon}</span>
          <h2 className={styles.colTitle}>{col.title}</h2>
          <div className={styles.colBadge}>{data.length}</div>
        </div>
        <div className={styles.colControls}>
          <button
            className={styles.btnIcon}
            onClick={() => onMoveLeft(col.id)}
            disabled={isFirst}
            title="Move left"
          >
            ←
          </button>
          <button
            className={styles.btnIcon}
            onClick={() => onMoveRight(col.id)}
            disabled={isLast}
            title="Move right"
          >
            →
          </button>
          <button className={styles.btnIcon} onClick={() => setConfirming(true)} title="Remove column">
            ✕
          </button>
        </div>
      </div>

      {confirming && (
        <div className={styles.colConfirmation}>
          <span className={styles.colConfirmationText}>Remove "{col.title}"?</span>
          <div className={styles.colConfirmationButtons}>
            <button
              className={styles.btn}
              onClick={() => setConfirming(false)}
              style={{
                fontSize: "10px",
                color: "#6b7280",
                padding: "2px 6px",
              }}
            >
              No
            </button>
            <button
              className={styles.btn}
              onClick={() => {
                onRemove(col.id);
              }}
              style={{
                fontSize: "10px",
                color: "#f87171",
                padding: "2px 6px",
              }}
            >
              Yes, remove
            </button>
          </div>
        </div>
      )}

      <div className={styles.colBody}>{data.map((item) => renderCard(item))}</div>
    </div>
  );
};
