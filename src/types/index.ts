export type ColumnType =
  | "prs"
  | "issues"
  | "ci"
  | "activity"
  | "releases"
  | "deployments"
  | "security";
export type IconName =
  | "check"
  | "x"
  | "refresh"
  | "circleDot"
  | "at"
  | "arrowRight"
  | "grip"
  | "comment"
  | "bell"
  | "gitMerge"
  | "gitCommit"
  | "eye"
  | "play"
  | "issueOpen"
  | "tag"
  | "gitBranch"
  | "gitFork"
  | "star"
  | "deploy"
  | "shield";
export type CIStatus = "success" | "failure" | "running";
export type IssueState = "open" | "closed";
export type CITrigger = "push" | "pull_request" | "release";
export type ActivityType =
  | "commit"
  | "comment"
  | "pr_opened"
  | "pr_merged"
  | "review"
  | "issue_closed"
  | "branch_created"
  | "fork"
  | "star";

export interface ColumnConfig {
  id: string;
  type: ColumnType;
  title: string;
  repos?: string[];
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
  labels: Label[];
  url: string;
}

export interface IssueItem {
  id: number;
  title: string;
  repo: string;
  number: number;
  labels: Label[];
  assignee: string | null;
  comments: number;
  age: string;
  state: IssueState;
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
  triggered: CITrigger;
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

export interface Label {
  name: string;
  color: string;
}

export type DeploymentStatus = "success" | "failure" | "pending" | "in_progress" | "unknown";
export type AlertSeverity = "critical" | "high" | "medium" | "low";

export interface ReleaseItem {
  id: number;
  repo: string;
  tag: string;
  name: string;
  prerelease: boolean;
  age: string;
  url: string;
}

export interface DeploymentItem {
  id: number;
  repo: string;
  environment: string;
  status: DeploymentStatus;
  ref: string;
  creator: string;
  age: string;
  url: string;
}

export interface SecurityItem {
  id: number;
  repo: string;
  package: string;
  severity: AlertSeverity;
  summary: string;
  age: string;
  url: string;
}

export type KnownItem =
  | PRItem
  | IssueItem
  | CIItem
  | ActivityItem
  | ReleaseItem
  | DeploymentItem
  | SecurityItem;
export type AnyItem = KnownItem | FallbackItem;

export interface FallbackItem {
  id: number;
  title: string;
  repo: string;
  age: string;
  url: string;
  [key: string]: unknown;
}
