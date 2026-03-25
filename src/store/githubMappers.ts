import {
  type PRItem,
  type IssueItem,
  type CIItem,
  type ActivityItem,
  type FallbackItem,
  type CIStatus,
  type ReleaseItem,
  type DeploymentItem,
  type DeploymentStatus,
  REVIEW_COUNT_UNKNOWN,
} from "@/types";
import type {
  GHSearchItem,
  GHWorkflowRun,
  GHEvent,
  GHPushEvent,
  GHPullRequestEvent,
  GHIssueCommentEvent,
  GHPRReviewCommentEvent,
  GHPRReviewEvent,
  GHIssuesEvent,
  GHCreateEvent,
  GHForkEvent,
  GHWatchEvent,
  GHRelease,
  GHDeployment,
} from "@/types/github";

function repoFromUrl(url: string): string {
  // https://api.github.com/repos/owner/repo  OR  owner/repo
  const match = url.match(/repos\/(.+)$/);
  return match ? match[1]! : url;
}

export function mapSearchItemToPR(item: GHSearchItem): PRItem {
  return {
    id: item.id,
    title: item.title,
    repo: repoFromUrl(item.repository_url),
    author: item.user.login,
    number: item.number,
    reviews: { approved: REVIEW_COUNT_UNKNOWN, requested: REVIEW_COUNT_UNKNOWN },
    comments: item.comments,
    draft: item.draft ?? false,
    age: item.updated_at,
    labels: item.labels.map((l) => ({ name: l.name, color: l.color })),
    url: item.html_url,
  };
}

export function mapSearchItemToIssue(item: GHSearchItem): IssueItem {
  return {
    id: item.id,
    title: item.title,
    repo: repoFromUrl(item.repository_url),
    number: item.number,
    labels: item.labels.map((l) => ({ name: l.name, color: l.color })),
    assignee: item.assignees?.[0]?.login ?? null,
    comments: item.comments,
    age: item.updated_at,
    state: item.state as "open" | "closed",
    url: item.html_url,
  };
}

export function mapWorkflowRun(run: GHWorkflowRun, repoFullName: string): CIItem {
  let status: CIStatus;
  if (run.status === "completed") {
    status = run.conclusion === "success" ? "success" : "failure";
  } else {
    status = "running";
  }

  const startedAt = run.run_started_at ?? run.created_at;
  const endedAt = run.updated_at;
  const durationMs = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const durationSecs = Math.floor(durationMs / 1000);
  const duration =
    status === "running"
      ? "—"
      : durationSecs < 60
        ? `${durationSecs}s`
        : `${Math.floor(durationSecs / 60)}m ${durationSecs % 60}s`;

  const triggerMap: Record<string, CIItem["triggered"]> = {
    push: "push",
    pull_request: "pull_request",
    release: "release",
  };

  return {
    id: run.id,
    name: run.name ?? "Workflow",
    repo: run.repository?.full_name ?? repoFullName,
    branch: run.head_branch,
    status,
    duration,
    age: run.created_at,
    triggered: triggerMap[run.event] ?? "push",
    url: run.html_url,
  };
}

export function mapRelease(r: GHRelease, repo: string): ReleaseItem {
  return {
    id: r.id,
    repo,
    tag: r.tag_name,
    name: r.name ?? r.tag_name,
    prerelease: r.prerelease,
    age: r.published_at,
    url: r.html_url,
  };
}

export function mapDeployment(
  d: GHDeployment,
  status: DeploymentStatus,
  repo: string,
): DeploymentItem {
  return {
    id: d.id,
    repo,
    environment: d.environment,
    status,
    ref: d.ref,
    creator: d.creator.login,
    age: d.created_at,
    url: `https://github.com/${repo}/deployments`,
  };
}

function mapPushEvent(event: GHPushEvent): ActivityItem {
  const repo = event.repo.name;
  const ghBase = `https://github.com/${repo}`;
  const count = event.payload.size ?? event.payload.distinct_size ?? event.payload.commits?.length;
  const branch = event.payload.ref?.replace("refs/heads/", "") ?? "unknown";
  const sha = (event.payload.commits?.[0]?.sha ?? event.payload.head)?.slice(0, 7);
  const countText = count != null ? `${count} commit${count !== 1 ? "s" : ""} ` : "";
  return {
    id: parseInt(event.id, 10),
    type: "commit",
    text: `Pushed ${countText}to ${branch}`,
    repo,
    age: event.created_at,
    ref: sha,
    url: sha ? `${ghBase}/commit/${sha}` : `${ghBase}/commits/${branch}`,
  };
}

function mapPullRequestEvent(event: GHPullRequestEvent): ActivityItem | null {
  const repo = event.repo.name;
  const ghBase = `https://github.com/${repo}`;
  const prNum = event.payload.pull_request.number;
  const prUrl = event.payload.pull_request.html_url;
  if (event.payload.action === "opened") {
    return {
      id: parseInt(event.id, 10),
      type: "pr_opened",
      text: `Opened PR #${prNum}`,
      repo,
      age: event.created_at,
      ref: `PR #${prNum}`,
      url: prUrl,
    };
  }
  if (event.payload.action === "merged") {
    return {
      id: parseInt(event.id, 10),
      type: "pr_merged",
      text: `Merged PR #${prNum}`,
      repo,
      age: event.created_at,
      ref: `PR #${prNum}`,
      url: prUrl,
    };
  }
  return null;
}

function mapIssueCommentEvent(event: GHIssueCommentEvent): ActivityItem {
  const repo = event.repo.name;
  return {
    id: parseInt(event.id, 10),
    type: "comment",
    text: `Commented on Issue #${event.payload.issue.number}`,
    repo,
    age: event.created_at,
    url: event.payload.comment.html_url,
  };
}

function mapPRReviewCommentEvent(event: GHPRReviewCommentEvent): ActivityItem {
  const repo = event.repo.name;
  const ghBase = `https://github.com/${repo}`;
  return {
    id: parseInt(event.id, 10),
    type: "comment",
    text: `Commented on a PR`,
    repo,
    age: event.created_at,
    url: event.payload.comment.html_url ?? event.payload.issue?.html_url ?? ghBase,
  };
}

function mapPRReviewEvent(event: GHPRReviewEvent): ActivityItem {
  const repo = event.repo.name;
  const ghBase = `https://github.com/${repo}`;
  const prNum = event.payload.pull_request.number;
  return {
    id: parseInt(event.id, 10),
    type: "review",
    text: `Reviewed PR #${prNum}`,
    repo,
    age: event.created_at,
    ref: `PR #${prNum}`,
    url: event.payload.pull_request.html_url ?? `${ghBase}/pulls`,
  };
}

function mapIssuesEvent(event: GHIssuesEvent): ActivityItem | null {
  if (event.payload.action !== "closed") return null;
  const repo = event.repo.name;
  const ghBase = `https://github.com/${repo}`;
  const issueNum = event.payload.issue.number;
  return {
    id: parseInt(event.id, 10),
    type: "issue_closed",
    text: `Closed Issue #${issueNum}`,
    repo,
    age: event.created_at,
    ref: `Issue #${issueNum}`,
    url: event.payload.issue.html_url ?? `${ghBase}/issues`,
  };
}

function mapCreateEvent(event: GHCreateEvent): ActivityItem | null {
  if (event.payload.ref_type !== "branch") return null;
  const repo = event.repo.name;
  const ghBase = `https://github.com/${repo}`;
  return {
    id: parseInt(event.id, 10),
    type: "branch_created",
    text: `Created branch ${event.payload.ref ?? "unknown"}`,
    repo,
    age: event.created_at,
    url: `${ghBase}/tree/${event.payload.ref ?? ""}`,
  };
}

function mapForkEvent(event: GHForkEvent): ActivityItem {
  const repo = event.repo.name;
  return {
    id: parseInt(event.id, 10),
    type: "fork",
    text: `Forked ${repo}`,
    repo,
    age: event.created_at,
    url: event.payload.forkee.html_url,
  };
}

function mapWatchEvent(event: GHWatchEvent): ActivityItem {
  const repo = event.repo.name;
  return {
    id: parseInt(event.id, 10),
    type: "star",
    text: `Starred ${repo}`,
    repo,
    age: event.created_at,
    url: `https://github.com/${repo}`,
  };
}

export function mapEvent(event: GHEvent): ActivityItem | FallbackItem | null {
  switch (event.type) {
    case "PushEvent":
      return mapPushEvent(event);
    case "PullRequestEvent":
      return mapPullRequestEvent(event);
    case "IssueCommentEvent":
      return mapIssueCommentEvent(event);
    case "PullRequestReviewCommentEvent":
      return mapPRReviewCommentEvent(event);
    case "PullRequestReviewEvent":
      return mapPRReviewEvent(event);
    case "IssuesEvent":
      return mapIssuesEvent(event);
    case "CreateEvent":
      return mapCreateEvent(event);
    case "ForkEvent":
      return mapForkEvent(event);
    case "WatchEvent":
      return mapWatchEvent(event);
    default: {
      // Runtime catch-all: the GitHub API may return event types not yet in the GHEvent union
      const e = event as { id: string; type: string; repo: { name: string }; created_at: string };
      return {
        type: "fallback" as const,
        id: parseInt(e.id, 10),
        title: e.type,
        repo: e.repo.name,
        age: e.created_at,
        url: `https://github.com/${e.repo.name}`,
      };
    }
  }
}
