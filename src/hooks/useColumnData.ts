import { useMemo } from "react";
import { isDemoMode } from "@/env";
import { MOCK_PRS, MOCK_ISSUES, MOCK_CI, MOCK_NOTIFS, MOCK_ACTIVITY } from "@/test/fixtures/mock";
import {
  useGetPRsQuery,
  useGetIssuesQuery,
  useGetNotificationsQuery,
  useGetCIRunsQuery,
  useGetActivityQuery,
  useGetUserQuery,
} from "@/store/githubApi";
import { useAppSelector } from "@/store";
import type { ColumnConfig, KnownItem, AnyItem } from "@/types";
import { parseQuery, matchesTokens } from "@/utils/queryFilter";

type ColumnData = AnyItem[];

interface UseColumnDataResult {
  data: ColumnData;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => void;
}

const DEMO_DATA_MAP: Partial<Record<ColumnConfig["type"], ColumnData>> = {
  prs: MOCK_PRS,
  issues: MOCK_ISSUES,
  ci: MOCK_CI,
  notifications: MOCK_NOTIFS,
  activity: MOCK_ACTIVITY,
};

export function useColumnData(col: ColumnConfig): UseColumnDataResult {
  const token = useAppSelector((s) => s.auth.token);
  const demo = isDemoMode || !token;
  const { data: user } = useGetUserQuery(undefined, { skip: demo || !token });
  const login = user?.login ?? "";

  const tokens = useMemo(() => parseQuery(col.query ?? ""), [col.query]);
  const repos = useMemo(() => tokens.filter((t) => t.key === "repo").map((t) => t.value), [tokens]);

  const pollOpts = { pollingInterval: 5 * 60 * 1000 };
  const prsResult = useGetPRsQuery(login, { skip: demo || col.type !== "prs" || !login, ...pollOpts });
  const issuesResult = useGetIssuesQuery(login, { skip: demo || col.type !== "issues" || !login, ...pollOpts });
  const notifsResult = useGetNotificationsQuery(undefined, {
    skip: demo || col.type !== "notifications",
    ...pollOpts,
  });
  const ciResult = useGetCIRunsQuery(repos, { skip: demo || col.type !== "ci", ...pollOpts });
  const activityResult = useGetActivityQuery(login, {
    skip: demo || col.type !== "activity" || !login,
    ...pollOpts,
  });

  const filter = (items: ColumnData) =>
    tokens.length ? items.filter((item) => matchesTokens(item as KnownItem, tokens)) : items;

  const noop = () => {};

  if (demo) {
    return { data: filter(DEMO_DATA_MAP[col.type] ?? []), isLoading: false, isFetching: false, error: null, refetch: noop };
  }

  switch (col.type) {
    case "prs":
      return {
        data: filter(prsResult.data ?? []),
        isLoading: prsResult.isLoading,
        isFetching: prsResult.isFetching,
        error: prsResult.isError ? "Failed to load PRs" : null,
        refetch: prsResult.refetch,
      };
    case "issues":
      return {
        data: filter(issuesResult.data ?? []),
        isLoading: issuesResult.isLoading,
        isFetching: issuesResult.isFetching,
        error: issuesResult.isError ? "Failed to load issues" : null,
        refetch: issuesResult.refetch,
      };
    case "notifications":
      return {
        data: filter(notifsResult.data ?? []),
        isLoading: notifsResult.isLoading,
        isFetching: notifsResult.isFetching,
        error: notifsResult.isError ? "Failed to load notifications" : null,
        refetch: notifsResult.refetch,
      };
    case "ci":
      return {
        data: filter(ciResult.data ?? []),
        isLoading: ciResult.isLoading,
        isFetching: ciResult.isFetching,
        error: ciResult.isError ? "Failed to load CI runs" : null,
        refetch: ciResult.refetch,
      };
    case "activity":
      return {
        data: filter(activityResult.data ?? []),
        isLoading: activityResult.isLoading,
        isFetching: activityResult.isFetching,
        error: activityResult.isError ? "Failed to load activity" : null,
        refetch: activityResult.refetch,
      };
    default:
      return { data: [], isLoading: false, isFetching: false, error: null, refetch: noop };
  }
}
