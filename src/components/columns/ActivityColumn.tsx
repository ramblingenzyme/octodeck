import type { ActivityItem, FallbackItem } from "@/types";
import { BaseColumn, type ColumnProps } from "@/components/BaseColumn";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { FallbackCard } from "@/components/cards/FallbackCard";
import styles from "./ActivityColumn.module.css";

export const ActivityColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    accentClass={styles.accent}
    col={col}
    onRemove={onRemove}
    renderCard={(item) => {
      const i = item as ActivityItem | FallbackItem;
      return i.type === "fallback" ? (
        <FallbackCard key={i.id} item={i} />
      ) : (
        <ActivityCard key={i.id} item={i} />
      );
    }}
  />
);
