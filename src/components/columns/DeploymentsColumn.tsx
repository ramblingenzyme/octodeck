import type { ColumnConfig, DeploymentItem } from "@/types";
import { BaseColumn } from "@/components/BaseColumn";
import { DeploymentCard } from "@/components/cards/DeploymentCard";
import styles from "./DeploymentsColumn.module.css";

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const DeploymentsColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    accentClass={styles.accent}
    col={col}
    onRemove={onRemove}
    renderCard={(item) => <DeploymentCard key={item.id} item={item as DeploymentItem} />}
  />
);
