import type { ReleaseItem } from "@/types";
import { BaseColumn, type ColumnProps } from "@/components/BaseColumn";
import { ReleaseCard } from "@/components/cards/ReleaseCard";
import { RepoRequiredEmptyState } from "@/components/RepoRequiredEmptyState";
import styles from "./ReleasesColumn.module.css";

export const ReleasesColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    accentClass={styles.accent}
    col={col}
    onRemove={onRemove}
    renderCard={(item) => <ReleaseCard key={item.id} item={item as ReleaseItem} />}
    emptyState={
      !col.repos?.length
        ? (openSettings) => <RepoRequiredEmptyState onOpenSettings={openSettings} />
        : undefined
    }
  />
);
