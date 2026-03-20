import { useState } from "preact/hooks";
import type {
  ColumnConfig,
  ColumnType,
  PRItem,
  IssueItem,
  CIItem,
  NotifItem,
  ActivityItem,
  FallbackItem,
  AnyItem,
} from "@/types";
import { useColumnData } from "@/hooks/useColumnData";
import { useMinuteTicker } from "@/hooks/useMinuteTicker";
import { useConfirmation } from "@/hooks/useConfirmation";
import { useRefreshSpinner } from "@/hooks/useRefreshSpinner";
import { useColumnDragDrop } from "@/hooks/useColumnDragDrop";
import { useLayoutStore } from "@/store/layoutStore";
import styles from "./Column.module.css";
import { InlineEdit } from "./ui/InlineEdit";
import { ColumnHeader } from "./ColumnHeader";
import { ColumnConfirmDelete } from "./ColumnConfirmDelete";
import { PRCard } from "./cards/PRCard";
import { IssueCard } from "./cards/IssueCard";
import { CICard } from "./cards/CICard";
import { NotifCard } from "./cards/NotifCard";
import { ActivityCard } from "./cards/ActivityCard";
import { FallbackCard } from "./cards/FallbackCard";

function renderCard(colType: ColumnType, item: AnyItem) {
  switch (colType) {
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
    default:
      return <FallbackCard key={item.id} item={item as unknown as FallbackItem} />;
  }
}

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const Column = ({ col, onRemove }: ColumnProps) => {
  const { isConfirming: confirming, startConfirm, cancelConfirm } = useConfirmation();
  const updateColumnQuery = useLayoutStore((s) => s.updateColumnQuery);

  const { data, isLoading, isFetching, error, refetch } = useColumnData(col);
  const { spinning, lastUpdated, handleRefresh } = useRefreshSpinner(isFetching, refetch);
  const { ref, handleRef, isDragging, dropEdge } = useColumnDragDrop(col.id);

  // Re-render every minute so the relative time stays accurate.
  useMinuteTicker();

  const columnClass = [
    styles.column,
    styles[col.type],
    isDragging ? styles.columnDragging : "",
    dropEdge === "left" ? styles.dropLeft : "",
    dropEdge === "right" ? styles.dropRight : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section ref={ref} className={columnClass} aria-label={col.title}>
      <ColumnHeader
        col={col}
        handleRef={handleRef}
        itemCount={data.length}
        isFetching={isFetching}
        spinning={spinning}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        onOpenSettings={() => {}}
        onConfirmRemove={() => startConfirm()}
      />

      {col.query && (
        <div className={styles.colQuery}>
          <InlineEdit
            value={col.query}
            onCommit={(v) => updateColumnQuery(col.id, v)}
            aria-label="Filter query"
          />
        </div>
      )}

      {confirming && (
        <ColumnConfirmDelete
          col={col}
          onCancel={() => cancelConfirm()}
          onConfirm={() => onRemove(col.id)}
        />
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
        {!isLoading && !error && data.map((item) => renderCard(col.type, item))}
      </div>
    </section>
  );
};
