import type { ColumnProps } from "./BaseColumn";
import { ActivityColumn } from "./columns/ActivityColumn";
import { CIColumn } from "./columns/CIColumn";
import { DeploymentsColumn } from "./columns/DeploymentsColumn";
import { IssueColumn } from "./columns/IssueColumn";
import { PRColumn } from "./columns/PRColumn";
import { ReleasesColumn } from "./columns/ReleasesColumn";

export const Column = (props: ColumnProps) => {
  switch (props.col.type) {
    case "prs":
      return <PRColumn {...props} />;
    case "issues":
      return <IssueColumn {...props} />;
    case "ci":
      return <CIColumn {...props} />;
    case "activity":
      return <ActivityColumn {...props} />;
    case "releases":
      return <ReleasesColumn {...props} />;
    case "deployments":
      return <DeploymentsColumn {...props} />;
    default:
      props.col.type satisfies never;
      return null;
  }
};
