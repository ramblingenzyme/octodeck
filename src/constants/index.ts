import type { ColumnType, CIStatus, NotifType, ActivityType, ColumnConfig } from "@/types";

export const CI_STATUS: Record<CIStatus, { label: string; icon: string }> = {
  success: { label: "PASS", icon: "✓" },
  failure: { label: "FAIL", icon: "✗" },
  running: { label: "RUN", icon: "◉" },
};

export const NOTIF_ICONS: Record<NotifType, string> = {
  review_requested: "⟳",
  mention: "@",
  assigned: "→",
  approved: "✓",
  comment: "◈",
};

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  commit: "●",
  comment: "◈",
  pr_opened: "⟳",
  review: "◈",
  issue_closed: "✗",
};

export const COLUMN_TYPES: Record<
  ColumnType,
  { label: string; icon: string; itemLabel: string; defaultQuery: string }
> = {
  prs: { label: "Pull Requests", icon: "⟳", itemLabel: "PR", defaultQuery: "involves:@me is:open" },
  issues: { label: "Issues", icon: "◎", itemLabel: "issue", defaultQuery: "involves:@me is:open" },
  ci: { label: "CI / CD", icon: "◉", itemLabel: "run", defaultQuery: "" },
  notifications: { label: "Notifications", icon: "@", itemLabel: "notification", defaultQuery: "" },
  activity: { label: "My Activity", icon: "●", itemLabel: "event", defaultQuery: "" },
};

export const mkId = (): string => crypto.randomUUID();

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "col-notifications", type: "notifications", title: "Inbox" },
  { id: "col-prs", type: "prs", title: "Open PRs", query: "involves:@me is:open" },
  { id: "col-issues", type: "issues", title: "Issues", query: "involves:@me is:open" },
  { id: "col-ci", type: "ci", title: "CI / CD" },
  { id: "col-activity", type: "activity", title: "Activity" },
];
