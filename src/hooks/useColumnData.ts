import { useCallback, useMemo } from "preact/hooks";
import { isDemoMode } from "@/env";
import { MOCK_PRS, MOCK_ISSUES, MOCK_CI, MOCK_NOTIFS, MOCK_ACTIVITY } from "@/test/fixtures/mock";
import {
  useGetPRs,
  useGetIssues,
  useGetNotifications,
  useGetCIRuns,
  useGetActivity,
  useGetUser,
} from "@/store/githubQueries";
import { useAuthStore } from "@/store/authStore";
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

const noop = () => {};

function toResult(
  result: {
    data?: AnyItem[];
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  },
  error: string,
  filter: (items: AnyItem[]) => AnyItem[],
  applyFilter = false,
): UseColumnDataResult {
  const data = result.data ?? [];
  return {
    data: applyFilter ? filter(data) : data,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    error: result.isError ? error : null,
    refetch: result.refetch,
  };
}

const DEMO_DATA_MAP: Partial<Record<ColumnConfig["type"], ColumnData>> = {
  prs: MOCK_PRS,
  issues: MOCK_ISSUES,
  ci: MOCK_CI,
  notifications: MOCK_NOTIFS,
  activity: MOCK_ACTIVITY,
};

export function useColumnData(col: ColumnConfig): UseColumnDataResult {
  const token = useAuthStore((s) => s.token);
  const demo = isDemoMode || !token;

  const { data: user } = useGetUser(demo ? null : token);
  const login = user?.login ?? "";

  const tokens = useMemo(() => parseQuery(col.query ?? ""), [col.query]);
  const repos = useMemo(() => tokens.filter((t) => t.key === "repo").map((t) => t.value), [tokens]);

  const prsResult = useGetPRs(col.query ?? "", demo || col.type !== "prs" ? null : token);
  const issuesResult = useGetIssues(col.query ?? "", demo || col.type !== "issues" ? null : token);
  const notifsResult = useGetNotifications(demo || col.type !== "notifications" ? null : token);
  const ciResult = useGetCIRuns(repos, demo || col.type !== "ci" ? null : token);
  const activityResult = useGetActivity(
    login,
    demo || col.type !== "activity" || !login ? null : token,
  );

  const filter = useCallback(
    (items: ColumnData) =>
      tokens.length ? items.filter((item) => matchesTokens(item as KnownItem, tokens)) : items,
    [tokens],
  );

  if (demo) {
    const demoData = DEMO_DATA_MAP[col.type] ?? [];
    const shouldFilter = col.type !== "prs" && col.type !== "issues";
    return {
      data: shouldFilter ? filter(demoData) : demoData,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: noop,
    };
  }

  switch (col.type) {
    case "prs":
      return toResult(prsResult, "Failed to load PRs", filter);
    case "issues":
      return toResult(issuesResult, "Failed to load issues", filter);
    case "notifications":
      return toResult(notifsResult, "Failed to load notifications", filter, true);
    case "ci":
      return toResult(ciResult, "Failed to load CI runs", filter, true);
    case "activity":
      return toResult(activityResult, "Failed to load activity", filter, true);
    default:
      return { data: [], isLoading: false, isFetching: false, error: null, refetch: noop };
  }
}
