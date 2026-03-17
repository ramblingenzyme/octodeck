import { useMemo } from 'react';
import { isDemoMode } from '@/env';
import { MOCK_PRS, MOCK_ISSUES, MOCK_CI, MOCK_NOTIFS, MOCK_ACTIVITY } from '@/data/mock';
import {
  useGetPRsQuery,
  useGetIssuesQuery,
  useGetNotificationsQuery,
  useGetCIRunsQuery,
  useGetActivityQuery,
} from '@/store/githubApi';
import { useAppSelector } from '@/store';
import type { ColumnConfig, PRItem, IssueItem, CIItem, NotifItem, ActivityItem } from '@/types';
import { getItemDisplayText } from '@/utils/getItemDisplayText';

type AnyItem = PRItem | IssueItem | CIItem | NotifItem | ActivityItem;
type ColumnData = AnyItem[];

interface UseColumnDataResult {
  data: ColumnData;
  isLoading: boolean;
  error: string | null;
}

/** Parse a GitHub-style query string into key:value tokens and bare terms. */
function parseQuery(query: string): { key: string; value: string }[] {
  return query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const colon = token.indexOf(':');
      if (colon > 0) {
        return { key: token.slice(0, colon).toLowerCase(), value: token.slice(colon + 1).toLowerCase() };
      }
      return { key: '', value: token.toLowerCase() };
    });
}

function matchesTokens(item: AnyItem, tokens: ReturnType<typeof parseQuery>): boolean {
  return tokens.every(({ key, value }) => {
    if (!key) {
      return getItemDisplayText(item).toLowerCase().includes(value);
    }
    switch (key) {
      case 'repo':
        return item.repo.toLowerCase() === value;
      case 'author':
        return 'author' in item && (item as PRItem).author.toLowerCase() === value;
      case 'assignee':
        return 'assignee' in item && (item as IssueItem).assignee?.toLowerCase() === value;
      case 'label':
        return 'labels' in item && (item as PRItem | IssueItem).labels.some((l) => l.toLowerCase() === value);
      case 'is':
        if (value === 'draft') return 'draft' in item && (item as PRItem).draft === true;
        if (value === 'open') return 'state' in item && (item as IssueItem).state === 'open';
        if (value === 'closed') return 'state' in item && (item as IssueItem).state === 'closed';
        if (value === 'pr' || value === 'pull-request') return 'draft' in item;
        if (value === 'issue') return 'state' in item && !('draft' in item);
        return true;
      case 'status':
        return 'status' in item && (item as CIItem).status.toLowerCase() === value;
      case 'branch':
        return 'branch' in item && (item as CIItem).branch.toLowerCase().includes(value);
      default:
        return true;
    }
  });
}


const DEMO_DATA_MAP: Record<ColumnConfig['type'], ColumnData> = {
  prs: MOCK_PRS,
  issues: MOCK_ISSUES,
  ci: MOCK_CI,
  notifications: MOCK_NOTIFS,
  activity: MOCK_ACTIVITY,
};

export function useColumnData(col: ColumnConfig): UseColumnDataResult {
  const token = useAppSelector((s) => s.auth.token);
  const login = useAppSelector((s) => s.auth.user?.login ?? '');
  const demo = isDemoMode || !token;

  const tokens = useMemo(() => parseQuery(col.query ?? ''), [col.query]);
  const repos = useMemo(
    () => tokens.filter((t) => t.key === 'repo').map((t) => t.value),
    [tokens],
  );

  const prsResult = useGetPRsQuery(login, { skip: demo || col.type !== 'prs' || !login });
  const issuesResult = useGetIssuesQuery(login, { skip: demo || col.type !== 'issues' || !login });
  const notifsResult = useGetNotificationsQuery(undefined, {
    skip: demo || col.type !== 'notifications',
  });
  const ciResult = useGetCIRunsQuery(repos, { skip: demo || col.type !== 'ci' });
  const activityResult = useGetActivityQuery(login, {
    skip: demo || col.type !== 'activity' || !login,
  });

  const filter = (items: ColumnData) =>
    tokens.length ? items.filter((item) => matchesTokens(item, tokens)) : items;

  if (demo) {
    return { data: filter(DEMO_DATA_MAP[col.type]), isLoading: false, error: null };
  }

  switch (col.type) {
    case 'prs':
      return {
        data: filter(prsResult.data ?? []),
        isLoading: prsResult.isLoading,
        error: prsResult.isError ? 'Failed to load PRs' : null,
      };
    case 'issues':
      return {
        data: filter(issuesResult.data ?? []),
        isLoading: issuesResult.isLoading,
        error: issuesResult.isError ? 'Failed to load issues' : null,
      };
    case 'notifications':
      return {
        data: filter(notifsResult.data ?? []),
        isLoading: notifsResult.isLoading,
        error: notifsResult.isError ? 'Failed to load notifications' : null,
      };
    case 'ci':
      return {
        data: filter(ciResult.data ?? []),
        isLoading: ciResult.isLoading,
        error: ciResult.isError ? 'Failed to load CI runs' : null,
      };
    case 'activity':
      return {
        data: filter(activityResult.data ?? []),
        isLoading: activityResult.isLoading,
        error: activityResult.isError ? 'Failed to load activity' : null,
      };
  }
}
