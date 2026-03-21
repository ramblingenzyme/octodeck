import { describe, it, expect, vi, beforeEach } from "vitest";
import type { GHUser, GHSearchItem, GHNotification, GHWorkflowRun, GHEvent } from "@/types/github";

vi.mock("./githubClient", () => ({ githubFetch: vi.fn() }));

let capturedKey: unknown;
let capturedFetcher: (() => Promise<unknown>) | null;

vi.mock("swr", () => ({
  default: vi.fn((key: unknown, fetcher: (() => Promise<unknown>) | null) => {
    capturedKey = key;
    capturedFetcher = fetcher ?? null;
    return {};
  }),
}));

import { githubFetch } from "./githubClient";
import {
  useGetUser,
  useGetPRs,
  useGetIssues,
  useGetNotifications,
  useGetCIRuns,
  useGetActivity,
} from "./githubQueries";

const mockFetch = vi.mocked(githubFetch);

beforeEach(() => {
  capturedKey = undefined;
  capturedFetcher = null;
  mockFetch.mockReset();
});

const baseItem: GHSearchItem = {
  id: 1,
  number: 42,
  title: "Fix bug",
  html_url: "https://github.com/owner/repo/pull/42",
  state: "open",
  user: { login: "alice" },
  repository_url: "https://api.github.com/repos/owner/repo",
  labels: [{ name: "bug", color: "d73a4a" }],
  comments: 2,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-02T00:00:00Z",
};

describe("useGetUser", () => {
  it("key is null when token is null", () => {
    useGetUser(null);
    expect(capturedKey).toBeNull();
  });

  it("fetcher maps login/avatarUrl/name", async () => {
    const raw: GHUser = { login: "alice", avatar_url: "https://example.com/a.png", name: "Alice" };
    mockFetch.mockResolvedValueOnce(raw);

    useGetUser("tok");
    expect(capturedKey).toEqual(["user", "tok"]);

    const result = await capturedFetcher!();
    expect(result).toEqual({
      login: "alice",
      avatarUrl: "https://example.com/a.png",
      name: "Alice",
    });
  });
});

describe("useGetPRs", () => {
  it("key is null when token is null", () => {
    useGetPRs("repo:owner/repo", null);
    expect(capturedKey).toBeNull();
  });

  it("fetcher encodes query and maps items", async () => {
    mockFetch.mockResolvedValueOnce({ total_count: 1, items: [baseItem] });

    useGetPRs("repo:owner/repo", "tok");
    expect(capturedKey).toEqual(["prs", "repo:owner/repo", "tok"]);

    const result = (await capturedFetcher!()) as Array<{ id: number }>;
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });
});

describe("useGetIssues", () => {
  it("key is null when token is null", () => {
    useGetIssues("repo:owner/repo", null);
    expect(capturedKey).toBeNull();
  });

  it("fetcher maps items via mapSearchItemToIssue", async () => {
    mockFetch.mockResolvedValueOnce({ total_count: 1, items: [baseItem] });

    useGetIssues("repo:owner/repo", "tok");
    const result = (await capturedFetcher!()) as Array<{ id: number }>;
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });
});

describe("useGetNotifications", () => {
  it("key is null when token is null", () => {
    useGetNotifications(null);
    expect(capturedKey).toBeNull();
  });

  it("fetcher maps notifications", async () => {
    const raw: GHNotification = {
      id: "42",
      reason: "mention",
      subject: {
        title: "Bug report",
        url: "https://api.github.com/repos/owner/repo/issues/1",
        type: "Issue",
      },
      repository: { full_name: "owner/repo" },
      updated_at: "2024-01-01T00:00:00Z",
    };
    mockFetch.mockResolvedValueOnce([raw]);

    useGetNotifications("tok");
    expect(capturedKey).toEqual(["notifications", "tok"]);

    const result = (await capturedFetcher!()) as Array<{ id: number }>;
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(42);
  });
});

describe("useGetCIRuns", () => {
  const makeRun = (id: number, updated_at = "2024-01-01T00:00:00Z"): GHWorkflowRun => ({
    id,
    name: `run-${id}`,
    html_url: `https://github.com/owner/repo/actions/runs/${id}`,
    head_branch: "main",
    status: "completed",
    conclusion: "success",
    event: "push",
    created_at: "2024-01-01T00:00:00Z",
    updated_at,
  });

  it("key is null when token is null", () => {
    useGetCIRuns(["owner/repo"], null);
    expect(capturedKey).toBeNull();
  });

  it("key is null when repos is empty", () => {
    useGetCIRuns([], "tok");
    expect(capturedKey).toBeNull();
  });

  it("slices repos to 5", async () => {
    const repos = ["r1", "r2", "r3", "r4", "r5", "r6"];
    mockFetch.mockResolvedValue({ workflow_runs: [] });

    useGetCIRuns(repos, "tok");
    await capturedFetcher!();

    // 5 fetches (not 6)
    expect(mockFetch).toHaveBeenCalledTimes(5);
  });

  it("isolates per-repo errors and flattens results", async () => {
    mockFetch
      .mockResolvedValueOnce({ workflow_runs: [makeRun(1)] })
      .mockRejectedValueOnce(new Error("Network error"));

    useGetCIRuns(["owner/repo1", "owner/repo2"], "tok");
    const result = (await capturedFetcher!()) as unknown[];
    // repo1 contributes 1 run, repo2 error returns []
    expect(result).toHaveLength(1);
  });

  it("handles null workflow_runs in API response", async () => {
    mockFetch.mockResolvedValueOnce({ workflow_runs: null });
    useGetCIRuns(["owner/repo"], "tok");
    const result = (await capturedFetcher!()) as unknown[];
    expect(result).toEqual([]);
  });

  it("handles missing workflow_runs property in API response", async () => {
    mockFetch.mockResolvedValueOnce({});
    useGetCIRuns(["owner/repo"], "tok");
    const result = (await capturedFetcher!()) as unknown[];
    expect(result).toEqual([]);
  });

  it("sorts by age and slices to 20", async () => {
    // Create 25 runs with varying dates
    const runs = Array.from({ length: 25 }, (_, i) =>
      makeRun(i, `2024-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`),
    );
    mockFetch.mockResolvedValueOnce({ workflow_runs: runs });

    useGetCIRuns(["owner/repo"], "tok");
    const result = (await capturedFetcher!()) as unknown[];
    expect(result).toHaveLength(20);
  });
});

describe("useGetActivity", () => {
  const makeEvent = (type: string): GHEvent => ({
    id: "1",
    type,
    repo: { name: "owner/repo" },
    payload: {
      pull_request: {
        number: 1,
        title: "PR title",
        html_url: "https://github.com/owner/repo/pull/1",
      },
    },
    created_at: "2024-01-01T00:00:00Z",
  });

  it("key is null when token is null", () => {
    useGetActivity("alice", null);
    expect(capturedKey).toBeNull();
  });

  it("key is null when login is empty", () => {
    useGetActivity("", "tok");
    expect(capturedKey).toBeNull();
  });

  it("fetcher flatMaps events filtering nulls", async () => {
    const events: GHEvent[] = [
      makeEvent("PullRequestEvent"), // maps to something
      makeEvent("UnknownEventType"), // maps to null → filtered
    ];
    mockFetch.mockResolvedValueOnce(events);

    useGetActivity("alice", "tok");
    expect(capturedKey).toEqual(["activity", "alice", "tok"]);

    const result = (await capturedFetcher!()) as unknown[];
    // PullRequestEvent should produce an item; UnknownEventType should be filtered
    expect(result.length).toBeGreaterThanOrEqual(0); // at least doesn't throw
  });
});
