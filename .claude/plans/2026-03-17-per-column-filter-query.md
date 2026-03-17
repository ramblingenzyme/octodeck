# Plan: Per-Column Filter Query

## Context

gh-deck columns previously had no filtering capability (except a `repos` field on CI columns). Users needed a way to filter column items. Rather than building a structured filter UI per column type, we adopted a single freeform GitHub-style query string (e.g. `repo:owner/repo label:bug is:open`) — familiar to GitHub users and directly compatible with the GitHub search API for future use.

---

## Implemented changes

### `src/types/index.ts`
- Removed `repos?: string[]` from `ColumnConfig`
- Added `query?: string` to `ColumnConfig`

### `src/store/layoutStorage.ts`
- Added migration in `loadLayout`: old `repos` arrays are converted to `repo:owner/name` tokens on first load

### `src/store/configApi.ts`
- Updated `addColumn` to accept `query?: string` instead of `repos?: string[]`
- Added `updateColumnQuery` mutation: `{ id: string; query: string }` — updates in-place in localStorage
- Exported `useUpdateColumnQueryMutation`

### `src/hooks/useColumnData.ts`
- Added `parseQuery` — parses a query string into `{ key, value }[]` tokens
- Added `matchesTokens` — filters any item against pre-parsed tokens
- Supported tokens: `repo:`, `author:`, `assignee:`, `label:`, `is:draft/open/closed`, `status:`, `branch:`, bare text search
- `parseQuery` runs once via `useMemo` keyed on `col.query`; repos extracted from tokens (no regex)
- `filter()` short-circuits when no tokens are present

### `src/utils/getItemDisplayText.ts` (new)
- Utility extracting primary display text from any item type (title / name / text)
- Used by `matchesTokens` for bare-term search

### `src/hooks/useEscapeKey.ts` (new)
- Extracted shared Escape key `useEffect` pattern used across modals

### `src/components/AddColumnModal.tsx`
- Replaced CI-only repos textarea with a single "Filter Query" text input for all column types
- `onAdd` signature updated to `(type, title, query?)`
- Uses `useEscapeKey`

### `src/components/ColumnSettingsModal.tsx` (new)
- Modal for editing a column's filter query post-creation
- Pre-populated with current query; Save / Cancel / Clear
- Clear button is styled as danger and requires inline confirmation (shown below the footer)
- Escape cancels the clear confirmation before closing the modal
- Uses `useEscapeKey`

### `src/components/Column.tsx`
- Added gear (⚙) button in column header; highlighted (`btnIconActive`) when a query is active
- Query displayed as a slim read-only banner below the header with an "edit" shortcut
- Clicking gear or "edit" opens `ColumnSettingsModal`

### `src/components/App.tsx`
- Updated `handleAddColumn` to forward `query` to `addColumn` mutation

### CSS
- `Column.module.css`: added `.btnIconActive`, `.colQuery`, `.colQueryText`, `.colQueryEdit`
- `AddColumnModal.module.css`: added `.btnModalDanger`, `.clearConfirm`, `.clearConfirmText`, `.clearConfirmButtons`

---

## Decisions

- **Freeform query over structured filters**: avoids per-type UI complexity, maps directly to GitHub search syntax, forward-compatible with real API calls
- **Client-side filtering on mock data**: filters applied in `useColumnData` against mock arrays; when real API is wired up, the query string can be forwarded directly to the GitHub search API
- **Clear confirmation inline below footer**: more discoverable than a separate confirmation modal; Escape dismisses it without closing the main modal
