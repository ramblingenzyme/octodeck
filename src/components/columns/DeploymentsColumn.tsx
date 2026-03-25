import type { DeploymentItem } from "@/types";
import { BaseColumn, type ColumnProps } from "@/components/BaseColumn";
import { DeploymentCard } from "@/components/cards/DeploymentCard";
import { RepoRequiredEmptyState } from "@/components/RepoRequiredEmptyState";
import styles from "./DeploymentsColumn.module.css";

export const DeploymentsColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    accentClass={styles.accent}
    col={col}
    onRemove={onRemove}
    renderCard={(item) => <DeploymentCard key={item.id} item={item as DeploymentItem} />}
    emptyState={
      !col.repos?.length
        ? (openSettings) => <RepoRequiredEmptyState onOpenSettings={openSettings} />
        : undefined
    }
  />
);
