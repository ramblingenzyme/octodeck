import type { ColumnConfig, ReleaseItem } from "@/types";
import { BaseColumn } from "@/components/BaseColumn";
import { ReleaseCard } from "@/components/cards/ReleaseCard";
import styles from "./ReleasesColumn.module.css";

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const ReleasesColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    accentClass={styles.accent}
    col={col}
    onRemove={onRemove}
    renderCard={(item) => <ReleaseCard key={item.id} item={item as ReleaseItem} />}
  />
);
