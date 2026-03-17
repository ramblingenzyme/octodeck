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

type ColumnData = PRItem[] | IssueItem[] | CIItem[] | NotifItem[] | ActivityItem[];

interface UseColumnDataResult {
  data: ColumnData;
  isLoading: boolean;
  error: string | null;
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

  const prsResult = useGetPRsQuery(login, { skip: demo || col.type !== 'prs' || !login });
  const issuesResult = useGetIssuesQuery(login, { skip: demo || col.type !== 'issues' || !login });
  const notifsResult = useGetNotificationsQuery(undefined, {
    skip: demo || col.type !== 'notifications',
  });
  const repos = col.repos ?? [];
  const ciResult = useGetCIRunsQuery(repos, { skip: demo || col.type !== 'ci' });
  const activityResult = useGetActivityQuery(login, {
    skip: demo || col.type !== 'activity' || !login,
  });

  if (demo) {
    return { data: DEMO_DATA_MAP[col.type], isLoading: false, error: null };
  }

  switch (col.type) {
    case 'prs':
      return {
        data: prsResult.data ?? [],
        isLoading: prsResult.isLoading,
        error: prsResult.isError ? 'Failed to load PRs' : null,
      };
    case 'issues':
      return {
        data: issuesResult.data ?? [],
        isLoading: issuesResult.isLoading,
        error: issuesResult.isError ? 'Failed to load issues' : null,
      };
    case 'notifications':
      return {
        data: notifsResult.data ?? [],
        isLoading: notifsResult.isLoading,
        error: notifsResult.isError ? 'Failed to load notifications' : null,
      };
    case 'ci':
      return {
        data: ciResult.data ?? [],
        isLoading: ciResult.isLoading,
        error: ciResult.isError ? 'Failed to load CI runs' : null,
      };
    case 'activity':
      return {
        data: activityResult.data ?? [],
        isLoading: activityResult.isLoading,
        error: activityResult.isError ? 'Failed to load activity' : null,
      };
  }
}
