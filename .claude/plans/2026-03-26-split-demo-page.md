# Plan: Split demo mode into a separate /demo page

## Context

Demo mode is currently interleaved with the real app via an `isDemoMode` flag checked throughout `useColumnData`, `useAuth`, and `Topbar`. This causes two problems: (1) filters for CI/deployments now rely on server-side API params that don't exist in demo mode, making demo filtering incorrect; (2) it's hard to reason about and maintain. Splitting into a dedicated `/demo` page cleanly separates concerns — the real app is only for authenticated users, and `/demo` always uses mock data with full client-side filtering.

The SPA fallback (`public/_redirects`: `/* /index.html 200`) and Vite dev server already handle `/demo` routing with no additional config.

## Approach: pathname-based routing, no new router library

Check `window.location.pathname === '/demo'` at startup. Render different UI based on that. No React Router or other library.

## Files to modify

### `src/env.ts`

- Replace `isDemoMode` (env var + `?demo` param) with `export const isDemo = window.location.pathname === '/demo'`
- Remove `VITE_DEMO_MODE` env var support

### `src/hooks/useAuth.ts`

- Replace `isDemoMode` with `isDemo`
- Behaviour unchanged: auth modal skipped on `/demo`, auth bootstrapped on `/`

### `src/components/Topbar.tsx`

- Replace `isDemoMode` with `isDemo`
- Add a link back to `/` on the demo badge (e.g. "Sign in" → `href="/"`)

### `src/components/App.tsx`

- Change `onDemoMode` callback from closing the modal to navigating: `window.location.href = '/demo'`
- Add pathname-based routing: render `<DemoApp />` when `isDemo`, otherwise render the real app

### `src/hooks/useColumnData.ts`

- Remove all demo branching — this hook is now real-data only

### `src/store/layoutStore.ts`

- Initialise with `isDemo ? DEMO_COLUMNS : loadLayout()`
- Skip `saveLayout()` calls when `isDemo` (demo layout is session-only, not persisted to localStorage)

## New files

### `src/demo/columns.ts`

- `DEMO_COLUMNS: ColumnConfig[]` — preset showcasing all six column types (prs, issues, ci, activity, releases, deployments) with sensible default queries

### `src/demo/useDemoColumnData.ts`

- Takes `col: ColumnConfig`, returns the same `UseColumnDataResult` shape as `useColumnData`
- Looks up mock data from `DEMO_DATA_MAP` (same mock arrays already in `src/demo/mock.ts`)
- Applies `matchesTokens` client-side for **all** column types including PRs/issues (fixes the filtering bug)
- No SWR, no network calls, no auth dependency

### `src/demo/DemoColumn.tsx`

- Mirrors `Column.tsx` but calls `useDemoColumnData(col)` instead of `useColumnData(col)`
- No other changes to the column rendering — reuses the same card components, `CardContainer`, etc.

### `src/components/DemoApp.tsx`

- Renders `<Topbar>` (demo badge + sign-in link to `/`) and a board of `<DemoColumn>` components
- Holds demo column state in local React state initialised from `DEMO_COLUMNS` (session-only, not persisted)
- No `<AuthModal>`, no auth store dependency
- Supports add/remove/reorder within the session using the same mutation helpers from `src/store/layoutMutations.ts`

## Key behaviour changes

| Scenario                      | Before                              | After                                         |
| ----------------------------- | ----------------------------------- | --------------------------------------------- |
| Unauthenticated on `/`        | Mock data shown                     | Auth modal shown, no mock data                |
| Click "Continue in Demo Mode" | Closes modal, same URL              | Navigates to `/demo`                          |
| `/demo`                       | Mixed server/client filtering       | All filtering client-side via `matchesTokens` |
| Demo layout                   | Shared with real app (localStorage) | Fixed preset `DEMO_COLUMNS`, session-only     |
| `?demo` URL param             | Activates demo mode                 | No longer supported                           |

## Verification

- `npm test` — all tests pass (update any tests that import `isDemoMode`)
- Visit `/` without being signed in → auth modal appears, no mock data
- Click "Continue in Demo Mode" → navigates to `/demo`, shows all 6 column types with mock data
- On `/demo`, type `status:failure` in a CI column → filters mock CI runs correctly client-side
- On `/demo`, type `branch:main` in a CI column → filters correctly (client-side, no API call)
- Sign in from `/demo` via the topbar → navigates back to `/`, real data loads
