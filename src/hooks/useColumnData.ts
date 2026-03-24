import { useCallback, useMemo } from "preact/hooks";
import { isDemoMode } from "@/env";
import {
  MOCK_PRS,
  MOCK_ISSUES,
  MOCK_CI,
  MOCK_ACTIVITY,
  MOCK_RELEASES,
  MOCK_DEPLOYMENTS,
  MOCK_SECURITY,
} from "@/demo/mock";
import {
  useGetPRs,
  useGetIssues,
  useGetCIRuns,
  useGetActivity,
  useGetUser,
  useGetReleases,
  useGetDeployments,
  useGetSecurityAlerts,
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
  warnings: string[];
  refetch: () => void;
}

const noop = () => {};

function toResult(
  result: {
    data?: AnyItem[];
    isLoading: boolean;
    isValidating: boolean;
    error?: unknown;
    mutate: () => void;
  },
  errorMsg: string,
  filter: (items: AnyItem[]) => AnyItem[],
  applyFilter = false,
): UseColumnDataResult {
  const data = result.data ?? [];
  return {
    data: applyFilter ? filter(data) : data,
    isLoading: result.isLoading,
    isFetching: result.isValidating,
    error: result.error ? errorMsg : null,
    warnings: [],
    refetch: result.mutate,
  };
}

function toMultiResult(
  result: {
    data?: { items: AnyItem[]; fetchErrors: string[] };
    isLoading: boolean;
    isValidating: boolean;
    error?: unknown;
    mutate: () => void;
  },
  errorMsg: string,
  filter: (items: AnyItem[]) => AnyItem[],
): UseColumnDataResult {
  const items = result.data?.items ?? [];
  return {
    data: filter(items),
    isLoading: result.isLoading,
    isFetching: result.isValidating,
    error: result.error ? errorMsg : null,
    warnings: result.data?.fetchErrors ?? [],
    refetch: result.mutate,
  };
}

const DEMO_DATA_MAP: Partial<Record<ColumnConfig["type"], ColumnData>> = {
  prs: MOCK_PRS,
  issues: MOCK_ISSUES,
  ci: MOCK_CI,
  activity: MOCK_ACTIVITY,
  releases: MOCK_RELEASES,
  deployments: MOCK_DEPLOYMENTS,
  security: MOCK_SECURITY,
};

export function useColumnData(col: ColumnConfig): UseColumnDataResult {
  const sessionId = useAuthStore((s) => s.sessionId);
  // This lets the mock data render behind the auth modal
  const demo = isDemoMode || !sessionId;

  const { data: user } = useGetUser(demo ? null : sessionId);
  const login = user?.login ?? "";

  const tokens = useMemo(() => parseQuery(col.query ?? ""), [col.query]);
  const repos = col.repos ?? [];

  // All query hooks are called unconditionally — React's rules of hooks forbid
  // conditional hook calls. SWR skips fetching when the key (sessionId) is null, so
  // only the hook matching col.type will ever make a network request.
  const prsResult = useGetPRs(col.query ?? "", demo || col.type !== "prs" ? null : sessionId);
  const issuesResult = useGetIssues(
    col.query ?? "",
    demo || col.type !== "issues" ? null : sessionId,
  );
  const ciResult = useGetCIRuns(repos, demo || col.type !== "ci" ? null : sessionId);
  const activityResult = useGetActivity(
    login,
    demo || col.type !== "activity" || !login ? null : sessionId,
  );
  const releasesResult = useGetReleases(repos, demo || col.type !== "releases" ? null : sessionId);
  const deploymentsResult = useGetDeployments(
    repos,
    demo || col.type !== "deployments" ? null : sessionId,
  );
  const securityResult = useGetSecurityAlerts(
    repos,
    demo || col.type !== "security" ? null : sessionId,
  );

  const filter = useCallback(
    (items: ColumnData) =>
      tokens.length ? items.filter((item) => matchesTokens(item as KnownItem, tokens)) : items,
    [tokens],
  );

  if (demo) {
    const demoData = DEMO_DATA_MAP[col.type] ?? [];
    // PRs and issues use the GitHub Search API, which applies the query server-side.
    // All other column types fetch pre-built lists and need client-side filtering.
    const shouldFilter = col.type !== "prs" && col.type !== "issues";
    return {
      data: shouldFilter ? filter(demoData) : demoData,
      isLoading: false,
      isFetching: false,
      error: null,
      warnings: [],
      refetch: noop,
    };
  }

  switch (col.type) {
    case "prs":
      return toResult(prsResult, "Failed to load PRs", filter);
    case "issues":
      return toResult(issuesResult, "Failed to load issues", filter);
    case "ci":
      return toMultiResult(ciResult, "Failed to load CI runs", filter);
    case "activity":
      return toResult(activityResult, "Failed to load activity", filter, true);
    case "releases":
      return toMultiResult(releasesResult, "Failed to load releases", filter);
    case "deployments":
      return toMultiResult(deploymentsResult, "Failed to load deployments", filter);
    case "security":
      return toMultiResult(securityResult, "Failed to load security alerts", filter);
    default:
      return {
        data: [],
        isLoading: false,
        isFetching: false,
        error: null,
        warnings: [],
        refetch: noop,
      };
  }
}
