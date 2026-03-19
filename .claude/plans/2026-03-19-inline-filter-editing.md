# Inline Filter Editing for Columns

## Summary

Replaced the settings modal for filter editing with inline editing directly in the query bar. Clicking the query text makes it editable in-place with confirm (✓) and cancel (✕) buttons. The settings modal was removed entirely; the pencil button in the column header now triggers inline edit when no filter exists.

## Changes

### `src/components/Column.tsx`
- Added `editingQuery` and `draftQuery` state
- Added `useUpdateColumnQueryMutation` hook
- Query bar now shows inline input + confirm/cancel in edit mode, clickable text + pencil icon in view mode
- ⚙ button replaced: `onOpenSettings` now triggers inline edit (`setDraftQuery` + `setEditingQuery`)
- Query bar renders when `col.query || editingQuery` (supports adding new filter via header button)
- Removed `ColumnSettingsModal` import and render

### `src/components/ColumnHeader.tsx`
- Replaced gear button with `PencilIcon` button, hidden when `col.query` is set
- Uses `btnIconPencil` CSS class for sizing

### `src/components/ui/PencilIcon.tsx` (new)
- Shared SVG pencil icon component used in both the query bar and column header

### `src/components/Column.module.css`
- `.colQueryText` — `cursor: default`, underline + color on hover
- `.colQueryPencil` — fades in on hover (`opacity: 0` → `0.8`), `1.1em` size
- `.colQueryInput` — transparent, borderless, monospace, accent-color focus outline
- `.colQueryConfirm` / `.colQueryCancel` — small inline action buttons
- `.btnIconPencil` — `0.8em` size for header usage

## Behaviour

- Clicking query text or the header pencil button enters edit mode
- Enter or ✓ confirms and calls `updateColumnQuery` mutation
- Escape or ✕ cancels with no mutation
- Clearing the input and confirming removes the filter
- Columns without a filter show the pencil in the header to add one
