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

export const COLUMN_TYPES: Record<ColumnType, { label: string; icon: string }> = {
  prs: { label: "Pull Requests", icon: "⟳" },
  issues: { label: "Issues", icon: "◎" },
  ci: { label: "CI / CD", icon: "◉" },
  notifications: { label: "Notifications", icon: "@" },
  activity: { label: "My Activity", icon: "●" },
};

let _nextId = 100;
export const mkId = (): number => ++_nextId;

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 1, type: "notifications", title: "Inbox" },
  { id: 2, type: "prs", title: "Open PRs" },
  { id: 3, type: "issues", title: "Issues" },
  { id: 4, type: "ci", title: "CI / CD" },
  { id: 5, type: "activity", title: "Activity" },
];
