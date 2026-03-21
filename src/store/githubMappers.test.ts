import { describe, it, expect } from "vitest";
import {
  mapSearchItemToPR,
  mapSearchItemToIssue,
  mapNotification,
  mapWorkflowRun,
  mapEvent,
} from "./githubMappers";
import type { GHSearchItem, GHNotification, GHWorkflowRun, GHEvent } from "@/types/github";

const baseItem: GHSearchItem = {
  id: 1,
  number: 42,
  title: "Fix the bug",
  html_url: "https://github.com/owner/repo/pull/42",
  state: "open",
  user: { login: "alice" },
  repository_url: "https://api.github.com/repos/owner/repo",
  labels: [
    { name: "bug", color: "d73a4a" },
    { name: "urgent", color: "fca5a5" },
  ],
  comments: 3,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-02T00:00:00Z",
};

describe("mapSearchItemToPR", () => {
  it("maps basic fields", () => {
    const pr = mapSearchItemToPR(baseItem);
    expect(pr.id).toBe(1);
    expect(pr.title).toBe("Fix the bug");
    expect(pr.repo).toBe("owner/repo");
    expect(pr.author).toBe("alice");
    expect(pr.number).toBe(42);
    expect(pr.comments).toBe(3);
    expect(pr.labels).toEqual([
      { name: "bug", color: "d73a4a" },
      { name: "urgent", color: "fca5a5" },
    ]);
    expect(pr.url).toBe("https://github.com/owner/repo/pull/42");
  });

  it("defaults draft to false when missing", () => {
    const pr = mapSearchItemToPR({ ...baseItem, draft: undefined });
    expect(pr.draft).toBe(false);
  });

  it("sets draft to true when present", () => {
    const pr = mapSearchItemToPR({ ...baseItem, draft: true });
    expect(pr.draft).toBe(true);
  });

  it("initializes reviews to zero", () => {
    const pr = mapSearchItemToPR(baseItem);
    expect(pr.reviews).toEqual({ approved: 0, requested: 0 });
  });
});

describe("mapSearchItemToIssue", () => {
  it("maps basic fields", () => {
    const issue = mapSearchItemToIssue({ ...baseItem, state: "open" });
    expect(issue.id).toBe(1);
    expect(issue.title).toBe("Fix the bug");
    expect(issue.repo).toBe("owner/repo");
    expect(issue.number).toBe(42);
    expect(issue.state).toBe("open");
    expect(issue.comments).toBe(3);
  });

  it("maps closed state", () => {
    const issue = mapSearchItemToIssue({ ...baseItem, state: "closed" });
    expect(issue.state).toBe("closed");
  });

  it("falls back to null when no assignees", () => {
    const issue = mapSearchItemToIssue({ ...baseItem, assignees: undefined });
    expect(issue.assignee).toBeNull();
  });

  it("picks first assignee login", () => {
    const issue = mapSearchItemToIssue({
      ...baseItem,
      assignees: [{ login: "bob" }, { login: "carol" }],
    });
    expect(issue.assignee).toBe("bob");
  });
});

const baseNotif: GHNotification = {
  id: "12345",
  reason: "review_requested",
  subject: {
    title: "Review this PR",
    url: "https://api.github.com/repos/owner/repo/pulls/10",
    type: "PullRequest",
  },
  repository: { full_name: "owner/repo" },
  updated_at: "2024-01-02T00:00:00Z",
};

describe("mapNotification", () => {
  it("maps known reason", () => {
    const n = mapNotification(baseNotif);
    expect(n.type).toBe("review_requested");
    expect(n.text).toBe("Review this PR");
    expect(n.repo).toBe("owner/repo");
  });

  it("falls back to comment for unknown reason", () => {
    const n = mapNotification({ ...baseNotif, reason: "some_unknown_reason" });
    expect(n.type).toBe("comment");
  });

  it("converts pulls API URL to html URL", () => {
    const n = mapNotification(baseNotif);
    expect(n.url).toBe("https://github.com/owner/repo/pull/10");
  });

  it("uses numeric id when parseable", () => {
    const n = mapNotification(baseNotif);
    expect(n.id).toBe(12345);
  });

  it("uses stable hash id for non-numeric id", () => {
    const n1 = mapNotification({ ...baseNotif, id: "abc-def" });
    const n2 = mapNotification({ ...baseNotif, id: "abc-def" });
    expect(n1.id).toBe(n2.id);
    expect(typeof n1.id).toBe("number");
  });
});

const baseRun: GHWorkflowRun = {
  id: 999,
  name: "CI",
  html_url: "https://github.com/owner/repo/actions/runs/999",
  head_branch: "main",
  status: "completed",
  conclusion: "success",
  event: "push",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:01:30Z",
  run_started_at: "2024-01-01T00:00:00Z",
};

describe("mapWorkflowRun", () => {
  it("maps success status", () => {
    const ci = mapWorkflowRun(baseRun, "owner/repo");
    expect(ci.status).toBe("success");
  });

  it("maps failure status", () => {
    const ci = mapWorkflowRun({ ...baseRun, conclusion: "failure" }, "owner/repo");
    expect(ci.status).toBe("failure");
  });

  it("maps running status", () => {
    const ci = mapWorkflowRun(
      { ...baseRun, status: "in_progress", conclusion: null },
      "owner/repo",
    );
    expect(ci.status).toBe("running");
  });

  it("formats duration in minutes and seconds", () => {
    const ci = mapWorkflowRun(baseRun, "owner/repo");
    expect(ci.duration).toBe("1m 30s");
  });

  it("formats duration under 60s in seconds only", () => {
    const ci = mapWorkflowRun({ ...baseRun, updated_at: "2024-01-01T00:00:45Z" }, "owner/repo");
    expect(ci.duration).toBe("45s");
  });

  it("shows dash for running duration", () => {
    const ci = mapWorkflowRun(
      { ...baseRun, status: "in_progress", conclusion: null },
      "owner/repo",
    );
    expect(ci.duration).toBe("—");
  });

  it("falls back to repoFullName when repository missing", () => {
    const ci = mapWorkflowRun({ ...baseRun, repository: undefined }, "fallback/repo");
    expect(ci.repo).toBe("fallback/repo");
  });
});

function makeEvent(type: string, payload: GHEvent["payload"] = {}): GHEvent {
  return {
    id: "55555",
    type,
    repo: { name: "owner/repo" },
    created_at: "2024-01-01T00:00:00Z",
    payload,
  };
}

describe("mapEvent", () => {
  it("maps PushEvent", () => {
    const e = makeEvent("PushEvent", {
      size: 2,
      commits: [{ sha: "abc1234def", message: "fix" }],
      ref: "refs/heads/feature",
    } as GHEvent["payload"] & { ref?: string });
    const item = mapEvent(e as GHEvent);
    expect(item).not.toBeNull();
    expect(item!.type).toBe("commit");
    expect(item!.text).toBe("Pushed 2 commits to feature");
    expect(item!.ref).toBe("abc1234");
  });

  it("maps PullRequestEvent opened", () => {
    const item = mapEvent(
      makeEvent("PullRequestEvent", {
        action: "opened",
        pull_request: {
          number: 7,
          title: "Add feature",
          html_url: "https://github.com/owner/repo/pull/7",
        },
      }),
    );
    expect(item).not.toBeNull();
    expect(item!.type).toBe("pr_opened");
    expect(item!.text).toBe("Opened PR #7");
  });

  it("returns null for PullRequestEvent non-opened", () => {
    const item = mapEvent(makeEvent("PullRequestEvent", { action: "closed" }));
    expect(item).toBeNull();
  });

  it("maps PullRequestEvent merged", () => {
    const item = mapEvent(
      makeEvent("PullRequestEvent", {
        action: "merged",
        pull_request: {
          number: 12,
          title: "Merge feature",
          html_url: "https://github.com/owner/repo/pull/12",
        },
      }),
    );
    expect(item).not.toBeNull();
    expect(item!.type).toBe("pr_merged");
    expect(item!.text).toBe("Merged PR #12");
  });

  it("maps CreateEvent branch_created", () => {
    const item = mapEvent(
      makeEvent("CreateEvent", { ref_type: "branch", ref: "feature/new-thing" }),
    );
    expect(item).not.toBeNull();
    expect(item!.type).toBe("branch_created");
    expect(item!.text).toBe("Created branch feature/new-thing");
  });

  it("returns null for CreateEvent with non-branch ref_type", () => {
    expect(mapEvent(makeEvent("CreateEvent", { ref_type: "tag", ref: "v1.0.0" }))).toBeNull();
  });

  it("maps ForkEvent", () => {
    const item = mapEvent(
      makeEvent("ForkEvent", { forkee: { html_url: "https://github.com/alice/repo" } }),
    );
    expect(item).not.toBeNull();
    expect(item!.type).toBe("fork");
    expect(item!.text).toBe("Forked owner/repo");
  });

  it("maps WatchEvent (star)", () => {
    const item = mapEvent(makeEvent("WatchEvent", { action: "started" }));
    expect(item).not.toBeNull();
    expect(item!.type).toBe("star");
    expect(item!.text).toBe("Starred owner/repo");
  });

  it("maps IssueCommentEvent", () => {
    const item = mapEvent(
      makeEvent("IssueCommentEvent", {
        issue: { number: 3, title: "Bug", html_url: "https://github.com/owner/repo/issues/3" },
        comment: { body: "hi", html_url: "https://github.com/owner/repo/issues/3#comment-1" },
      }),
    );
    expect(item).not.toBeNull();
    expect(item!.type).toBe("comment");
  });

  it("maps PullRequestReviewEvent", () => {
    const item = mapEvent(
      makeEvent("PullRequestReviewEvent", {
        pull_request: { number: 5, title: "PR", html_url: "https://github.com/owner/repo/pull/5" },
      }),
    );
    expect(item).not.toBeNull();
    expect(item!.type).toBe("review");
  });

  it("maps IssuesEvent closed", () => {
    const item = mapEvent(
      makeEvent("IssuesEvent", {
        action: "closed",
        issue: { number: 9, title: "Bug", html_url: "https://github.com/owner/repo/issues/9" },
      }),
    );
    expect(item).not.toBeNull();
    expect(item!.type).toBe("issue_closed");
  });

  it("returns null for IssuesEvent non-closed", () => {
    const item = mapEvent(makeEvent("IssuesEvent", { action: "opened" }));
    expect(item).toBeNull();
  });

  it("returns null for unsupported event types", () => {
    expect(mapEvent(makeEvent("UnsupportedEvent"))).toBeNull();
  });

  it("produces stable id for non-numeric event id", () => {
    const e = {
      ...makeEvent("PushEvent", { size: 1, commits: [{ sha: "aabbcc", message: "" }] }),
      id: "non-numeric",
    };
    const item1 = mapEvent(e as GHEvent);
    const item2 = mapEvent(e as GHEvent);
    expect(item1!.id).toBe(item2!.id);
  });
});
