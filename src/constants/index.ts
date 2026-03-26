import type {
  ColumnType,
  CIStatus,
  ActivityType,
  ColumnConfig,
  DeploymentStatus,
  PRStatus,
  IssueState,
} from "@/types";
import type { IconName } from "@/components/ui/SvgIcon";

export const CI_STATUS: Record<CIStatus, { label: string; icon: IconName }> = {
  success: { label: "PASS", icon: "check" },
  failure: { label: "FAIL", icon: "x" },
  running: { label: "RUN", icon: "circleDot" },
};

export const ACTIVITY_KINDS: Record<ActivityType, { icon: IconName; label: string }> = {
  commit: { icon: "gitCommit", label: "Commit" },
  comment: { icon: "comment", label: "Comment" },
  pr_opened: { icon: "gitMerge", label: "PR Opened" },
  pr_merged: { icon: "gitMerge", label: "PR Merged" },
  review: { icon: "eye", label: "Review" },
  issue_closed: { icon: "x", label: "Issue Closed" },
  branch_created: { icon: "gitBranch", label: "Branch" },
  fork: { icon: "gitFork", label: "Fork" },
  star: { icon: "star", label: "Starred" },
};

export const COLUMN_TYPES: Record<
  ColumnType,
  { label: string; icon: IconName; itemLabel: string; defaultQuery: string }
> = {
  prs: {
    label: "Open PRs",
    icon: "gitMerge",
    itemLabel: "PR",
    defaultQuery: "involves:@me is:open",
  },
  issues: {
    label: "Issues",
    icon: "issueOpen",
    itemLabel: "issue",
    defaultQuery: "involves:@me is:open",
  },
  ci: { label: "CI / CD", icon: "play", itemLabel: "run", defaultQuery: "" },
  activity: { label: "Activity", icon: "gitCommit", itemLabel: "event", defaultQuery: "" },
  releases: { label: "Releases", icon: "tag", itemLabel: "release", defaultQuery: "" },
  deployments: { label: "Deployments", icon: "deploy", itemLabel: "deployment", defaultQuery: "" },
};

export const PR_STATUS: Record<PRStatus, { icon: IconName }> = {
  open: { icon: "circleDot" },
  draft: { icon: "pencil" },
  merged: { icon: "gitMerge" },
  closed: { icon: "x" },
};

export const ISSUE_STATUS: Record<IssueState, { icon: IconName }> = {
  open: { icon: "issueOpen" },
  closed: { icon: "x" },
};

export const DEPLOYMENT_STATUS: Record<DeploymentStatus, { label: string; icon: IconName }> = {
  success: { label: "SUCCESS", icon: "check" },
  failure: { label: "FAILED", icon: "x" },
  pending: { label: "PENDING", icon: "circleDot" },
  in_progress: { label: "IN PROGRESS", icon: "refresh" },
  unknown: { label: "UNKNOWN", icon: "circleDot" },
};

export const MULTI_REPO_COLUMN_TYPES = new Set<ColumnType>(["ci", "releases", "deployments"]);

export const mkId = (): string => crypto.randomUUID();

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "col-prs", type: "prs", title: "Open PRs", query: "involves:@me is:open" },
  { id: "col-issues", type: "issues", title: "Issues", query: "involves:@me is:open" },
  { id: "col-ci", type: "ci", title: "CI / CD" },
  { id: "col-activity", type: "activity", title: "Activity" },
];

export const DEMO_COLUMNS: ColumnConfig[] = [
  { id: "demo-prs", type: "prs", title: "Pull Requests", query: "is:open" },
  { id: "demo-issues", type: "issues", title: "Issues", query: "is:open" },
  { id: "demo-ci", type: "ci", title: "CI / CD", query: "" },
  { id: "demo-activity", type: "activity", title: "Activity", query: "" },
  { id: "demo-releases", type: "releases", title: "Releases", query: "" },
  { id: "demo-deployments", type: "deployments", title: "Deployments", query: "" },
];
