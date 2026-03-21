import type { ColumnConfig, SecurityItem } from "@/types";
import { BaseColumn } from "@/components/BaseColumn";
import { SecurityCard } from "@/components/cards/SecurityCard";
import styles from "./SecurityColumn.module.css";

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const SecurityColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    accentClass={styles.accent}
    col={col}
    onRemove={onRemove}
    renderCard={(item) => <SecurityCard key={item.id} item={item as SecurityItem} />}
  />
);
