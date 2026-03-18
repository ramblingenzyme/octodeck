import { useState, useEffect, useRef } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { ColumnConfig, PRItem, IssueItem, CIItem, NotifItem, ActivityItem } from "@/types";
import { COLUMN_TYPES } from "@/constants";
import { useColumnData } from "@/hooks/useColumnData";
import styles from "./Column.module.css";
import { Icon } from './ui/Icon';
import { Tooltip } from './ui/Tooltip';
import { PRCard } from "./cards/PRCard";
import { IssueCard } from "./cards/IssueCard";
import { CICard } from "./cards/CICard";
import { NotifCard } from "./cards/NotifCard";
import { ActivityCard } from "./cards/ActivityCard";
import { ColumnSettingsModal } from "./ColumnSettingsModal";

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const Column = ({ col, onRemove }: ColumnProps) => {
  const [confirming, setConfirming] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [, setTick] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const cfg = COLUMN_TYPES[col.type];
  const { data, isLoading, isFetching, error, refetch } = useColumnData(col);
  const prevFetching = useRef(false);

  useEffect(() => {
    if (prevFetching.current && !isFetching) {
      setLastUpdated(new Date());
    }
    prevFetching.current = isFetching;
  }, [isFetching]);

  // Re-render every minute so the relative time stays accurate.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cleanupDraggable = draggable({
      element: el,
      getInitialData: () => ({ columnId: col.id }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
    const cleanupDropTarget = dropTargetForElements({
      element: el,
      getData: () => ({ columnId: col.id }),
    });
    return () => {
      cleanupDraggable();
      cleanupDropTarget();
    };
  }, [col.id]);

  const handleRefresh = () => {
    refetch();
    setSpinning(true);
    setTimeout(() => setSpinning(false), 800);
  };

  const formatAge = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60_000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1m ago';
    return `${mins}m ago`;
  };

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
    <section
      ref={ref}
      className={`${styles.column} ${styles[col.type]}`}
      aria-label={col.title}
      style={isDragging ? { opacity: 0.5 } : undefined}
    >
      <header className={styles.colHeader}>
        <div className={styles.colHeaderLeft}>
          <Icon className={styles.colIcon}>{cfg.icon}</Icon>
          <Tooltip text={col.title} position="below">
            <h2 className={styles.colTitle}>{col.title}</h2>
          </Tooltip>
          <Tooltip text={`${data.length} ${data.length === 1 ? cfg.itemLabel : `${cfg.itemLabel}s`}`} position="below">
            <output className={styles.colBadge} aria-label={`${data.length} ${data.length === 1 ? cfg.itemLabel : `${cfg.itemLabel}s`}`}>
              {data.length}
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
              className={`${styles.btnIcon} ${spinning || isFetching ? styles.btnIconSpinning : ""}`}
              onClick={handleRefresh}
              aria-label="Refresh"
            >
              <Icon>↻</Icon>
            </button>
          </Tooltip>
          <Tooltip text="Column filters" position="below">
            <button
              className={`${styles.btnIcon} ${col.query ? styles.btnIconActive : ""}`}
              onClick={() => setShowSettings(true)}
              aria-label="Column filters"
            >
              <Icon>⚙</Icon>
            </button>
          </Tooltip>
          <Tooltip text="Remove column" position="below">
            <button
              className={styles.btnIcon}
              onClick={() => setConfirming(true)}
              aria-label="Remove column"
            >
              <Icon>✕</Icon>
            </button>
          </Tooltip>
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
        {!isLoading && !error && data.map((item) => renderCard(item))}
      </div>

      {showSettings && <ColumnSettingsModal col={col} onClose={() => setShowSettings(false)} />}
    </section>
  );
};
