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
import { useUpdateColumnQueryMutation } from "@/store/configApi";
import styles from "./Column.module.css";
import { Icon } from "./ui/Icon";
import { PencilIcon } from "./ui/PencilIcon";
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
  const [editingQuery, setEditingQuery] = useState(false);
  const [draftQuery, setDraftQuery] = useState("");
  const [updateColumnQuery] = useUpdateColumnQueryMutation();

  const startEditQuery = () => {
    setDraftQuery(col.query ?? "");
    setEditingQuery(true);
  };
  const confirmQuery = () => {
    updateColumnQuery({ id: col.id, query: draftQuery });
    setEditingQuery(false);
  };

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
        onOpenSettings={startEditQuery}
        onConfirmRemove={() => startConfirm()}
      />

      {(col.query || editingQuery) && (
        <div className={styles.colQuery}>
          {editingQuery ? (
            <>
              <input
                className={styles.colQueryInput}
                value={draftQuery}
                onChange={(e) => setDraftQuery((e.target as HTMLInputElement).value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmQuery();
                  if (e.key === "Escape") setEditingQuery(false);
                }}
                // eslint-disable-next-line jsx-a11y/no-autofocus -- user-triggered edit (clicking the query text), not autofocus on page load
                autoFocus
                aria-label="Filter query"
              />
              <button
                className={styles.colQueryConfirm}
                onClick={confirmQuery}
                aria-label="Confirm"
              >
                ✓
              </button>
              <button
                className={styles.colQueryCancel}
                onClick={() => setEditingQuery(false)}
                aria-label="Cancel"
              >
                <Icon>✕</Icon>
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles.colQueryText}
              onClick={startEditQuery}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") startEditQuery();
              }}
              aria-label="Edit filter query"
              title={col.query}
            >
              {col.query}
              <PencilIcon className={styles.colQueryPencil} />
            </button>
          )}
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
