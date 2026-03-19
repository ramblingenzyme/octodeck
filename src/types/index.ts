export type ColumnType = "prs" | "issues" | "ci" | "notifications" | "activity";
export type CIStatus = "success" | "failure" | "running";
export type NotifType = "review_requested" | "mention" | "assigned" | "approved" | "comment";
export type ActivityType = "commit" | "comment" | "pr_opened" | "review" | "issue_closed";

export interface ColumnConfig {
  id: string;
  type: ColumnType;
  title: string;
  query?: string;
}

export interface PRItem {
  id: number;
  title: string;
  repo: string;
  author: string;
  number: number;
  reviews: { approved: number; requested: number };
  comments: number;
  draft: boolean;
  age: string;
  labels: string[];
  url: string;
}

export interface IssueItem {
  id: number;
  title: string;
  repo: string;
  number: number;
  labels: string[];
  assignee: string | null;
  comments: number;
  age: string;
  state: "open" | "closed";
  url: string;
}

export interface CIItem {
  id: number;
  name: string;
  repo: string;
  branch: string;
  status: CIStatus;
  duration: string;
  age: string;
  triggered: "push" | "pull_request" | "release";
  url: string;
}

export interface NotifItem {
  id: number;
  type: NotifType;
  text: string;
  repo: string;
  ref: string;
  age: string;
  url: string;
}

export interface ActivityItem {
  id: number;
  type: ActivityType;
  text: string;
  repo: string;
  age: string;
  ref?: string;
  url: string;
}

export type KnownItem = PRItem | IssueItem | CIItem | NotifItem | ActivityItem;
export type AnyItem = KnownItem | FallbackItem;

export interface FallbackItem {
  id: number;
  title: string;
  repo: string;
  age: string;
  url: string;
  [key: string]: unknown;
}
