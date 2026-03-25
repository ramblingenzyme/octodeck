import type { ColumnConfig } from "@/types";
import { ActivityColumn } from "./columns/ActivityColumn";
import { CIColumn } from "./columns/CIColumn";
import { DeploymentsColumn } from "./columns/DeploymentsColumn";
import { IssueColumn } from "./columns/IssueColumn";
import { PRColumn } from "./columns/PRColumn";
import { ReleasesColumn } from "./columns/ReleasesColumn";

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
    case "activity":
      return <ActivityColumn col={col} onRemove={onRemove} />;
    case "releases":
      return <ReleasesColumn col={col} onRemove={onRemove} />;
    case "deployments":
      return <DeploymentsColumn col={col} onRemove={onRemove} />;
    default:
      col.type satisfies never;
      return null;
  }
};
