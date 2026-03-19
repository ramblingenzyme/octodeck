import { useQuery } from "@tanstack/react-query";
import { githubFetch } from "./githubClient";
import type { PRItem, IssueItem, NotifItem, CIItem, ActivityItem } from "@/types";
import type {
  GHUser,
  GHSearchResult,
  GHNotification,
  GHWorkflowRunsResult,
  GHEvent,
} from "@/types/github";
import {
  mapSearchItemToPR,
  mapSearchItemToIssue,
  mapNotification,
  mapWorkflowRun,
  mapEvent,
} from "./githubMappers";

export interface AuthUser {
  login: string;
  avatarUrl: string;
  name: string | null;
}

const POLL = 5 * 60 * 1000;

export function useGetUser(token: string | null) {
  return useQuery<AuthUser>({
    queryKey: ["user", token],
    queryFn: async () => {
      const raw = await githubFetch<GHUser>("/user", token!);
      return { login: raw.login, avatarUrl: raw.avatar_url, name: raw.name };
    },
    enabled: !!token,
    refetchInterval: POLL,
  });
}

export function useGetPRs(q: string, token: string | null) {
  return useQuery<PRItem[]>({
    queryKey: ["prs", q, token],
    queryFn: async () => {
      const raw = await githubFetch<GHSearchResult>(
        `/search/issues?q=${encodeURIComponent("is:pr " + q)}&sort=updated&per_page=30`,
        token!,
      );
      return raw.items.map(mapSearchItemToPR);
    },
    enabled: !!token,
    refetchInterval: POLL,
  });
}

export function useGetIssues(q: string, token: string | null) {
  return useQuery<IssueItem[]>({
    queryKey: ["issues", q, token],
    queryFn: async () => {
      const raw = await githubFetch<GHSearchResult>(
        `/search/issues?q=${encodeURIComponent("is:issue " + q)}&sort=updated&per_page=30`,
        token!,
      );
      return raw.items.map(mapSearchItemToIssue);
    },
    enabled: !!token,
    refetchInterval: POLL,
  });
}

export function useGetNotifications(token: string | null) {
  return useQuery<NotifItem[]>({
    queryKey: ["notifications", token],
    queryFn: async () => {
      const raw = await githubFetch<GHNotification[]>(
        "/notifications?all=false&per_page=30",
        token!,
      );
      return raw.map(mapNotification);
    },
    enabled: !!token,
    refetchInterval: POLL,
  });
}

export function useGetCIRuns(repos: string[], token: string | null) {
  return useQuery<CIItem[]>({
    queryKey: ["ci", repos, token],
    queryFn: async () => {
      const results = await Promise.all(
        repos.slice(0, 5).map(async (repo) => {
          try {
            const data = await githubFetch<GHWorkflowRunsResult>(
              `/repos/${repo}/actions/runs?per_page=10`,
              token!,
            );
            return (data.workflow_runs ?? []).map((run) => mapWorkflowRun(run, repo));
          } catch {
            return [];
          }
        }),
      );
      const runs = results.flat();
      runs.sort((a, b) => (a.age > b.age ? 1 : -1));
      return runs.slice(0, 20);
    },
    enabled: !!token && repos.length > 0,
    refetchInterval: POLL,
  });
}

export function useGetActivity(login: string, token: string | null) {
  return useQuery<ActivityItem[]>({
    queryKey: ["activity", login, token],
    queryFn: async () => {
      const raw = await githubFetch<GHEvent[]>(`/users/${login}/events?per_page=30`, token!);
      return raw.flatMap((e) => {
        const item = mapEvent(e);
        return item ? [item] : [];
      });
    },
    enabled: !!token && !!login,
    refetchInterval: POLL,
  });
}
