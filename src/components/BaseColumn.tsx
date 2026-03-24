import { useEffect, useRef, useState } from "preact/hooks";
import type { ReactNode } from "preact/compat";
import type { ColumnConfig, AnyItem } from "@/types";
import { useColumnData } from "@/hooks/useColumnData";
import { useMinuteTicker } from "@/hooks/useMinuteTicker";
import { useConfirmation } from "@/hooks/useConfirmation";
import { useRefreshSpinner } from "@/hooks/useRefreshSpinner";
import { useColumnDragDrop } from "@/hooks/useColumnDragDrop";
import { useLayoutStore } from "@/store/layoutStore";
import styles from "./BaseColumn.module.css";
import { InlineEdit } from "./ui/InlineEdit";
import { ColumnHeader } from "./ColumnHeader";
import { ColumnConfirmDelete } from "./ColumnConfirmDelete";
import { ColumnSettingsModal } from "./ColumnSettingsModal";
import { Tooltip } from "./ui/Tooltip";

interface BaseColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
  renderCard: (item: AnyItem) => ReactNode;
  accentClass?: string;
}

export const BaseColumn = ({ col, onRemove, renderCard, accentClass }: BaseColumnProps) => {
  const { isConfirming: confirming, startConfirm, cancelConfirm } = useConfirmation();
  const updateColumnQuery = useLayoutStore((s) => s.updateColumnQuery);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data, isLoading, isFetching, error, warnings, refetch } = useColumnData(col);
  const [warnDismissed, setWarnDismissed] = useState(false);
  const prevWarningsKey = useRef("");
  useEffect(() => {
    const key = warnings.join("\n");
    if (key !== prevWarningsKey.current) {
      prevWarningsKey.current = key;
      setWarnDismissed(false);
    }
  }, [warnings]);
  const { spinning, lastUpdated, handleRefresh } = useRefreshSpinner(isFetching, refetch);
  const { ref, handleRef, isDragging, dropEdge } = useColumnDragDrop(col.id);

  useMinuteTicker();

  const columnClass = [
    styles.column,
    accentClass,
    isDragging ? styles.columnDragging : "",
    dropEdge === "left" ? styles.dropLeft : "",
    dropEdge === "right" ? styles.dropRight : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* TODO: determine if it's worth refactoring so ColumnSettingsModal doesn't get rendered for each column */}
      <ColumnSettingsModal open={settingsOpen} col={col} onClose={() => setSettingsOpen(false)} />
      <section ref={ref} className={columnClass} aria-label={col.title}>
        <ColumnHeader
          col={col}
          handleRef={handleRef}
          itemCount={data.length}
          isFetching={isFetching}
          spinning={spinning}
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          onConfirmRemove={() => startConfirm()}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <div className={styles.colQuery}>
          <InlineEdit
            value={col.query ?? ""}
            onCommit={(v) => updateColumnQuery(col.id, v)}
            placeholder="Add filter…"
            aria-label="Filter query"
          />
          {col.repos && col.repos.length > 0 && (
            <Tooltip
              text={
                <ul className={styles.repoList}>
                  {col.repos.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              }
              position="below"
              align="end"
            >
              <span className={styles.repoCount}>{col.repos.length}</span>
            </Tooltip>
          )}
        </div>

        {confirming && (
          <ColumnConfirmDelete
            col={col}
            onCancel={() => cancelConfirm()}
            onConfirm={() => onRemove(col.id)}
          />
        )}

        {warnings.length > 0 && !warnDismissed && (
          <div className={styles.warningBanner} role="alert">
            <span>
              {warnings.length === 1 ? warnings[0] : `${warnings.length} repos failed to load`}
            </span>
            <button onClick={() => setWarnDismissed(true)} aria-label="Dismiss warning">
              ×
            </button>
          </div>
        )}

        <div className={styles.colBody}>
          {/* TOOD: refactor so that all these renders are exclusive */}
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
          {!isLoading && !error && data.length === 0 && (
            <p className={styles.emptyState}>No results</p>
          )}
          {!isLoading && !error && data.length > 0 && data.map((item) => renderCard(item))}
        </div>
      </section>
    </>
  );
};
