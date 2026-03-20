import type { ColumnConfig, NotifItem } from "@/types";
import { BaseColumn } from "@/components/BaseColumn";
import { NotifCard } from "@/components/cards/NotifCard";

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const NotifColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    col={col}
    onRemove={onRemove}
    renderCard={(item) => <NotifCard key={item.id} item={item as NotifItem} />}
  />
);
