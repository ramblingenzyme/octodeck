import type {
  ColumnType,
  CIStatus,
  NotifType,
  ActivityType,
  ColumnConfig,
  IconName,
  DeploymentStatus,
  AlertSeverity,
} from "@/types";

export const CI_STATUS: Record<CIStatus, { label: string; icon: IconName }> = {
  success: { label: "PASS", icon: "check" },
  failure: { label: "FAIL", icon: "x" },
  running: { label: "RUN", icon: "circleDot" },
};

export const NOTIF_ICONS: Record<NotifType, IconName> = {
  review_requested: "eye",
  mention: "at",
  assigned: "tag",
  approved: "check",
  comment: "comment",
};

export const ACTIVITY_ICONS: Record<ActivityType, IconName> = {
  commit: "gitCommit",
  comment: "comment",
  pr_opened: "gitMerge",
  pr_merged: "gitMerge",
  review: "eye",
  issue_closed: "x",
  branch_created: "gitBranch",
  fork: "gitFork",
  star: "star",
};

export const COLUMN_TYPES: Record<
  ColumnType,
  { label: string; icon: IconName; itemLabel: string; defaultQuery: string }
> = {
  prs: {
    label: "Pull Requests",
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
  notifications: {
    label: "Notifications",
    icon: "bell",
    itemLabel: "notification",
    defaultQuery: "",
  },
  activity: { label: "My Activity", icon: "gitCommit", itemLabel: "event", defaultQuery: "" },
  releases: { label: "Releases", icon: "tag", itemLabel: "release", defaultQuery: "" },
  deployments: { label: "Deployments", icon: "deploy", itemLabel: "deployment", defaultQuery: "" },
  security: { label: "Security Alerts", icon: "shield", itemLabel: "alert", defaultQuery: "" },
};

export const DEPLOYMENT_STATUS: Record<DeploymentStatus, { label: string; icon: IconName }> = {
  success: { label: "SUCCESS", icon: "check" },
  failure: { label: "FAILED", icon: "x" },
  pending: { label: "PENDING", icon: "circleDot" },
  in_progress: { label: "IN PROGRESS", icon: "refresh" },
};

export const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const mkId = (): string => crypto.randomUUID();

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "col-notifications", type: "notifications", title: "Inbox" },
  { id: "col-prs", type: "prs", title: "Open PRs", query: "involves:@me is:open" },
  { id: "col-issues", type: "issues", title: "Issues", query: "involves:@me is:open" },
  { id: "col-ci", type: "ci", title: "CI / CD" },
  { id: "col-activity", type: "activity", title: "Activity" },
];
