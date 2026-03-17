import { useState } from "react";
import type { ColumnConfig } from "@/types";
import { COLUMN_TYPES } from "@/constants";
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
    <div className="column" style={{ "--color-accent": cfg.color } as React.CSSProperties}>
      <div className="col-header">
        <div className="col-header-left">
          <span style={{ fontSize: "14px", color: cfg.color }}>{cfg.icon}</span>
          <h2 className="col-title">{col.title}</h2>
          <div className="col-badge">{data.length}</div>
        </div>
        <div className="col-controls">
          <button
            className="btn-icon"
            onClick={() => onMoveLeft(col.id)}
            disabled={isFirst}
            title="Move left"
          >
            ←
          </button>
          <button
            className="btn-icon"
            onClick={() => onMoveRight(col.id)}
            disabled={isLast}
            title="Move right"
          >
            →
          </button>
          <button className="btn-icon" onClick={() => setConfirming(true)} title="Remove column">
            ✕
          </button>
        </div>
      </div>

      {confirming && (
        <div className="col-confirmation">
          <span className="col-confirmation-text">Remove "{col.title}"?</span>
          <div className="col-confirmation-buttons">
            <button
              className="btn"
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
              className="btn"
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

      <div className="col-body">{data.map((item) => renderCard(item))}</div>
    </div>
  );
};
