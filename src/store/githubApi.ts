import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./index";
import type { PRItem, IssueItem, NotifItem, CIItem, ActivityItem } from "@/types";
import type {
  GHUser,
  GHSearchResult,
  GHNotification,
  GHRepo,
  GHWorkflowRunsResult,
  GHEvent,
} from "@/types/github";
export interface AuthUser {
  login: string;
  avatarUrl: string;
  name: string | null;
}
import {
  mapSearchItemToPR,
  mapSearchItemToIssue,
  mapNotification,
  mapWorkflowRun,
  mapEvent,
} from "./githubMappers";

export const githubApi = createApi({
  reducerPath: "githubApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.github.com",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
        headers.set("Accept", "application/vnd.github+json");
      }
      return headers;
    },
  }),
  endpoints: (build) => ({
    getUser: build.query<AuthUser, void>({
      query: () => "/user",
      transformResponse: (raw: GHUser) => ({
        login: raw.login,
        avatarUrl: raw.avatar_url,
        name: raw.name,
      }),
    }),
    getPRs: build.query<PRItem[], string>({
      query: (q) => `/search/issues?q=${encodeURIComponent("is:pr " + q)}&sort=updated&per_page=30`,
      transformResponse: (raw: GHSearchResult) => raw.items.map(mapSearchItemToPR),
    }),
    getIssues: build.query<IssueItem[], string>({
      query: (q) =>
        `/search/issues?q=${encodeURIComponent("is:issue " + q)}&sort=updated&per_page=30`,
      transformResponse: (raw: GHSearchResult) => raw.items.map(mapSearchItemToIssue),
    }),
    getNotifications: build.query<NotifItem[], void>({
      query: () => "/notifications?all=false&per_page=30",
      transformResponse: (raw: GHNotification[]) => raw.map(mapNotification),
    }),
    getCIRuns: build.query<CIItem[], string[]>({
      async queryFn(repos, _api, _extra, baseQuery) {
        const runs: CIItem[] = [];
        for (const repo of repos.slice(0, 5)) {
          const result = await baseQuery(`/repos/${repo}/actions/runs?per_page=10`);
          if (result.error) continue;
          const data = result.data as GHWorkflowRunsResult;
          for (const run of data.workflow_runs ?? []) {
            runs.push(mapWorkflowRun(run, repo));
          }
        }
        runs.sort((a, b) => (a.age > b.age ? 1 : -1));
        return { data: runs.slice(0, 20) };
      },
    }),
    getRepos: build.query<GHRepo[], void>({
      query: () => "/user/repos?sort=pushed&per_page=10",
    }),
    getActivity: build.query<ActivityItem[], string>({
      query: (login) => `/users/${login}/events?per_page=30`,
      transformResponse: (raw: GHEvent[]) =>
        raw.flatMap((e) => {
          const item = mapEvent(e);
          return item ? [item] : [];
        }),
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetPRsQuery,
  useGetIssuesQuery,
  useGetNotificationsQuery,
  useGetCIRunsQuery,
  useGetReposQuery,
  useGetActivityQuery,
} = githubApi;
