# Plan: Integrate filter tokens into GitHub API calls

## Context
Filters were previously applied client-side after a broad API fetch, and default query terms (`is:pr`, `is:open`, `involves:{login}`) were hardcoded inside `githubApi.ts`. This plan:
1. Moves user-editable defaults into the UI (column config) so they're visible and editable
2. Passes `col.query` directly to the GitHub search API for PR/issue columns (no parsing needed — it's already a valid GitHub search string)
3. Keeps `is:pr` / `is:issue` inside their respective endpoint definitions (not user-editable)
4. Keeps client-side filtering (parse + matchesTokens) only for CI/notifications/activity, where APIs don't support query params

GitHub's search API supports `@me` as a self-reference (e.g. `involves:@me`), eliminating the need to inject `login` dynamically.

## Changes

### `src/constants/index.ts`
- Added `defaultQuery` field to `COLUMN_TYPES`: `'involves:@me is:open'` for prs/issues, `''` for ci/notifications/activity
- Added `query: 'involves:@me is:open'` to `DEFAULT_COLUMNS` entries for prs and issues

### `src/store/githubApi.ts`
- `getPRs`: arg changed from `login: string` to `q: string`; prepends `is:pr` before encoding into URL
- `getIssues`: arg changed from `login: string` to `q: string`; prepends `is:issue` before encoding into URL

### `src/hooks/useColumnData.ts`
- Passes `col.query ?? ''` directly to `useGetPRsQuery` / `useGetIssuesQuery` — no parsing needed, `login` no longer needed for these hooks
- Removed `skip: !login` guard for prs/issues (not needed since `@me` handles self-reference)
- Removed client-side `filter()` call for prs/issues in both demo mode and live mode (filtering is server-side)
- CI, notifications, activity continue to use `parseQuery` + `matchesTokens` client-side (unchanged)

### `src/components/AddColumnModal.tsx`
- Query field pre-filled from `COLUMN_TYPES[selectedType].defaultQuery` on mount
- `handleTypeChange` now also resets query to the new type's `defaultQuery`

### `src/components/AddColumnModal.test.tsx`
- Updated expectation to reflect pre-filled default query instead of `undefined`

## Files not changed
- `src/utils/queryFilter.ts` — `parseQuery` + `matchesTokens` continue to serve CI/notifs/activity client-side filtering
