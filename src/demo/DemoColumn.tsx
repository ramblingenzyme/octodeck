import { useState } from "preact/hooks";
import type { ReactNode } from "preact/compat";
import type {
  ActivityItem,
  AnyItem,
  CIItem,
  ColumnConfig,
  DeploymentItem,
  FallbackItem,
  IssueItem,
  PRItem,
  ReleaseItem,
} from "@/types";
import { useLayoutStore } from "@/store/layoutStore";
import { useConfirmation } from "@/hooks/useConfirmation";
import { useColumnDragDrop } from "@/hooks/useColumnDragDrop";
import { ColumnHeader } from "@/components/ColumnHeader";
import { ColumnConfirmDelete } from "@/components/ColumnConfirmDelete";
import { ColumnSettingsModal } from "@/components/ColumnSettingsModal";
import { InlineEdit } from "@/components/ui/InlineEdit";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { CICard } from "@/components/cards/CICard";
import { DeploymentCard } from "@/components/cards/DeploymentCard";
import { FallbackCard } from "@/components/cards/FallbackCard";
import { IssueCard } from "@/components/cards/IssueCard";
import { PRCard } from "@/components/cards/PRCard";
import { ReleaseCard } from "@/components/cards/ReleaseCard";
import { useDemoColumnData } from "./useDemoColumnData";
import columnStyles from "@/components/BaseColumn.module.css";
import prStyles from "@/components/columns/PRColumn.module.css";
import issueStyles from "@/components/columns/IssueColumn.module.css";
import ciStyles from "@/components/columns/CIColumn.module.css";
import activityStyles from "@/components/columns/ActivityColumn.module.css";
import releasesStyles from "@/components/columns/ReleasesColumn.module.css";
import deploymentsStyles from "@/components/columns/DeploymentsColumn.module.css";

const ACCENT: Record<ColumnConfig["type"], string> = {
  prs: prStyles.accent,
  issues: issueStyles.accent,
  ci: ciStyles.accent,
  activity: activityStyles.accent,
  releases: releasesStyles.accent,
  deployments: deploymentsStyles.accent,
};

function renderCard(item: AnyItem): ReactNode {
  switch (item.type) {
    case "pr":
      return <PRCard key={item.id} item={item as PRItem} />;
    case "issue":
      return <IssueCard key={item.id} item={item as IssueItem} />;
    case "ci":
      return <CICard key={item.id} item={item as CIItem} />;
    case "activity":
      return <ActivityCard key={item.id} item={item as ActivityItem} />;
    case "release":
      return <ReleaseCard key={item.id} item={item as ReleaseItem} />;
    case "deployment":
      return <DeploymentCard key={item.id} item={item as DeploymentItem} />;
    case "fallback":
      return <FallbackCard key={item.id} item={item as FallbackItem} />;
  }
}

export interface DemoColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const DemoColumn = ({ col, onRemove }: DemoColumnProps) => {
  const { isConfirming, startConfirm, cancelConfirm } = useConfirmation();
  const updateColumnQuery = useLayoutStore((s) => s.updateColumnQuery);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { ref, handleRef, isDragging, dropEdge } = useColumnDragDrop(col.id);

  const { data } = useDemoColumnData(col);

  const columnClass = [
    columnStyles.column,
    ACCENT[col.type],
    isDragging ? columnStyles.columnDragging : "",
    dropEdge === "left" ? columnStyles.dropLeft : "",
    dropEdge === "right" ? columnStyles.dropRight : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <ColumnSettingsModal open={settingsOpen} col={col} onClose={() => setSettingsOpen(false)} />
      <section ref={ref} className={columnClass} aria-label={col.title}>
        <ColumnHeader
          col={col}
          handleRef={handleRef}
          itemCount={data.length}
          isFetching={false}
          spinning={false}
          lastUpdated={null}
          onRefresh={() => {}}
          onConfirmRemove={startConfirm}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <div className={columnStyles.colQuery}>
          <InlineEdit
            value={col.query ?? ""}
            onCommit={(v) => updateColumnQuery(col.id, v)}
            placeholder="Add filter…"
            aria-label="Filter query"
          />
        </div>

        {isConfirming && (
          <ColumnConfirmDelete
            col={col}
            onCancel={cancelConfirm}
            onConfirm={() => onRemove(col.id)}
          />
        )}

        <div className={columnStyles.colBody}>
          {data.length === 0 ? (
            <p className={columnStyles.emptyState}>No results</p>
          ) : (
            data.map((item) => renderCard(item))
          )}
        </div>
      </section>
    </>
  );
};
