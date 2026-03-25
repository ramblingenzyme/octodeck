import useSWR from "swr";
import { githubFetch, UnauthorizedError } from "@/auth/token";
import {
  type PRItem,
  type IssueItem,
  type CIItem,
  type ActivityItem,
  type FallbackItem,
  type ReleaseItem,
  type DeploymentItem,
  type DeploymentStatus,
  type ReviewCount,
  REVIEW_COUNT_UNKNOWN,
} from "@/types";

const DEPLOYMENT_STATE_MAP: Record<string, DeploymentStatus> = {
  success: "success",
  inactive: "success",
  failure: "failure",
  error: "failure",
  pending: "pending",
  in_progress: "in_progress",
  queued: "pending",
};
import type {
  GHRepo,
  GHUser,
  GHSearchResult,
  GHWorkflowRun,
  GHWorkflowRunsResult,
  GHEvent,
  GHRelease,
  GHDeployment,
  GHDeploymentStatus,
  GHPRReview,
  GHPRRequestedReviewers,
} from "@/types/github";
import {
  mapSearchItemToPR,
  mapSearchItemToIssue,
  mapWorkflowRun,
  mapEvent,
  mapRelease,
  mapDeployment,
} from "./githubMappers";

export interface AuthUser {
  login: string;
  avatarUrl: string;
  name: string | null;
}

const POLL = 5 * 60 * 1000;

function checkOk(res: Response): void {
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
}

export function useGetUser(sessionId: string | null) {
  return useSWR<AuthUser>(
    sessionId ? ["user", sessionId] : null,
    async () => {
      const res = await githubFetch("/user");
      checkOk(res);
      const raw = (await res.json()) as GHUser;
      return { login: raw.login, avatarUrl: raw.avatar_url, name: raw.name };
    },
    { refreshInterval: POLL },
  );
}

async function enrichPRWithReviews(pr: PRItem): Promise<PRItem> {
  const [reviewsResult, requestedResult] = await Promise.allSettled([
    githubFetch(`/repos/${pr.repo}/pulls/${pr.number}/reviews`),
    githubFetch(`/repos/${pr.repo}/pulls/${pr.number}/requested_reviewers`),
  ]);

  let approved: ReviewCount = REVIEW_COUNT_UNKNOWN;
  if (reviewsResult.status === "fulfilled" && reviewsResult.value.ok) {
    const reviews = (await reviewsResult.value.json()) as GHPRReview[];
    approved = reviews.filter((r) => r.state === "APPROVED").length;
  }

  let requested: ReviewCount = REVIEW_COUNT_UNKNOWN;
  if (requestedResult.status === "fulfilled" && requestedResult.value.ok) {
    const rr = (await requestedResult.value.json()) as GHPRRequestedReviewers;
    requested = rr.users.length + rr.teams.length;
  }

  return { ...pr, reviews: { approved, requested } };
}

export function useGetPRs(q: string, sessionId: string | null) {
  return useSWR<PRItem[]>(
    sessionId ? ["prs", q, sessionId] : null,
    async () => {
      const res = await githubFetch(
        `/search/issues?q=${encodeURIComponent("is:pr " + q)}&sort=updated&per_page=30`,
      );
      checkOk(res);
      const raw = (await res.json()) as GHSearchResult;
      const prs = raw.items.map(mapSearchItemToPR);
      const settled = await Promise.allSettled(prs.map(enrichPRWithReviews));
      return settled.map((result, i) => (result.status === "fulfilled" ? result.value : prs[i]!));
    },
    { refreshInterval: POLL },
  );
}

export function useGetIssues(q: string, sessionId: string | null) {
  return useSWR<IssueItem[]>(
    sessionId ? ["issues", q, sessionId] : null,
    async () => {
      const res = await githubFetch(
        `/search/issues?q=${encodeURIComponent("is:issue " + q)}&sort=updated&per_page=30`,
      );
      checkOk(res);
      const raw = (await res.json()) as GHSearchResult;
      return raw.items.map(mapSearchItemToIssue);
    },
    { refreshInterval: POLL },
  );
}

function repoFetchError(repo: string, res: Response): Error {
  if (res.status === 401) return new UnauthorizedError();
  const hints: Partial<Record<number, string>> = {
    403: "access denied — write access is required",
    404: "repo not found or feature not enabled",
    422: "invalid request",
    429: "rate limit exceeded — try again later",
  };
  const hint = hints[res.status];
  const msg = hint
    ? `${repo}: ${hint} (${res.status})`
    : `${repo}: ${res.status} ${res.statusText}`;
  return new Error(msg);
}

async function fetchPerRepo<T>(
  repos: string[],
  fetcher: (repo: string) => Promise<T[]>,
): Promise<{ raw: T[]; fetchErrors: string[] }> {
  const settled = await Promise.allSettled(repos.slice(0, 5).map(fetcher));
  const raw: T[] = [];
  const fetchErrors: string[] = [];
  for (const r of settled) {
    if (r.status === "fulfilled") raw.push(...r.value);
    else {
      if (r.reason instanceof UnauthorizedError) throw r.reason;
      fetchErrors.push(String(r.reason?.message ?? r.reason));
    }
  }
  return { raw, fetchErrors };
}

export function useGetCIRuns(repos: string[], sessionId: string | null) {
  return useSWR<{ items: CIItem[]; fetchErrors: string[] }>(
    sessionId && repos.length > 0 ? ["ci", repos, sessionId] : null,
    async () => {
      const { raw, fetchErrors } = await fetchPerRepo<{ run: GHWorkflowRun; repo: string }>(
        repos,
        async (repo) => {
          const res = await githubFetch(`/repos/${repo}/actions/runs?per_page=10`);
          if (!res.ok) throw repoFetchError(repo, res);
          const data = (await res.json()) as GHWorkflowRunsResult;
          return (data.workflow_runs ?? []).map((run) => ({ run, repo }));
        },
      );
      raw.sort((a, b) => b.run.created_at.localeCompare(a.run.created_at));
      return {
        items: raw.slice(0, 20).map(({ run, repo }) => mapWorkflowRun(run, repo)),
        fetchErrors,
      };
    },
    { refreshInterval: POLL },
  );
}

export function useGetReleases(repos: string[], sessionId: string | null) {
  return useSWR<{ items: ReleaseItem[]; fetchErrors: string[] }>(
    sessionId && repos.length > 0 ? ["releases", repos, sessionId] : null,
    async () => {
      const { raw, fetchErrors } = await fetchPerRepo<{ release: GHRelease; repo: string }>(
        repos,
        async (repo) => {
          const res = await githubFetch(`/repos/${repo}/releases?per_page=10`);
          if (!res.ok) throw repoFetchError(repo, res);
          const data = (await res.json()) as GHRelease[];
          return data.map((release) => ({ release, repo }));
        },
      );
      raw.sort((a, b) => b.release.published_at.localeCompare(a.release.published_at));
      return {
        items: raw.slice(0, 20).map(({ release, repo }) => mapRelease(release, repo)),
        fetchErrors,
      };
    },
    { refreshInterval: POLL },
  );
}

export function useGetDeployments(repos: string[], sessionId: string | null) {
  return useSWR<{ items: DeploymentItem[]; fetchErrors: string[] }>(
    sessionId && repos.length > 0 ? ["deployments", repos, sessionId] : null,
    async () => {
      const { raw, fetchErrors } = await fetchPerRepo<{ deployment: GHDeployment; repo: string }>(
        repos,
        async (repo) => {
          const res = await githubFetch(`/repos/${repo}/deployments?per_page=10`);
          if (!res.ok) throw repoFetchError(repo, res);
          const deployments = (await res.json()) as GHDeployment[];
          return deployments.map((deployment) => ({ deployment, repo }));
        },
      );
      raw.sort((a, b) => b.deployment.created_at.localeCompare(a.deployment.created_at));
      const items = await Promise.all(
        raw.slice(0, 20).map(async ({ deployment, repo }) => {
          const res = await githubFetch(
            `/repos/${repo}/deployments/${deployment.id}/statuses?per_page=1`,
          );
          if (!res.ok) return mapDeployment(deployment, "unknown", repo);
          const statuses = (await res.json()) as GHDeploymentStatus[];
          const state = statuses[0]?.state ?? "pending";
          return mapDeployment(deployment, DEPLOYMENT_STATE_MAP[state] ?? "pending", repo);
        }),
      );
      return { items, fetchErrors };
    },
    { refreshInterval: POLL },
  );
}

export function useGetUserRepos(sessionId: string | null) {
  return useSWR<string[]>(
    sessionId ? ["user-repos", sessionId] : null,
    async () => {
      const res = await githubFetch(
        "/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member",
      );
      checkOk(res);
      const raw = (await res.json()) as GHRepo[];
      return raw.map((r) => r.full_name);
    },
    { refreshInterval: POLL },
  );
}

export function useGetActivity(login: string, sessionId: string | null) {
  return useSWR<(ActivityItem | FallbackItem)[]>(
    sessionId && login ? ["activity", login, sessionId] : null,
    async () => {
      const res = await githubFetch(`/users/${login}/events?per_page=30`);
      checkOk(res);
      const raw = (await res.json()) as GHEvent[];
      return raw.flatMap((e) => {
        const item = mapEvent(e);
        return item ? [item] : [];
      });
    },
    { refreshInterval: POLL },
  );
}
