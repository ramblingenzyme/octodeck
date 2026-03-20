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
  labels: Array<{ name: string }>;
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

export interface GHNotification {
  id: string;
  reason: string;
  subject: {
    title: string;
    url: string;
    type: string;
  };
  repository: { full_name: string };
  updated_at: string;
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

export interface GHEvent {
  id: string;
  type: string;
  repo: { name: string };
  payload: {
    action?: string;
    ref?: string;
    head?: string;
    commits?: Array<{ sha: string; message: string }>;
    pull_request?: { number: number; title: string; html_url: string };
    issue?: { number: number; title: string; html_url: string };
    comment?: { body: string; html_url: string };
    size?: number;
    distinct_size?: number;
    ref_type?: string;
    forkee?: { full_name: string; html_url: string };
  };
  created_at: string;
}
