import useSWR from "swr";
import { githubFetch } from "./githubClient";
import type {
  PRItem,
  IssueItem,
  NotifItem,
  CIItem,
  ActivityItem,
  ReleaseItem,
  DeploymentItem,
  SecurityItem,
  DeploymentStatus,
} from "@/types";

const DEPLOYMENT_STATE_MAP: Record<string, DeploymentStatus> = {
  success: "success",
  failure: "failure",
  error: "failure",
  pending: "pending",
  in_progress: "in_progress",
  queued: "pending",
};
import type {
  GHUser,
  GHSearchResult,
  GHNotification,
  GHWorkflowRunsResult,
  GHEvent,
  GHRelease,
  GHDeployment,
  GHDeploymentStatus,
  GHDependabotAlert,
} from "@/types/github";
import {
  mapSearchItemToPR,
  mapSearchItemToIssue,
  mapNotification,
  mapWorkflowRun,
  mapEvent,
  mapRelease,
  mapDeployment,
  mapDependabotAlert,
} from "./githubMappers";

export interface AuthUser {
  login: string;
  avatarUrl: string;
  name: string | null;
}

const POLL = 5 * 60 * 1000;

export function useGetUser(token: string | null) {
  return useSWR<AuthUser>(
    token ? ["user", token] : null,
    async () => {
      const raw = await githubFetch<GHUser>("/user", token!);
      return { login: raw.login, avatarUrl: raw.avatar_url, name: raw.name };
    },
    { refreshInterval: POLL },
  );
}

export function useGetPRs(q: string, token: string | null) {
  return useSWR<PRItem[]>(
    token ? ["prs", q, token] : null,
    async () => {
      const raw = await githubFetch<GHSearchResult>(
        `/search/issues?q=${encodeURIComponent("is:pr " + q)}&sort=updated&per_page=30`,
        token!,
      );
      return raw.items.map(mapSearchItemToPR);
    },
    { refreshInterval: POLL },
  );
}

export function useGetIssues(q: string, token: string | null) {
  return useSWR<IssueItem[]>(
    token ? ["issues", q, token] : null,
    async () => {
      const raw = await githubFetch<GHSearchResult>(
        `/search/issues?q=${encodeURIComponent("is:issue " + q)}&sort=updated&per_page=30`,
        token!,
      );
      return raw.items.map(mapSearchItemToIssue);
    },
    { refreshInterval: POLL },
  );
}

export function useGetNotifications(token: string | null) {
  return useSWR<NotifItem[]>(
    token ? ["notifications", token] : null,
    async () => {
      const raw = await githubFetch<GHNotification[]>(
        "/notifications?all=false&per_page=30",
        token!,
      );
      return raw.map(mapNotification);
    },
    { refreshInterval: POLL },
  );
}

export function useGetCIRuns(repos: string[], token: string | null) {
  return useSWR<CIItem[]>(
    token && repos.length > 0 ? ["ci", repos, token] : null,
    async () => {
      const raw = (
        await Promise.all(
          repos.slice(0, 5).map(async (repo) => {
            try {
              const data = await githubFetch<GHWorkflowRunsResult>(
                `/repos/${repo}/actions/runs?per_page=10`,
                token!,
              );
              return (data.workflow_runs ?? []).map((run) => ({ run, repo }));
            } catch {
              return [];
            }
          }),
        )
      ).flat();
      raw.sort((a, b) => b.run.created_at.localeCompare(a.run.created_at));
      return raw.slice(0, 20).map(({ run, repo }) => mapWorkflowRun(run, repo));
    },
    { refreshInterval: POLL },
  );
}

export function useGetReleases(repos: string[], token: string | null) {
  return useSWR<ReleaseItem[]>(
    token && repos.length > 0 ? ["releases", repos, token] : null,
    async () => {
      const raw = (
        await Promise.all(
          repos.slice(0, 5).map(async (repo) => {
            try {
              const data = await githubFetch<GHRelease[]>(
                `/repos/${repo}/releases?per_page=10`,
                token!,
              );
              return data.map((release) => ({ release, repo }));
            } catch {
              return [];
            }
          }),
        )
      ).flat();
      raw.sort((a, b) => b.release.published_at.localeCompare(a.release.published_at));
      return raw.slice(0, 20).map(({ release, repo }) => mapRelease(release, repo));
    },
    { refreshInterval: POLL },
  );
}

export function useGetDeployments(repos: string[], token: string | null) {
  return useSWR<DeploymentItem[]>(
    token && repos.length > 0 ? ["deployments", repos, token] : null,
    async () => {
      const raw = (
        await Promise.all(
          repos.slice(0, 5).map(async (repo) => {
            try {
              const deployments = await githubFetch<GHDeployment[]>(
                `/repos/${repo}/deployments?per_page=10`,
                token!,
              );
              return deployments.map((deployment) => ({ deployment, repo }));
            } catch {
              return [];
            }
          }),
        )
      ).flat();
      raw.sort((a, b) => b.deployment.created_at.localeCompare(a.deployment.created_at));
      return await Promise.all(
        raw.slice(0, 20).map(async ({ deployment, repo }) => {
          try {
            const statuses = await githubFetch<GHDeploymentStatus[]>(
              `/repos/${repo}/deployments/${deployment.id}/statuses?per_page=1`,
              token!,
            );
            const state = statuses[0]?.state ?? "pending";
            return mapDeployment(deployment, DEPLOYMENT_STATE_MAP[state] ?? "pending", repo);
          } catch {
            return mapDeployment(deployment, "pending", repo);
          }
        }),
      );
    },
    { refreshInterval: POLL },
  );
}

export function useGetSecurityAlerts(repos: string[], token: string | null) {
  return useSWR<SecurityItem[]>(
    token && repos.length > 0 ? ["security", repos, token] : null,
    async () => {
      const raw = (
        await Promise.all(
          repos.slice(0, 5).map(async (repo) => {
            try {
              const alerts = await githubFetch<GHDependabotAlert[]>(
                `/repos/${repo}/dependabot/alerts?state=open&per_page=10`,
                token!,
              );
              return alerts.map((alert) => ({ alert, repo }));
            } catch {
              return [];
            }
          }),
        )
      ).flat();
      raw.sort((a, b) => b.alert.created_at.localeCompare(a.alert.created_at));
      return raw.slice(0, 20).map(({ alert, repo }) => mapDependabotAlert(alert, repo));
    },
    { refreshInterval: POLL },
  );
}

export function useGetActivity(login: string, token: string | null) {
  return useSWR<ActivityItem[]>(
    token && login ? ["activity", login, token] : null,
    async () => {
      const raw = await githubFetch<GHEvent[]>(`/users/${login}/events?per_page=30`, token!);
      return raw.flatMap((e) => {
        const item = mapEvent(e);
        return item ? [item] : [];
      });
    },
    { refreshInterval: POLL },
  );
}
