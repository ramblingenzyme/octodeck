# Context

The filter/query system was refactored to be fully declarative (`FilterMap<T>` with `description` fields, `COLUMN_FILTERS` export) in anticipation of exposing filter documentation in the product. This plan implements that documentation as a `?` help button that opens a popover next to each filter input.

## Changes made

### `src/utils/queryFilter.ts`

- `FilterMap<T>` became a discriminated union: `ServerFilteredMap | ClientFilterMap<T>`
  - `ServerFilteredMap`: only `name` and `serverFiltered` (a `ServerFilteredInfo` with `docsUrl` and `examples`)
  - `ClientFilterMap<T>`: `name`, `filters`, `textSearchFields`, `textSearch`
- Added `ServerFilteredMap` and `ClientFilterMap<T>` as named exported types
- Added `ServerFilteredInfo` type for the docs/examples payload
- Added `textSearchFields: readonly string[]` to `ClientFilterMap` (parallel to `textSearch` fn, for documentation)
- Added `name: string` to all filter maps
- Added `PR_FILTERS` and `ISSUE_FILTERS` as server-filtered stubs (pointing at `GITHUB_SEARCH_INFO`)
- `COLUMN_FILTERS` now covers all 6 `ColumnType` values, keyed by the exact `ColumnType` string
- `applyFilters` and `splitTokens` now take `ClientFilterMap<T>` (not the wider union)

### `src/store/githubQueries.ts`

- `buildParams` now skips negated tokens (`negate: true`) — previously they were silently applied forwards, which is incorrect since GitHub API params have no negation syntax

### `src/hooks/useColumnData.ts`

- Added `negatedApiFilterWarning(type, tokens)` helper: detects tokens that are negated and server-scoped for the column type, returns a warning string
- `ci`, `releases`, `deployments` results are wrapped with `withWarning()` to prepend the warning when present

### `src/components/ui/FilterHelpPopover.tsx` (new)

- `FilterHelpPopover` — trigger button + `popover="auto"` panel, driven by `COLUMN_FILTERS[columnType]`
- Uses CSS anchor positioning (same pattern as `Tooltip.tsx`) to attach the panel to the button
- Branches on `"serverFiltered" in filterMap`:
  - **`ServerFilteredContent`** — shows examples list + negation note + docs link on separate lines
  - **`ClientFilterContent`** — shows API filters section, local filters section, text search note, negation note (with caveat about API filters when both scopes present)
- Placed in three locations: `BaseColumn.tsx` (inline filter row), `AddColumnModal.tsx`, `ColumnSettingsModal.tsx`

### `src/components/ui/FilterHelpPopover.module.css` (new)

- Styles for trigger button (small circle `?`), popover panel, section headers, filter key/desc rows, footer notes, docs link
- `section + section` sibling selector for consistent gap between filter groups
