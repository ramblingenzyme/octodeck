# Remove Redux Toolkit: Replace with Zustand + TanStack Query

## Context

RTK Query was the single largest chunk in the bundle (visible in treemap). Total JS was 197KB/64KB gzip.
Redux Toolkit + react-redux + reselect provided a lot of infrastructure for what amounted to:
- Simple auth state with localStorage side-effects
- Simple localStorage-backed column layout mutations
- GitHub API fetching with caching and polling

Replacing with Zustand (~1KB gzip) + TanStack Query (~13KB gzip) reduced the bundle to 115KB/37KB gzip — a saving of ~27KB gzip (~42%).

## Packages

```
npm install zustand @tanstack/react-query
npm uninstall @reduxjs/toolkit react-redux immer
```

## New Files

### `src/store/authStore.ts`
Zustand store replacing `authSlice.ts` + listener middleware. Actions (`tokenReceived`, `logOut`, etc.)
call `saveToken`/`clearToken` directly — no listener middleware needed.

Initial state bootstraps from `loadToken()` synchronously.

### `src/store/layoutStore.ts`
Zustand store replacing `configApi.ts` (no immer middleware needed).
- `columns: ColumnConfig[]` initialized from `loadLayout()` (synchronous — no loading state)
- Actions: `addColumn`, `removeColumn`, `reorder`, `updateColumnQuery`
- Each action produces a new array with plain JS spread/filter/splice, then calls `saveLayout()` and `set({ columns: next })`

### `src/store/githubClient.ts`
Shared fetch helper replacing RTK's `baseQuery` + `prepareHeaders`:
```ts
export async function githubFetch<T>(path: string, token: string, signal?: AbortSignal): Promise<T>
```
Token is passed in by each hook (read from `useAuthStore`) rather than pulled from Redux state.

### `src/store/githubQueries.ts`
All GitHub query hooks using TanStack Query, replacing `githubApi.ts`.
- Each RTK endpoint becomes a `useQuery` hook with `enabled: !!token`
- Passing `null` as token disables the query (replaces RTK's `skip` option)
- `transformResponse` logic moved inline into `queryFn`
- Polling at 5-minute intervals via `refetchInterval: 5 * 60 * 1000`
- `queryKey` includes `token` so cache is per-token (handles sign-out correctly)
- `getCIRuns` sequential multi-repo loop unchanged in logic

## Files Deleted
- `src/store/authSlice.ts`
- `src/store/configApi.ts`
- `src/store/githubApi.ts`
- `src/store/index.ts`

## Files Untouched
- `src/store/layoutStorage.ts`
- `src/store/tokenStorage.ts`
- `src/store/githubMappers.ts`
- `src/auth/deviceFlow.ts`
- All card components, all CSS

## Files Modified

| File | Change |
|------|--------|
| `src/store/layoutMutations.ts` | Rewritten as pure functions returning new arrays (removed Immer draft mutations) |
| `src/main.tsx` | Swapped `<Provider store={store}>` → `<QueryClientProvider client={queryClient}>` |
| `src/components/App.tsx` | Swapped RTK layout/auth hooks → `useLayoutStore` + `useAuthStore` |
| `src/components/Board.tsx` | Swapped `useReorderMutation` → `useLayoutStore((s) => s.reorder)` |
| `src/components/Column.tsx` | Swapped `useUpdateColumnQueryMutation` → `useLayoutStore((s) => s.updateColumnQuery)` |
| `src/components/Topbar.tsx` | Swapped `useAppSelector` / `useGetUserQuery` → `useAuthStore` + `useGetUser` |
| `src/components/AuthModal.tsx` | Swapped `useAppDispatch` / `clearError` action → `useAuthStore` |
| `src/auth/useDeviceFlow.ts` | Swapped dispatch/selector → Zustand; removed manual `getUser.initiate()` call |
| `src/hooks/useColumnData.ts` | Swapped all RTK Query hooks → TanStack Query hooks from `githubQueries.ts`; swapped token selector |
| `src/store/configApi.test.ts` | Removed Immer `produce` wrapper; tests now call pure functions directly |
| `src/components/App.e2e.test.tsx` | Replaced `<Provider store={store}>` + `configApi.util.resetApiState()` with `<QueryClientProvider>` + `useLayoutStore.setState(...)` |
| `src/components/Board.test.tsx` | Replaced Redux `<Provider>` with `<QueryClientProvider>` |
| `src/components/Column.test.tsx` | Replaced Redux `<Provider>` with `<QueryClientProvider>` |

## Shim Fix

TanStack Query internally imports `react/jsx-runtime`. The Preact shim (`shims/react/`) didn't
export that subpath, causing test failures. Fixed by adding:
- `shims/react/jsx-runtime.mjs` — `export * from 'preact/jsx-runtime'`
- `shims/react/jsx-runtime.cjs` — `module.exports = require('preact/jsx-runtime')`
- Added `"./jsx-runtime"` entry to `shims/react/package.json` exports map

## Key Design Decisions

- Layout state is synchronous (no loading state needed — `loadLayout()` is a localStorage read)
- Token passed as a parameter to each query hook; `null` disables the query (clean alternative to RTK's `skip`)
- `queryKey` includes the token so cached data is invalidated on sign-out/sign-in
- No Immer anywhere — layout mutations are simple enough to express with spread/filter/splice
