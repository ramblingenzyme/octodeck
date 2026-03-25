import type { PRItem } from "@/types";
import { BaseColumn, type ColumnProps } from "@/components/BaseColumn";
import { PRCard } from "@/components/cards/PRCard";
import styles from "./PRColumn.module.css";

export const PRColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    accentClass={styles.accent}
    col={col}
    onRemove={onRemove}
    renderCard={(item) => <PRCard key={item.id} item={item as PRItem} />}
  />
);
