import type { ColumnType, CIStatus, NotifType, ActivityType, ColumnConfig } from "@/types";

export const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  bug: { bg: "#3d1414", text: "#f87171" },
  critical: { bg: "#4a1515", text: "#fca5a5" },
  urgent: { bg: "#4a1515", text: "#fca5a5" },
  enhancement: { bg: "#0f2d1f", text: "#4ade80" },
  refactor: { bg: "#1a1a2e", text: "#818cf8" },
  documentation: { bg: "#1e2a1e", text: "#86efac" },
  dependencies: { bg: "#1a1a1a", text: "#9ca3af" },
  perf: { bg: "#1a2a1a", text: "#6ee7b7" },
  platform: { bg: "#1a1a2e", text: "#a5b4fc" },
  observability: { bg: "#2a1a2e", text: "#c4b5fd" },
};

export const LABEL_FALLBACK: { bg: string; text: string } = {
  bg: "#1a1a1a",
  text: "#9ca3af",
};

export const CI_STATUS: Record<
  CIStatus,
  { color: string; bg: string; label: string; icon: string }
> = {
  success: { color: "#4ade80", bg: "#0f2d1f", label: "PASS", icon: "✓" },
  failure: { color: "#f87171", bg: "#3d1414", label: "FAIL", icon: "✗" },
  running: { color: "#fbbf24", bg: "#2d1f0a", label: "RUN", icon: "◉" },
};

export const NOTIF_ICONS: Record<NotifType, string> = {
  review_requested: "⟳",
  mention: "@",
  assigned: "→",
  approved: "✓",
  comment: "💬",
};

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  commit: "●",
  comment: "💬",
  pr_opened: "⟳",
  review: "◈",
  issue_closed: "✗",
};

export const COLUMN_TYPES: Record<ColumnType, { label: string; icon: string; color: string }> = {
  prs: { label: "Pull Requests", icon: "⟳", color: "#818cf8" },
  issues: { label: "Issues", icon: "◎", color: "#f87171" },
  ci: { label: "CI / CD", icon: "◉", color: "#fbbf24" },
  notifications: { label: "Notifications", icon: "@", color: "#4ade80" },
  activity: { label: "My Activity", icon: "●", color: "#c4b5fd" },
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
