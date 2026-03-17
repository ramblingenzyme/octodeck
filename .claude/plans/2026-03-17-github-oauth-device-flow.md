# GitHub OAuth (Device Flow) + Real API Integration

## Status: Implemented

## Context

gh-deck is currently a pure prototype using hardcoded mock data. The goal is to add GitHub OAuth via the **Device Flow** (no backend required), replace mock data with real GitHub API calls via RTK Query, show the authenticated user's profile in the Topbar, and preserve a **demo mode** (mock data) for ongoing development — toggled via `VITE_DEMO_MODE=true` env var or `?demo` URL param.

---

## Implementation Order

### 1. Environment setup
**New files:** `.env.example`, `.env.local` (gitignored), `src/env.ts`

```
VITE_GITHUB_CLIENT_ID=your_oauth_app_client_id_here
VITE_DEMO_MODE=false
```

`src/env.ts` exports:
- `GITHUB_CLIENT_ID` — from `import.meta.env.VITE_GITHUB_CLIENT_ID`
- `isDemoMode: boolean` — `VITE_DEMO_MODE === 'true'` OR `?demo` URL param

User must register a GitHub OAuth App (Settings → Developer settings → OAuth Apps). Callback URL can be `http://localhost:5173` (unused by Device Flow but required by GitHub). The `client_id` is NOT a secret.

---

### 2. Auth Redux slice
**New files:** `src/store/authSlice.ts`, `src/store/tokenStorage.ts`

State shape:
```ts
type AuthStatus = 'idle' | 'polling' | 'authed' | 'error';
interface AuthState {
  status: AuthStatus;
  token: string | null;
  user: { login: string; avatarUrl: string; name: string | null } | null;
  deviceCode: string | null;
  userCode: string | null;
  verificationUri: string | null;
  expiresAt: number | null;
  interval: number;
  error: string | null;
}
```

Actions: `deviceCodeReceived`, `tokenReceived` (persists to localStorage), `userLoaded`, `logOut` (clears localStorage), `setError`, `clearError`.

`tokenStorage.ts` mirrors `layoutStorage.ts` with key `gh-deck:token`.

**Modify `src/store/index.ts`:** add `authReducer` + `githubApi`, export typed `RootState` / `AppDispatch` / `useAppSelector` / `useAppDispatch`.

---

### 3. Device Flow service
**New files:** `src/auth/deviceFlow.ts`, `src/auth/useDeviceFlow.ts`

`deviceFlow.ts` — two pure async functions:
- `requestDeviceCode(clientId)` → POST `/github-oauth/login/device/code` (proxied via Vite to avoid CORS) with scope `repo notifications read:user`
- `pollForToken(clientId, deviceCode, intervalSecs, signal: AbortSignal)` → POST `/github-oauth/login/oauth/access_token`, handles `authorization_pending` (wait), `slow_down` (+5s), `expired_token`/`access_denied` (throw), returns `access_token`.

**Note:** GitHub's OAuth endpoints do not send CORS headers, so direct browser `fetch` is blocked. Both endpoints are proxied through Vite's dev server (`/github-oauth/*` → `https://github.com/*`) configured in `vite.config.ts`.

`useDeviceFlow.ts` — custom hook orchestrating the flow with Redux:
1. Calls `requestDeviceCode`, dispatches `deviceCodeReceived`
2. `useEffect` kicks off `pollForToken` with cleanup `AbortController`
3. On success: dispatches `tokenReceived`, triggers user profile RTK Query
4. Exposes `{ userCode, verificationUri, expiresAt, status, error, start }`

---

### 4. GitHub API (RTK Query)
**New files:** `src/store/githubApi.ts`, `src/store/githubMappers.ts`, `src/types/github.ts`, `src/utils/relativeTime.ts`

`githubApi.ts` — `createApi` with `baseUrl: 'https://api.github.com'`, auth token injected via `prepareHeaders` from Redux state.

Endpoints:
| Endpoint | GitHub API | Maps to |
|---|---|---|
| `getUser` | GET `/user` | `{ login, avatarUrl, name }` |
| `getPRs` | GET `/search/issues?q=is:pr+is:open+involves:{login}` | `PRItem[]` |
| `getIssues` | GET `/search/issues?q=is:issue+is:open+involves:{login}` | `IssueItem[]` |
| `getNotifications` | GET `/notifications?all=false` | `NotifItem[]` |
| `getCIRuns` | GET `/repos/{owner}/{repo}/actions/runs` per repo in `col.repos` | `CIItem[]` |
| `getActivity` | GET `/users/{login}/events` | `ActivityItem[]` |

`githubMappers.ts` — pure mapper functions (easy to unit test):
- `mapSearchItemToPR`, `mapSearchItemToIssue`, `mapNotification`, `mapWorkflowRun`, `mapEvent`

`relativeTime.ts` — `formatAge(isoString): string` → `"2h"` / `"3d"` format (matches existing mock data style).

`github.ts` — raw GitHub API response types (kept separate from app types in `src/types/index.ts`).

---

### 5. Demo/live data hook
**New file:** `src/hooks/useColumnData.ts`

Returns demo mock data when `isDemoMode || !token`, otherwise returns results from the appropriate RTK Query hook. All non-relevant query hooks are skipped via the `skip` option.

**Modify `src/components/Column.tsx`:** Replace static `DATA_MAP` import with `useColumnData(col)`. Add loading skeleton and error states.

**Modify `src/components/Column.module.css`:** Added `.skeletonWrapper`, `.skeletonCard` (pulsing animation), `.errorState` classes.

---

### 6. Auth UI

**New files:** `src/components/AuthModal.tsx`, `src/components/AuthModal.module.css`

Follows the pattern of `AddColumnModal.tsx`. States:
1. **Idle:** "Sign in with GitHub" button + "Continue in Demo Mode" link
2. **Polling:** Large monospace `userCode`, clickable `verificationUri`, countdown, Cancel button
3. **Error:** Error message + Try again

**Modify `src/components/App.tsx`:**
- `showAuthModal` boolean state: true on mount if `!isDemoMode && auth.status === 'idle'`
- Mount effect: if token exists in Redux, trigger `getUser` query and dispatch `userLoaded`
- Wire `onSignOut` → dispatch `logOut()`, set `showAuthModal = true`

**Modify `src/components/Topbar.tsx`:**
- Reads `auth.user` and `auth.status` from Redux, reads `isDemoMode`
- Right side: avatar + `@login` + Sign Out (authed) / "Demo mode" badge + Sign In (demo)
- Status text: `"connected · {login}"` when authed, `"demo mode"` when demo

**Modify `src/components/Topbar.module.css`:** Added `.topbarRight`, `.userProfile`, `.userAvatar`, `.userLogin`, `.demoBadge`, `.btnSignIn`, `.btnSignOut`.

---

### 7. ColumnConfig extension for CI

**Modify `src/types/index.ts`:** Added `repos?: string[]` to `ColumnConfig` — CI columns use this to know which repos to fetch runs from.

**Modify `src/components/AddColumnModal.tsx`:** When adding a CI column, shows an optional textarea for `owner/repo` entries (one per line).

---

## Files Created

| File | Purpose |
|---|---|
| `src/env.ts` | `GITHUB_CLIENT_ID`, `isDemoMode` |
| `src/types/github.ts` | Raw GitHub API response types |
| `src/store/authSlice.ts` | Auth Redux slice |
| `src/store/tokenStorage.ts` | localStorage helpers for token |
| `src/store/githubApi.ts` | RTK Query GitHub API |
| `src/store/githubMappers.ts` | Response → app item type mappers |
| `src/utils/relativeTime.ts` | ISO → relative time formatter |
| `src/auth/deviceFlow.ts` | Device Flow fetch logic (proxied) |
| `src/auth/useDeviceFlow.ts` | Device Flow orchestration hook |
| `src/hooks/useColumnData.ts` | Demo/live data selector hook |
| `src/components/AuthModal.tsx` | Sign-in modal |
| `src/components/AuthModal.module.css` | Modal styles |
| `.env.example` | Env var template |

## Files Modified

| File | Change |
|---|---|
| `vite.config.ts` | Proxy `/github-oauth/*` → `https://github.com/*` to bypass CORS |
| `src/store/index.ts` | Add auth + githubApi, typed hooks |
| `src/types/index.ts` | `repos?: string[]` on ColumnConfig |
| `src/store/configApi.ts` | Passes `repos` through `addColumn` mutation |
| `src/components/App.tsx` | Auth modal state, user fetch on mount |
| `src/components/Column.tsx` | Use `useColumnData`, loading/error states |
| `src/components/Column.module.css` | Skeleton + error styles |
| `src/components/Topbar.tsx` | User profile, sign-in/out |
| `src/components/Topbar.module.css` | Avatar, demo badge styles |
| `src/components/AddColumnModal.tsx` | CI repo input |
| `src/components/Board.test.tsx` | Wrap renders in Redux `<Provider>` |
| `src/components/Column.test.tsx` | Wrap renders in Redux `<Provider>` |

---

## Verification

1. **Demo mode:** `npm run dev` → open `http://localhost:5173?demo` — all columns load mock data, no auth prompt, "Demo mode" in Topbar.
2. **Auth flow:** Open without `?demo` — AuthModal appears → click "Sign in with GitHub" → user code shown → visit `github.com/login/device` → enter code → app detects token → modal closes → Topbar shows avatar + login.
3. **Real data:** After auth, each column type loads real GitHub data for the authenticated user.
4. **Sign out:** Click "Sign out" → token cleared → AuthModal shown again.
5. **Persistence:** Reload after auth → token restored from localStorage → no re-auth required.
6. **Tests:** `npm test` → all 39 tests pass.
