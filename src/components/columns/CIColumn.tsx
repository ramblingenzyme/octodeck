import type { ColumnConfig, CIItem } from "@/types";
import { BaseColumn } from "@/components/BaseColumn";
import { CICard } from "@/components/cards/CICard";

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const CIColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    col={col}
    onRemove={onRemove}
    renderCard={(item) => <CICard key={item.id} item={item as CIItem} />}
  />
);
