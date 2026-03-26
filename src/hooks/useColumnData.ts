import { useCallback, useMemo } from "preact/hooks";
import {
  useGetPRs,
  useGetIssues,
  useGetCIRuns,
  useGetActivity,
  useGetUser,
  useGetReleases,
  useGetDeployments,
} from "@/store/githubQueries";
import { useAuthStore } from "@/store/authStore";
import type { ColumnConfig, KnownItem, AnyItem } from "@/types";
import { parseQuery, matchesTokens } from "@/utils/queryFilter";

type ColumnData = AnyItem[];

export interface UseColumnDataResult {
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

export function useColumnData(col: ColumnConfig): UseColumnDataResult {
  const sessionId = useAuthStore((s) => s.sessionId);

  const { data: user } = useGetUser(sessionId);
  const login = user?.login ?? "";

  const tokens = useMemo(() => parseQuery(col.query ?? ""), [col.query]);
  const repos = col.repos ?? [];

  // All query hooks are called unconditionally — React's rules of hooks forbid
  // conditional hook calls. SWR skips fetching when the key (sessionId) is null, so
  // only the hook matching col.type will ever make a network request.
  const prsResult = useGetPRs(col.query ?? "", col.type !== "prs" ? null : sessionId);
  const issuesResult = useGetIssues(col.query ?? "", col.type !== "issues" ? null : sessionId);
  const ciResult = useGetCIRuns(repos, col.type !== "ci" ? null : sessionId);
  const activityResult = useGetActivity(
    login,
    col.type !== "activity" || !login ? null : sessionId,
  );
  const releasesResult = useGetReleases(repos, col.type !== "releases" ? null : sessionId);
  const deploymentsResult = useGetDeployments(repos, col.type !== "deployments" ? null : sessionId);
  const filter = useCallback(
    (items: ColumnData) =>
      tokens.length ? items.filter((item) => matchesTokens(item as KnownItem, tokens)) : items,
    [tokens],
  );

  // PRs and issues use the GitHub Search API, which applies the query server-side.
  // All other column types fetch pre-built lists and need client-side filtering.
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
