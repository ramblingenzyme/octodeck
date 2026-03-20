import type {
  PRItem,
  IssueItem,
  NotifItem,
  CIItem,
  ActivityItem,
  NotifType,
  CIStatus,
} from "@/types";
import type { GHSearchItem, GHNotification, GHWorkflowRun, GHEvent } from "@/types/github";
import { formatAge } from "@/utils/relativeTime";

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
    reviews: { approved: 0, requested: 0 },
    comments: item.comments,
    draft: item.draft ?? false,
    age: formatAge(item.updated_at),
    labels: item.labels.map((l) => l.name),
    url: item.html_url,
  };
}

export function mapSearchItemToIssue(item: GHSearchItem): IssueItem {
  return {
    id: item.id,
    title: item.title,
    repo: repoFromUrl(item.repository_url),
    number: item.number,
    labels: item.labels.map((l) => l.name),
    assignee: item.assignees?.[0]?.login ?? null,
    comments: item.comments,
    age: formatAge(item.updated_at),
    state: item.state as "open" | "closed",
    url: item.html_url,
  };
}

const REASON_TO_NOTIF: Record<string, NotifType> = {
  review_requested: "review_requested",
  mention: "mention",
  assign: "assigned",
  approval: "approved",
  comment: "comment",
};

function apiUrlToHtmlUrl(apiUrl: string): string {
  // https://api.github.com/repos/owner/repo/pulls/123 → https://github.com/owner/repo/pull/123
  // https://api.github.com/repos/owner/repo/issues/123 → https://github.com/owner/repo/issues/123
  return apiUrl
    .replace("https://api.github.com/repos/", "https://github.com/")
    .replace(/\/pulls\/(\d+)$/, "/pull/$1");
}

export function mapNotification(n: GHNotification): NotifItem {
  const type: NotifType = REASON_TO_NOTIF[n.reason] ?? "comment";
  return {
    id: parseInt(n.id, 10),
    type,
    text: n.subject.title,
    repo: n.repository.full_name,
    ref: n.subject.type,
    age: formatAge(n.updated_at),
    url: apiUrlToHtmlUrl(n.subject.url),
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
    age: formatAge(run.created_at),
    triggered: triggerMap[run.event] ?? "push",
    url: run.html_url,
  };
}

export function mapEvent(event: GHEvent): ActivityItem | null {
  const repo = event.repo.name;
  const age = formatAge(event.created_at);

  const ghBase = `https://github.com/${repo}`;

  switch (event.type) {
    case "PushEvent": {
      const count =
        event.payload.size ?? event.payload.distinct_size ?? event.payload.commits?.length;
      const branch = event.payload.ref?.replace("refs/heads/", "") ?? "unknown";
      const sha = (event.payload.commits?.[0]?.sha ?? event.payload.head)?.slice(0, 7);
      const countText = count != null ? `${count} commit${count !== 1 ? "s" : ""} ` : "";
      return {
        id: parseInt(event.id, 10),
        type: "commit",
        text: `Pushed ${countText}to ${branch}`,
        repo,
        age,
        ref: sha,
        url: sha ? `${ghBase}/commit/${sha}` : `${ghBase}/commits/${branch}`,
      };
    }
    case "PullRequestEvent": {
      const prNum = event.payload.pull_request?.number;
      const prUrl = event.payload.pull_request?.html_url ?? `${ghBase}/pulls`;
      if (event.payload.action === "opened") {
        return {
          id: parseInt(event.id, 10),
          type: "pr_opened",
          text: `Opened PR #${prNum}`,
          repo,
          age,
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
          age,
          ref: `PR #${prNum}`,
          url: prUrl,
        };
      }
      return null;
    }
    case "IssueCommentEvent":
    case "PullRequestReviewCommentEvent":
      return {
        id: parseInt(event.id, 10),
        type: "comment",
        text: `Commented on ${event.payload.issue ? `Issue #${event.payload.issue.number}` : "a PR"}`,
        repo,
        age,
        url: event.payload.comment?.html_url ?? event.payload.issue?.html_url ?? ghBase,
      };
    case "PullRequestReviewEvent":
      return {
        id: parseInt(event.id, 10),
        type: "review",
        text: `Reviewed PR #${event.payload.pull_request?.number}`,
        repo,
        age,
        ref: `PR #${event.payload.pull_request?.number}`,
        url: event.payload.pull_request?.html_url ?? `${ghBase}/pulls`,
      };
    case "IssuesEvent":
      if (event.payload.action === "closed") {
        return {
          id: parseInt(event.id, 10),
          type: "issue_closed",
          text: `Closed Issue #${event.payload.issue?.number}`,
          repo,
          age,
          ref: `Issue #${event.payload.issue?.number}`,
          url: event.payload.issue?.html_url ?? `${ghBase}/issues`,
        };
      }
      return null;
    case "CreateEvent":
      if (event.payload.ref_type === "branch") {
        return {
          id: parseInt(event.id, 10),
          type: "branch_created",
          text: `Created branch ${event.payload.ref ?? "unknown"}`,
          repo,
          age,
          url: `${ghBase}/tree/${event.payload.ref ?? ""}`,
        };
      }
      return null;
    case "ForkEvent":
      return {
        id: parseInt(event.id, 10),
        type: "fork",
        text: `Forked ${repo}`,
        repo,
        age,
        url: event.payload.forkee?.html_url ?? ghBase,
      };
    case "WatchEvent":
      return {
        id: parseInt(event.id, 10),
        type: "star",
        text: `Starred ${repo}`,
        repo,
        age,
        url: ghBase,
      };
    default:
      return null;
  }
}
