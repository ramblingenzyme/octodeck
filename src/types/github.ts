export interface GHRepo {
  id: number;
  full_name: string;
}

export interface GHUser {
  login: string;
  avatar_url: string;
  name: string | null;
}

export interface GHSearchItem {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  draft?: boolean;
  user: { login: string };
  repository_url: string;
  labels: Array<{ name: string; color: string }>;
  comments: number;
  created_at: string;
  updated_at: string;
  pull_request?: { merged_at: string | null };
  assignees?: Array<{ login: string }>;
}

export interface GHSearchResult {
  total_count: number;
  items: GHSearchItem[];
}

export interface GHRepo {
  full_name: string;
  owner: { login: string };
  name: string;
}

export interface GHWorkflowRun {
  id: number;
  name: string;
  html_url: string;
  head_branch: string;
  status: string;
  conclusion: string | null;
  event: string;
  created_at: string;
  updated_at: string;
  run_started_at?: string;
  repository?: { full_name: string };
}

export interface GHWorkflowRunsResult {
  workflow_runs: GHWorkflowRun[];
}

export interface GHRelease {
  id: number;
  tag_name: string;
  name: string | null;
  prerelease: boolean;
  html_url: string;
  published_at: string;
}

export interface GHDeployment {
  id: number;
  ref: string;
  environment: string;
  creator: { login: string };
  created_at: string;
}

export interface GHDeploymentStatus {
  state: string;
}

export interface GHPRReview {
  id: number;
  state: string;
  user: { login: string };
}

export interface GHPRRequestedReviewers {
  users: Array<{ login: string }>;
  teams: Array<{ slug: string }>;
}

interface GHEventBase {
  id: string;
  repo: { name: string };
  created_at: string;
}

export interface GHPushEvent extends GHEventBase {
  type: "PushEvent";
  payload: {
    ref?: string;
    head?: string;
    commits?: Array<{ sha: string; message: string }>;
    size?: number;
    distinct_size?: number;
  };
}

export interface GHPullRequestEvent extends GHEventBase {
  type: "PullRequestEvent";
  payload: {
    action: string;
    pull_request: { number: number; title: string; html_url: string };
  };
}

export interface GHIssueCommentEvent extends GHEventBase {
  type: "IssueCommentEvent";
  payload: {
    issue: { number: number; title: string; html_url: string };
    comment: { body: string; html_url: string };
  };
}

export interface GHPRReviewCommentEvent extends GHEventBase {
  type: "PullRequestReviewCommentEvent";
  payload: {
    comment: { body: string; html_url: string };
    issue?: { number: number; title: string; html_url: string };
  };
}

export interface GHPRReviewEvent extends GHEventBase {
  type: "PullRequestReviewEvent";
  payload: {
    pull_request: { number: number; title: string; html_url: string };
  };
}

export interface GHIssuesEvent extends GHEventBase {
  type: "IssuesEvent";
  payload: {
    action: string;
    issue: { number: number; title: string; html_url: string };
  };
}

export interface GHCreateEvent extends GHEventBase {
  type: "CreateEvent";
  payload: {
    ref_type: string;
    ref?: string;
  };
}

export interface GHForkEvent extends GHEventBase {
  type: "ForkEvent";
  payload: {
    forkee: { full_name: string; html_url: string };
  };
}

export interface GHWatchEvent extends GHEventBase {
  type: "WatchEvent";
  payload: Record<string, never>;
}

export type GHEvent =
  | GHPushEvent
  | GHPullRequestEvent
  | GHIssueCommentEvent
  | GHPRReviewCommentEvent
  | GHPRReviewEvent
  | GHIssuesEvent
  | GHCreateEvent
  | GHForkEvent
  | GHWatchEvent;
