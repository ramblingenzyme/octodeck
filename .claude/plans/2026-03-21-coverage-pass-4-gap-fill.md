# Coverage Pass 4: Fill Gaps in Existing Files

## Context

Pass 3 brought coverage to 88.5% overall (222 tests). All 0%-coverage files are now covered.
The remaining gaps are missed branches and uncalled methods spread across existing files — no new
source files, just tests that were never written. This pass fills those gaps without touching the
deferred high-cost files (`useColumnDragDrop`, `useColumnData`, `Board.tsx` drag monitor).

---

## Scope

### 1. Extend `src/store/githubMappers.test.ts`
**Gap:** `mapEvent` — `CreateEvent` with `ref_type !== "branch"` falls through to `return null`
(line 211), never exercised. Branch coverage is 76.38%.

Add inside the existing `describe("mapEvent")` block:
- `CreateEvent` with `ref_type: "tag"` → returns `null`

### 2. Extend `src/store/githubQueries.test.ts`
**Gap:** `useGetCIRuns` fetcher — `data.workflow_runs ?? []` null-coalescing branch (lines 91-98)
is only exercised when `workflow_runs` is present. Branch coverage is 86.36%.

Add inside existing `describe("useGetCIRuns")`:
- API returns `{ workflow_runs: null }` → result is `[]`
- API returns `{}` (missing property) → result is `[]`

### 3. New `src/store/layoutStore.test.ts`
**Gap:** `reorder()` method (line 30) is never called in any test. All other store methods
(`addColumn`, `removeColumn`, `updateColumnQuery`) are exercised by e2e tests.

Test by calling `useLayoutStore.getState().reorder(from, to)` directly. Reset store state and
clear localStorage in `beforeEach`.

Test cases:
- `reorder(0, 1)` moves the first column to index 1 and vice versa
- Persists the reordered layout to localStorage (verified via `loadLayout()`)

### 4. New `src/hooks/useConfirmation.test.ts`
**Gap:** `cancelConfirm()` (line 8) is never called — only `startConfirm` is exercised
indirectly via the Column removal e2e tests.

Use `renderHook` + `act` from `@testing-library/preact`.

Test cases:
- Initial state: `isConfirming` is `false`
- After `startConfirm()`: `isConfirming` is `true`
- After `startConfirm()` then `cancelConfirm()`: `isConfirming` is `false`

### 5. New `src/components/ui/Modal.test.tsx`
**Gap:** `preventCancel` branch (line 37) — when `true`, `onCancel` handler calls
`e.preventDefault()` only (does not call `onClose`). Never exercised by existing e2e tests.

Note: `showModal()` is not implemented in happy-dom; stub it with `vi.fn()` in `beforeEach`.

Test cases:
- Without `preventCancel`: firing a `cancel` event on the dialog calls `onClose`
- With `preventCancel={true}`: firing a `cancel` event does NOT call `onClose`

### 6. New `src/components/ui/Icon.test.tsx`
**Gap:** `Icon` is 0% covered. Has a real conditional branch: `className ? ` ${className}` : ""`.

Test cases:
- Renders children inside a `<span>` with `aria-hidden="true"`
- Without `className`: no extra text appended to the span's class
- With `className="extra"`: that class appears on the span

### 7. New `src/components/ui/icons/icons.test.tsx`
**Gap:** `GitBranchIcon`, `GitForkIcon`, `StarIcon` are at 50% — never rendered in any test.
All three follow the same pattern: optional `className` prop forwarded to `<svg aria-hidden="true">`.
Grouped into one file to avoid test sprawl.

Test cases per icon (× 3):
- Renders an `<svg>` element
- SVG has `aria-hidden="true"`
- With `className="w-4"`: SVG element has that class

---

## Files Modified
- `src/store/githubMappers.test.ts` — +1 test in existing `describe("mapEvent")`
- `src/store/githubQueries.test.ts` — +2 tests in existing `describe("useGetCIRuns")`

## Files Created
- `src/store/layoutStore.test.ts`
- `src/hooks/useConfirmation.test.ts`
- `src/components/ui/Modal.test.tsx`
- `src/components/ui/Icon.test.tsx`
- `src/components/ui/icons/icons.test.tsx`

## Key patterns used
- `renderHook` + `act` from `@testing-library/preact`
- `useLayoutStore.setState(...)` + `localStorage.clear()` in `beforeEach`
- `loadLayout()` to verify persistence after store mutations
- Captured-fetcher pattern (established in Pass 3's `githubQueries.test.ts`)

## Deferred (still too costly vs. value)
- `Icon.tsx`, `GitBranchIcon/GitForkIcon/StarIcon` SVG wrappers — included anyway; no real logic
  but untested code is untested code
- `useColumnDragDrop.ts` — requires full HTML Drag-and-Drop API simulation (not supported by happy-dom)
- `useColumnData.ts` — SWR + store coupling makes meaningful unit tests integration-level
- `Board.tsx` drag monitor — same DnD simulation problem

## Result
- Test count: 222 → 245
- `githubMappers.ts` branch coverage → ≥90%
- `githubQueries.ts` branch coverage → ≥95%
- `layoutStore.ts` → 100%
- `useConfirmation.ts` → 100%
- `Modal.tsx` branch coverage → 100%
- `Icon.tsx` → 100%
- `GitBranchIcon`, `GitForkIcon`, `StarIcon` → 100%
