import { lazy, Suspense } from "preact/compat";
import type { ColumnConfig } from "@/types";

const PRColumn = lazy(() => import("./columns/PRColumn").then((m) => ({ default: m.PRColumn })));
const IssueColumn = lazy(() =>
  import("./columns/IssueColumn").then((m) => ({ default: m.IssueColumn })),
);
const CIColumn = lazy(() => import("./columns/CIColumn").then((m) => ({ default: m.CIColumn })));
const NotifColumn = lazy(() =>
  import("./columns/NotifColumn").then((m) => ({ default: m.NotifColumn })),
);
const ActivityColumn = lazy(() =>
  import("./columns/ActivityColumn").then((m) => ({ default: m.ActivityColumn })),
);
const ReleasesColumn = lazy(() =>
  import("./columns/ReleasesColumn").then((m) => ({ default: m.ReleasesColumn })),
);
const DeploymentsColumn = lazy(() =>
  import("./columns/DeploymentsColumn").then((m) => ({ default: m.DeploymentsColumn })),
);
const SecurityColumn = lazy(() =>
  import("./columns/SecurityColumn").then((m) => ({ default: m.SecurityColumn })),
);

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const Column = ({ col, onRemove }: ColumnProps) => {
  switch (col.type) {
    case "prs":
      return (
        <Suspense fallback={null}>
          <PRColumn col={col} onRemove={onRemove} />
        </Suspense>
      );
    case "issues":
      return (
        <Suspense fallback={null}>
          <IssueColumn col={col} onRemove={onRemove} />
        </Suspense>
      );
    case "ci":
      return (
        <Suspense fallback={null}>
          <CIColumn col={col} onRemove={onRemove} />
        </Suspense>
      );
    case "notifications":
      return (
        <Suspense fallback={null}>
          <NotifColumn col={col} onRemove={onRemove} />
        </Suspense>
      );
    case "activity":
      return (
        <Suspense fallback={null}>
          <ActivityColumn col={col} onRemove={onRemove} />
        </Suspense>
      );
    case "releases":
      return (
        <Suspense fallback={null}>
          <ReleasesColumn col={col} onRemove={onRemove} />
        </Suspense>
      );
    case "deployments":
      return (
        <Suspense fallback={null}>
          <DeploymentsColumn col={col} onRemove={onRemove} />
        </Suspense>
      );
    case "security":
      return (
        <Suspense fallback={null}>
          <SecurityColumn col={col} onRemove={onRemove} />
        </Suspense>
      );
    default:
      col.type satisfies never;
      return null;
  }
};
