import type { ReactNode } from "preact/compat";
import { useState } from "preact/hooks";
import type { ColumnConfig, AnyItem } from "@/types";
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

interface BaseColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
  renderCard: (item: AnyItem) => ReactNode;
}

export const BaseColumn = ({ col, onRemove, renderCard }: BaseColumnProps) => {
  const { isConfirming: confirming, startConfirm, cancelConfirm } = useConfirmation();
  const [queryOpen, setQueryOpen] = useState(false);
  const updateColumnQuery = useLayoutStore((s) => s.updateColumnQuery);

  const { data, isLoading, isFetching, error, refetch } = useColumnData(col);
  const { spinning, lastUpdated, handleRefresh } = useRefreshSpinner(isFetching, refetch);
  const { ref, handleRef, isDragging, dropEdge } = useColumnDragDrop(col.id);

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
        onOpenSettings={() => setQueryOpen(true)}
        onConfirmRemove={() => startConfirm()}
      />

      {(col.query != null || queryOpen) && (
        <div className={styles.colQuery}>
          <InlineEdit
            value={col.query ?? ""}
            initialEditing={queryOpen}
            onCommit={(v) => {
              updateColumnQuery(col.id, v);
              setQueryOpen(false);
            }}
            onCancel={() => setQueryOpen(false)}
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
        {!isLoading && !error && data.map((item) => renderCard(item))}
      </div>
    </section>
  );
};
