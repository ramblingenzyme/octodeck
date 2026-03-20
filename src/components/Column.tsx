import type { ColumnConfig } from "@/types";
import { PRColumn } from "./columns/PRColumn";
import { IssueColumn } from "./columns/IssueColumn";
import { CIColumn } from "./columns/CIColumn";
import { NotifColumn } from "./columns/NotifColumn";
import { ActivityColumn } from "./columns/ActivityColumn";

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const Column = ({ col, onRemove }: ColumnProps) => {
  switch (col.type) {
    case "prs":
      return <PRColumn col={col} onRemove={onRemove} />;
    case "issues":
      return <IssueColumn col={col} onRemove={onRemove} />;
    case "ci":
      return <CIColumn col={col} onRemove={onRemove} />;
    case "notifications":
      return <NotifColumn col={col} onRemove={onRemove} />;
    case "activity":
      return <ActivityColumn col={col} onRemove={onRemove} />;
  }
};
