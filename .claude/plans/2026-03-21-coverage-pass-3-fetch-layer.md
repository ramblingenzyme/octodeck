# Coverage Pass 3: Fetch Layer + Data Pipeline

## Context

The project had 190 tests (~86% overall coverage) after the first two coverage passes. All the
"easy wins" were done. This pass targets the remaining logic-rich files that have real bugs to
catch — particularly the HTTP/fetch layer (`githubClient`, `deviceFlow`) and the data
query/transform pipeline (`githubQueries`). A tiny utility hook (`useMinuteTicker`) rounds things
out as a quick win.

Deferred (still too costly vs. value): `useColumnDragDrop` (heavy DOM API mocking),
`useColumnData` (SWR + store coupling), `Board.tsx` drag monitor (DOM events).

---

## Scope

### 1. `src/store/githubClient.test.ts` (new)
The foundation of every GitHub API call — 16 lines, 0% coverage. Three real branches to hit.

Mock strategy: `vi.stubGlobal('fetch', vi.fn())`.

Test cases:
- **Success**: fetch resolves with ok=true → returns parsed JSON
- **Non-200 error**: `res.ok = false`, status=404, statusText="Not Found" → throws `Error("GitHub API error: 404 Not Found")`
- **AbortSignal forwarded**: pass an AbortSignal → it appears in the `fetch` call's init options

### 2. `src/auth/deviceFlow.test.ts` (new)
The polling state machine has real branching logic across 82 lines (0% coverage). All paths are
reachable via mocked fetch — no MSW needed.

Mock strategy: `vi.stubGlobal('fetch', ...)` to return controlled responses.

**requestDeviceCode tests:**
- **Success**: fetch resolves ok=true → returns device code fields
- **HTTP error**: fetch resolves ok=false (500) → throws with status message
- **Network error**: fetch rejects → error propagates

**pollForToken tests (the complex state machine):**
- **authorization_pending** → retries (loop continues without throwing)
- **slow_down** → `currentInterval` increments by 5000ms and loop continues
- **expired_token** → throws `"Device code expired. Please try again."`
- **access_denied** → throws `"Access denied by user."`
- **unknown error** → throws with `error_description` or `error` field
- **access_token present** → resolves with the token string
- **AbortSignal abort mid-wait** → throws DOMException("AbortError")

Implementation note: `pollForToken` uses `setTimeout` internally. Use `vi.useFakeTimers()` +
`vi.runAllTimers()` / `vi.runAllTimersAsync()` to advance through the wait.

### 3. `src/store/githubQueries.test.ts` (new)
24% coverage (lines 84-99, 110-113 uncovered). The six SWR hooks wrap inline async fetchers
containing real logic (slice, flat, sort, flatMap with null-filter).

Mock strategy: capture the SWR key and fetcher without running SWR itself, then invoke the
fetcher directly with mocked `githubFetch`.

```ts
vi.mock('./githubClient', () => ({ githubFetch: vi.fn() }));
vi.mock('swr', () => ({
  default: vi.fn((key, fetcher) => {
    capturedKey = key;
    capturedFetcher = fetcher;
    return {};
  }),
}));
```

Test cases per hook:
- **useGetUser**: token=null → key is null; token present → fetcher maps login/avatarUrl/name
- **useGetPRs**: token=null → key is null; token present → fetcher encodes query, maps items via `mapSearchItemToPR`
- **useGetIssues**: same pattern as PRs
- **useGetNotifications**: token=null → key is null; token present → fetcher maps via `mapNotification`
- **useGetCIRuns**: token=null OR repos=[] → key is null; repos.slice(0,5) caps at 5 repos; per-repo error is isolated (catch returns []); results are flattened, sorted by age, sliced to 20
- **useGetActivity**: token=null OR login="" → key is null; fetcher flatMaps events through `mapEvent`, filtering out nulls

### 4. `src/hooks/useMinuteTicker.test.ts` (new)
71% coverage — the setInterval callback and cleanup aren't exercised.

Mock strategy: `vi.useFakeTimers()`.

Test cases:
- **Forces re-render after 60s**: use `renderHook`, advancing 60_000ms triggers a state update (re-render)
- **Cleanup on unmount**: unmount while timer is running → `vi.runAllTimers()` afterwards does NOT cause errors

---

## Files Created
- `src/store/githubClient.test.ts`
- `src/auth/deviceFlow.test.ts`
- `src/store/githubQueries.test.ts`
- `src/hooks/useMinuteTicker.test.ts`

## Key patterns used
- `vi.stubGlobal('fetch', vi.fn())` — fetch mocking (no MSW needed)
- `vi.useFakeTimers()` / `vi.runAllTimers()` / `vi.runAllTimersAsync()` — advance setTimeout loop
- `vi.mock('swr', ...)` — capture key/fetcher args to test inline SWR fetchers
- `renderHook` + `act` from `@testing-library/preact`
- Existing mapper fixtures (`GHSearchItem`, `GHNotification`, etc.) from `githubMappers.test.ts`

## Result
- Test count: 190 → 222
- `githubClient.ts` → 100% coverage
- `deviceFlow.ts` → ~90% coverage (all state machine branches)
- `githubQueries.ts` → 100% statement, 86% branch coverage
- `useMinuteTicker.ts` → 100% coverage
