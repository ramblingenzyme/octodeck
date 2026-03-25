# Context

Overall coverage is 86% statements / 80% branches — healthy for a prototype, but several specific gaps create real bug risk. This plan identifies those gaps by severity and proposes concrete tests to add.

---

## Overall Numbers

| Metric     | Coverage |
| ---------- | -------- |
| Statements | 86.37%   |
| Branches   | 79.74%   |
| Functions  | 79.37%   |
| Lines      | 87.46%   |

---

## High-Risk Gaps (likely to hide real bugs)

### 1. `src/auth/oauthFlow.ts` — 0% coverage

- **File**: `src/auth/oauthFlow.ts` lines 7-40
- **Risk**: The entire OAuth redirect, session fetch, and logout logic is untested. Any regression here breaks sign-in completely and is only caught by manual testing.
- **What to test**: `startOAuthFlow()` redirect construction, `fetchSession()` success/error paths, `logOut()` token clearing + redirect.

### 2. `src/auth/token.ts` — 50% statements, 37% branches

- **File**: `src/auth/token.ts` lines 27-42, 47-50, 62-67
- **Risk**: Token storage/retrieval/clearing is the security boundary for auth. Untested branches mean edge cases (missing token, malformed storage) may silently fail.
- **What to test**: `getToken()` when absent, `clearToken()` idempotency, `githubFetch()` header injection and non-2xx passthrough.

### 3. `src/store/layoutMutations.ts` — 67% statements, 50% branches

- **File**: `src/store/layoutMutations.ts` lines 34-43
- **Risk**: These are pure functions for all column add/remove/reorder/update operations. The untested branches (lines 34-43) are likely edge cases in `applyUpdateQuery` or `applyUpdateRepos` that could silently corrupt column state.
- **What to test**: All six mutation functions (`applyAdd`, `applyRemove`, `applyReorder`, `applyUpdateQuery`, `applyUpdateTitle`, `applyUpdateRepos`) including not-found / no-op cases.

### 4. `src/hooks/useColumnDragDrop.ts` — 62% statements, 33% branches

- **File**: `src/hooks/useColumnDragDrop.ts` lines ~30, 39-41, 46-51
- **Risk**: 33% branch coverage on drag-and-drop means the drop-edge detection and reorder dispatch logic is mostly untested. Bugs here cause silent column reordering failures.
- **What to test**: `dragstart`, `dragover` (left/right edge detection), `drop` (dispatches correct reorder), `dragend` cleanup.

### 5. `src/components/columns/DeploymentsColumn.tsx` + `ReleasesColumn.tsx` — 25% each

- **Files**: lines 8-15 in both
- **Risk**: These column types are essentially untested. If their data-fetching or rendering breaks, there's no safety net. They're lower-traffic features but still user-visible.
- **What to test**: Renders cards from data, shows empty state when no data, shows repo-required state when no repos configured.

### 6. `src/components/cards/ReleaseCard.tsx` — 14% statements

- **File**: `src/components/cards/ReleaseCard.tsx` lines 10-19
- **Risk**: Nearly the entire card is untested. Any rendering regression goes undetected.
- **What to test**: Renders release name, tag, author, date; handles missing fields gracefully.

---

## Medium-Risk Gaps

### 7. `src/store/layoutStore.ts` — 82% statements

- **File**: `src/store/layoutStore.ts` lines 45-48
- **Risk**: The untested lines are likely in the `rehydrate`/`loadLayout` path or an error branch. Worth checking what's on lines 45-48.

### 8. `src/components/BaseColumn.tsx` — 72% statements, 71% branches

- **File**: `src/components/BaseColumn.tsx` lines ~93-108, 118, 142
- **Risk**: BaseColumn is the shared shell for all columns — its untested branches (loading state? error display? empty state variants?) could affect all column types.

### 9. `src/components/ColumnSettingsModal.tsx` — 55% statements

- **File**: lines 32-39, 84-85
- **Risk**: The save path for column settings (updating query/repos) may be partially untested, meaning a regression could silently fail to persist edits.

### 10. `src/store/githubQueries.ts` — 91% statements, 81% branches

- **File**: lines 127-138
- **Risk**: Likely an error handling path in one of the query hooks. Low risk but worth checking.

---

## Low-Risk / Not Worth Adding Tests

- `src/main.tsx` (0%) — app entry point, not meaningful to unit test
- Icon components — simple SVG wrappers, high cost/benefit ratio
- `src/components/cards/FallbackCard.tsx` (50%) — trivial error display component
- `src/components/cards/DeploymentCard.tsx` (33%) — if DeploymentsColumn gets tested, this gets covered transitively

---

## Recommended Test Files to Create (Priority Order)

1. `test/auth/token.test.ts` — token lifecycle
2. `test/auth/oauthFlow.test.ts` — OAuth flow (with mocked `window.location`)
3. `test/store/layoutMutations.test.ts` — pure mutation functions
4. `test/hooks/useColumnDragDrop.test.ts` — drag events and edge detection
5. `test/components/columns/DeploymentsColumn.test.tsx` + `ReleasesColumn.test.tsx`
6. `test/components/cards/ReleaseCard.test.tsx`

---

## Verification

After adding tests:

```
npm test
npm run test:coverage
```

Target: branch coverage ≥ 88%, statements ≥ 92%.
