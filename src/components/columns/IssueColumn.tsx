import type { IssueItem } from "@/types";
import { BaseColumn, type ColumnProps } from "@/components/BaseColumn";
import { IssueCard } from "@/components/cards/IssueCard";
import styles from "./IssueColumn.module.css";

export const IssueColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    accentClass={styles.accent}
    col={col}
    onRemove={onRemove}
    renderCard={(item) => <IssueCard key={item.id} item={item as IssueItem} />}
  />
);
