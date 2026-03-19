# Plan: Code Quality & Single-Responsibility Refactor

## Context
A review of the gh-deck codebase identified 10 issues across components, hooks, state management, and utilities. These range from dead code and duplicate files to monolithic components and type-safety bugs. This plan addresses all issues in a logical sequence — low-risk removals first, then hook extraction, then component decomposition.

---

## Issues & Changes

### 1. Delete dead/duplicate files
**Files to delete:**
- `src/components/Icon.tsx` — identical to `src/components/ui/Icon.tsx`; no imports point to it
- `src/components/Icon.module.css` — companion CSS for the above
- `src/hooks/useEscapeKey.ts` — defined but never imported anywhere

**Action:** Delete all three files.

---

### 2. Move mock data out of `src/`
**File:** `src/data/mock.ts`

Move to `src/test/fixtures/mock.ts`. Update the two import sites:
- `src/hooks/useColumnData.ts` line 3
- Any test files that import from `@/data/mock`

**Action:** Move file, update imports.

---

### 3. Fix `saveLayout` missing error handling
**File:** `src/store/layoutStorage.ts`

`loadLayout` has a try-catch; `saveLayout` does not. A `QuotaExceededError` would crash silently.

**Action:** Wrap `localStorage.setItem` in a try-catch (log or swallow the error).

---

### 4. Fix side effect in Redux reducer
**File:** `src/store/authSlice.ts`

`tokenReceived` calls `saveToken()` and `logOut` calls `clearToken()` directly inside Immer reducers. Side effects in reducers violate Redux principles and make testing harder.

**Action:** Add an RTK `listenerMiddleware` in `src/store/index.ts` that listens for `tokenReceived` and `logOut` actions, then calls the storage functions. Remove the calls from the reducers.

---

### 5. Fix unsafe type cast in `matchesTokens`
**File:** `src/hooks/useColumnData.ts`

```ts
case "author":
  return "author" in item && (item as PRItem).author.toLowerCase() === value;
```
Investigation showed `PRItem.author` is the correct field name — no change needed.

---

### 6. Extract `parseQuery` and `matchesTokens` from `useColumnData`
**File:** `src/hooks/useColumnData.ts`

These two pure functions have no hook dependencies. Extract to `src/utils/queryFilter.ts` and export them. Update `useColumnData.ts` to import from there.

**Benefit:** Independently testable, reduces hook file to ~80 lines.

---

### 7. Decompose `Column.tsx`
**File:** `src/components/Column.tsx` (211 lines → ~130 lines)

Extracted into three focused pieces:

**a) `src/components/ColumnHeader.tsx`**
Contains: drag handle, icon, title, badge, controls (refresh/settings/remove buttons), last-updated tooltip.

**b) `src/components/ColumnConfirmDelete.tsx`**
Contains: the confirmation banner.

**c) `Column.tsx` as orchestrator**
Retains: drag-drop `useEffect`, state declarations, `useColumnData` call, card rendering switch, layout of header/body/confirm/settings modal.

---

## File Inventory

| File | Action |
|---|---|
| `src/components/Icon.tsx` | Deleted |
| `src/components/Icon.module.css` | Deleted |
| `src/hooks/useEscapeKey.ts` | Deleted |
| `src/data/mock.ts` | Moved → `src/test/fixtures/mock.ts` |
| `src/store/layoutStorage.ts` | Added try-catch to `saveLayout` |
| `src/store/authSlice.ts` | Removed storage side effects from reducers |
| `src/store/index.ts` | Added `listenerMiddleware` for auth persistence |
| `src/hooks/useColumnData.ts` | Removed `parseQuery`/`matchesTokens`; updated import |
| `src/utils/queryFilter.ts` | New: `parseQuery` + `matchesTokens` |
| `src/components/Column.tsx` | Reduced to orchestrator (~130 lines) |
| `src/components/ColumnHeader.tsx` | New: column header UI |
| `src/components/ColumnConfirmDelete.tsx` | New: deletion confirmation banner |

## Status: COMPLETE (2026-03-19)
All 68 tests pass.
