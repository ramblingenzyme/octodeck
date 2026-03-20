import type { ColumnConfig, IssueItem } from "@/types";
import { BaseColumn } from "@/components/BaseColumn";
import { IssueCard } from "@/components/cards/IssueCard";

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const IssueColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    col={col}
    onRemove={onRemove}
    renderCard={(item) => <IssueCard key={item.id} item={item as IssueItem} />}
  />
);
