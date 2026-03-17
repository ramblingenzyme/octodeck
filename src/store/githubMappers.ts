import type { PRItem, IssueItem, NotifItem, CIItem, ActivityItem, NotifType, ActivityType, CIStatus } from '@/types';
import type { GHSearchItem, GHNotification, GHWorkflowRun, GHEvent } from '@/types/github';
import { formatAge } from '@/utils/relativeTime';

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
    state: item.state as 'open' | 'closed',
  };
}

const REASON_TO_NOTIF: Record<string, NotifType> = {
  review_requested: 'review_requested',
  mention: 'mention',
  assign: 'assigned',
  approval: 'approved',
  comment: 'comment',
};

export function mapNotification(n: GHNotification): NotifItem {
  const type: NotifType = REASON_TO_NOTIF[n.reason] ?? 'comment';
  return {
    id: parseInt(n.id, 10) || Math.random() * 1e9,
    type,
    text: n.subject.title,
    repo: n.repository.full_name,
    ref: n.subject.type,
    age: formatAge(n.updated_at),
  };
}

export function mapWorkflowRun(run: GHWorkflowRun, repoFullName: string): CIItem {
  let status: CIStatus;
  if (run.status === 'completed') {
    status = run.conclusion === 'success' ? 'success' : 'failure';
  } else {
    status = 'running';
  }

  const startedAt = run.run_started_at ?? run.created_at;
  const endedAt = run.updated_at;
  const durationMs = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const durationSecs = Math.floor(durationMs / 1000);
  const duration =
    status === 'running'
      ? '—'
      : durationSecs < 60
        ? `${durationSecs}s`
        : `${Math.floor(durationSecs / 60)}m ${durationSecs % 60}s`;

  const triggerMap: Record<string, CIItem['triggered']> = {
    push: 'push',
    pull_request: 'pull_request',
    release: 'release',
  };

  return {
    id: run.id,
    name: run.name ?? 'Workflow',
    repo: run.repository?.full_name ?? repoFullName,
    branch: run.head_branch,
    status,
    duration,
    age: formatAge(run.created_at),
    triggered: triggerMap[run.event] ?? 'push',
  };
}

export function mapEvent(event: GHEvent): ActivityItem | null {
  const repo = event.repo.name;
  const age = formatAge(event.created_at);

  switch (event.type) {
    case 'PushEvent': {
      const count = event.payload.size ?? event.payload.commits?.length ?? 1;
      const branch = 'ref' in event.payload ? (event.payload as { ref?: string }).ref?.replace('refs/heads/', '') ?? 'unknown' : 'unknown';
      return {
        id: parseInt(event.id, 10) || Math.random() * 1e9,
        type: 'commit' as ActivityType,
        text: `Pushed ${count} commit${count !== 1 ? 's' : ''} to ${branch}`,
        repo,
        age,
        ref: event.payload.commits?.[0]?.sha.slice(0, 7),
      };
    }
    case 'PullRequestEvent':
      if (event.payload.action === 'opened') {
        return {
          id: parseInt(event.id, 10) || Math.random() * 1e9,
          type: 'pr_opened' as ActivityType,
          text: `Opened PR #${event.payload.pull_request?.number}`,
          repo,
          age,
          ref: `PR #${event.payload.pull_request?.number}`,
        };
      }
      return null;
    case 'IssueCommentEvent':
    case 'PullRequestReviewCommentEvent':
      return {
        id: parseInt(event.id, 10) || Math.random() * 1e9,
        type: 'comment' as ActivityType,
        text: `Commented on ${event.payload.issue ? `Issue #${event.payload.issue.number}` : 'a PR'}`,
        repo,
        age,
      };
    case 'PullRequestReviewEvent':
      return {
        id: parseInt(event.id, 10) || Math.random() * 1e9,
        type: 'review' as ActivityType,
        text: `Reviewed PR #${event.payload.pull_request?.number}`,
        repo,
        age,
        ref: `PR #${event.payload.pull_request?.number}`,
      };
    case 'IssuesEvent':
      if (event.payload.action === 'closed') {
        return {
          id: parseInt(event.id, 10) || Math.random() * 1e9,
          type: 'issue_closed' as ActivityType,
          text: `Closed Issue #${event.payload.issue?.number}`,
          repo,
          age,
          ref: `Issue #${event.payload.issue?.number}`,
        };
      }
      return null;
    default:
      return null;
  }
}
