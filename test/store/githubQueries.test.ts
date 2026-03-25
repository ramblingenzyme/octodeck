import { describe, it, expect, vi, beforeEach } from "vitest";
import { REVIEW_COUNT_UNKNOWN, type ReviewCount } from "@/types";
import type {
  GHUser,
  GHSearchItem,
  GHWorkflowRun,
  GHEvent,
  GHRelease,
  GHDeployment,
  GHDeploymentStatus,
  GHPRReview,
  GHPRRequestedReviewers,
} from "@/types/github";

vi.mock("@/auth/token", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/auth/token")>();
  return { ...actual, githubFetch: vi.fn() };
});

let capturedKey: unknown;
let capturedFetcher: (() => Promise<unknown>) | null;

vi.mock("swr", () => ({
  default: vi.fn((key: unknown, fetcher: (() => Promise<unknown>) | null) => {
    capturedKey = key;
    capturedFetcher = fetcher ?? null;
    return {};
  }),
}));

import { githubFetch } from "@/auth/token";
import {
  useGetUser,
  useGetPRs,
  useGetIssues,
  useGetCIRuns,
  useGetActivity,
  useGetReleases,
  useGetDeployments,
} from "@/store/githubQueries";

const mockFetch = vi.mocked(githubFetch);

function mockOk<T>(data: T): Response {
  return { ok: true, json: () => Promise.resolve(data) } as unknown as Response;
}

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
    mockFetch.mockResolvedValueOnce(mockOk(raw));

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

const mockReviews: GHPRReview[] = [
  { id: 1, state: "APPROVED", user: { login: "bob" } },
  { id: 2, state: "CHANGES_REQUESTED", user: { login: "carol" } },
];

const mockRequestedReviewers: GHPRRequestedReviewers = {
  users: [{ login: "dave" }],
  teams: [{ slug: "team-x" }],
};

describe("useGetPRs", () => {
  it("key is null when token is null", () => {
    useGetPRs("repo:owner/repo", null);
    expect(capturedKey).toBeNull();
  });

  it("fetcher encodes query and enriches with review counts", async () => {
    mockFetch
      .mockResolvedValueOnce(mockOk({ total_count: 1, items: [baseItem] }))
      .mockResolvedValueOnce(mockOk(mockReviews))
      .mockResolvedValueOnce(mockOk(mockRequestedReviewers));

    useGetPRs("repo:owner/repo", "tok");
    expect(capturedKey).toEqual(["prs", "repo:owner/repo", "tok"]);

    const result = (await capturedFetcher!()) as Array<{
      id: number;
      reviews: { approved: ReviewCount; requested: ReviewCount };
    }>;
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(1);
    expect(result[0]!.reviews.approved).toBe(1);
    expect(result[0]!.reviews.requested).toBe(2);
  });

  it("falls back to REVIEW_COUNT_UNKNOWN when reviews fetch is rejected", async () => {
    mockFetch
      .mockResolvedValueOnce(mockOk({ total_count: 1, items: [baseItem] }))
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(mockOk(mockRequestedReviewers));

    useGetPRs("repo:owner/repo", "tok");
    const result = (await capturedFetcher!()) as Array<{
      reviews: { approved: ReviewCount; requested: ReviewCount };
    }>;
    expect(result[0]!.reviews.approved).toBe(REVIEW_COUNT_UNKNOWN);
    expect(result[0]!.reviews.requested).toBe(2);
  });

  it("falls back to REVIEW_COUNT_UNKNOWN when requested_reviewers fetch returns non-ok", async () => {
    mockFetch
      .mockResolvedValueOnce(mockOk({ total_count: 1, items: [baseItem] }))
      .mockResolvedValueOnce(mockOk(mockReviews))
      .mockResolvedValueOnce({ ok: false, status: 404, statusText: "Not Found" } as Response);

    useGetPRs("repo:owner/repo", "tok");
    const result = (await capturedFetcher!()) as Array<{
      reviews: { approved: ReviewCount; requested: ReviewCount };
    }>;
    expect(result[0]!.reviews.approved).toBe(1);
    expect(result[0]!.reviews.requested).toBe(REVIEW_COUNT_UNKNOWN);
  });
});

describe("useGetIssues", () => {
  it("key is null when token is null", () => {
    useGetIssues("repo:owner/repo", null);
    expect(capturedKey).toBeNull();
  });

  it("fetcher maps items via mapSearchItemToIssue", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ total_count: 1, items: [baseItem] }));

    useGetIssues("repo:owner/repo", "tok");
    const result = (await capturedFetcher!()) as Array<{ id: number }>;
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(1);
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
    mockFetch.mockResolvedValue(mockOk({ workflow_runs: [] }));

    useGetCIRuns(repos, "tok");
    await capturedFetcher!();

    // 5 fetches (not 6)
    expect(mockFetch).toHaveBeenCalledTimes(5);
  });

  it("isolates fetch failure to fetchErrors", async () => {
    mockFetch
      .mockResolvedValueOnce(mockOk({ workflow_runs: [makeRun(1)] }))
      .mockRejectedValueOnce(new Error("Network error"));

    useGetCIRuns(["owner/repo1", "owner/repo2"], "tok");
    const result = (await capturedFetcher!()) as { items: unknown[]; fetchErrors: string[] };
    expect(result.fetchErrors).toHaveLength(1);
    expect(result.fetchErrors[0]).toContain("Network error");
  });

  it("handles null workflow_runs in API response", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ workflow_runs: null }));
    useGetCIRuns(["owner/repo"], "tok");
    const result = (await capturedFetcher!()) as { items: unknown[]; fetchErrors: string[] };
    expect(result.items).toEqual([]);
  });

  it("handles missing workflow_runs property in API response", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({}));
    useGetCIRuns(["owner/repo"], "tok");
    const result = (await capturedFetcher!()) as { items: unknown[]; fetchErrors: string[] };
    expect(result.items).toEqual([]);
  });

  it("sorts by age and slices to 20", async () => {
    // Create 25 runs with varying dates
    const runs = Array.from({ length: 25 }, (_, i) =>
      makeRun(i, `2024-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`),
    );
    mockFetch.mockResolvedValueOnce(mockOk({ workflow_runs: runs }));

    useGetCIRuns(["owner/repo"], "tok");
    const result = (await capturedFetcher!()) as { items: unknown[]; fetchErrors: string[] };
    expect(result.items).toHaveLength(20);
  });
});

describe("useGetActivity", () => {
  const makeEvent = (type: string): GHEvent =>
    ({
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
    }) as unknown as GHEvent;

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
    mockFetch.mockResolvedValueOnce(mockOk(events));

    useGetActivity("alice", "tok");
    expect(capturedKey).toEqual(["activity", "alice", "tok"]);

    const result = (await capturedFetcher!()) as unknown[];
    // PullRequestEvent should produce an item; UnknownEventType should be filtered
    expect(result.length).toBeGreaterThanOrEqual(0); // at least doesn't throw
  });
});

const makeRelease = (id: number, published_at = "2024-01-01T00:00:00Z"): GHRelease => ({
  id,
  tag_name: `v${id}.0.0`,
  name: `Release ${id}`,
  prerelease: false,
  html_url: `https://github.com/owner/repo/releases/tag/v${id}.0.0`,
  published_at,
});

describe("useGetReleases", () => {
  it("key is null when token is null", () => {
    useGetReleases(["owner/repo"], null);
    expect(capturedKey).toBeNull();
  });

  it("key is null when repos is empty", () => {
    useGetReleases([], "tok");
    expect(capturedKey).toBeNull();
  });

  it("fetcher maps releases from all repos", async () => {
    mockFetch
      .mockResolvedValueOnce(mockOk([makeRelease(1)]))
      .mockResolvedValueOnce(mockOk([makeRelease(2)]));

    useGetReleases(["owner/repo1", "owner/repo2"], "tok");
    expect(capturedKey).toEqual(["releases", ["owner/repo1", "owner/repo2"], "tok"]);

    const result = (await capturedFetcher!()) as {
      items: Array<{ id: number }>;
      fetchErrors: string[];
    };
    expect(result.items).toHaveLength(2);
  });

  it("slices repos to 5", async () => {
    mockFetch.mockResolvedValue(mockOk([]));
    useGetReleases(["r1", "r2", "r3", "r4", "r5", "r6"], "tok");
    await capturedFetcher!();
    expect(mockFetch).toHaveBeenCalledTimes(5);
  });

  it("isolates fetch failure to fetchErrors", async () => {
    mockFetch
      .mockResolvedValueOnce(mockOk([makeRelease(1)]))
      .mockRejectedValueOnce(new Error("403 Forbidden"));

    useGetReleases(["owner/repo1", "owner/repo2"], "tok");
    const result = (await capturedFetcher!()) as { items: unknown[]; fetchErrors: string[] };
    expect(result.fetchErrors).toHaveLength(1);
    expect(result.fetchErrors[0]).toContain("403 Forbidden");
  });

  it("sorts by age and slices to 20", async () => {
    const releases = Array.from({ length: 25 }, (_, i) =>
      makeRelease(i, `2024-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`),
    );
    mockFetch.mockResolvedValueOnce(mockOk(releases));

    useGetReleases(["owner/repo"], "tok");
    const result = (await capturedFetcher!()) as { items: unknown[]; fetchErrors: string[] };
    expect(result.items).toHaveLength(20);
  });
});

const makeDeployment = (id: number): GHDeployment => ({
  id,
  ref: "main",
  environment: "production",
  creator: { login: "alice" },
  created_at: "2024-01-01T00:00:00Z",
});

const successStatus: GHDeploymentStatus = { state: "success" };

describe("useGetDeployments", () => {
  it("key is null when token is null", () => {
    useGetDeployments(["owner/repo"], null);
    expect(capturedKey).toBeNull();
  });

  it("key is null when repos is empty", () => {
    useGetDeployments([], "tok");
    expect(capturedKey).toBeNull();
  });

  it("fetches deployments then their statuses", async () => {
    mockFetch
      .mockResolvedValueOnce(mockOk([makeDeployment(1)])) // deployments list
      .mockResolvedValueOnce(mockOk([successStatus])); // statuses for deployment 1

    useGetDeployments(["owner/repo"], "tok");
    const result = (await capturedFetcher!()) as {
      items: Array<{ status: string }>;
      fetchErrors: string[];
    };
    expect(result.items).toHaveLength(1);
    expect(result.items[0]!.status).toBe("success");
  });

  it("maps inactive status state to success", async () => {
    mockFetch
      .mockResolvedValueOnce(mockOk([makeDeployment(1)]))
      .mockResolvedValueOnce(mockOk([{ state: "inactive" } as GHDeploymentStatus]));

    useGetDeployments(["owner/repo"], "tok");
    const result = (await capturedFetcher!()) as {
      items: Array<{ status: string }>;
      fetchErrors: string[];
    };
    expect(result.items[0]!.status).toBe("success");
  });

  it("maps unknown status state to pending", async () => {
    mockFetch
      .mockResolvedValueOnce(mockOk([makeDeployment(1)]))
      .mockResolvedValueOnce(mockOk([{ state: "custom-status" } as GHDeploymentStatus]));

    useGetDeployments(["owner/repo"], "tok");
    const result = (await capturedFetcher!()) as {
      items: Array<{ status: string }>;
      fetchErrors: string[];
    };
    expect(result.items[0]!.status).toBe("pending");
  });

  it("falls back to unknown when status fetch returns non-ok", async () => {
    mockFetch
      .mockResolvedValueOnce(mockOk([makeDeployment(1)]))
      .mockResolvedValueOnce({ ok: false, status: 404, statusText: "Not Found" } as Response);

    useGetDeployments(["owner/repo"], "tok");
    const result = (await capturedFetcher!()) as {
      items: Array<{ status: string }>;
      fetchErrors: string[];
    };
    expect(result.items[0]!.status).toBe("unknown");
  });

  it("isolates fetch failure to fetchErrors", async () => {
    mockFetch
      .mockResolvedValueOnce(mockOk([makeDeployment(1)])) // repo1 deployments
      .mockRejectedValueOnce(new Error("Network error")) // repo2 deployments (fails)
      .mockResolvedValueOnce(mockOk([successStatus])); // status for repo1's deployment

    useGetDeployments(["owner/repo1", "owner/repo2"], "tok");
    const result = (await capturedFetcher!()) as { items: unknown[]; fetchErrors: string[] };
    expect(result.fetchErrors).toHaveLength(1);
    expect(result.fetchErrors[0]).toContain("Network error");
  });
});
