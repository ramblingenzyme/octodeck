# Repo Picker Suggestions — Phase 3

## Context

`RepoChipList` previously required the user to type `owner/repo` manually with no autocomplete. Phase 3 fetches the authenticated user's repositories from the GitHub API and surfaces them as a styled suggestion dropdown in the chip picker. A native `<datalist>` was considered first but cannot be styled — replaced with a `popover="manual"` dropdown using CSS anchor positioning, matching the column header menu pattern.

## What Was Built

- `GHRepo` interface (`src/types/github.ts`) — minimal type for `/user/repos` response
- `useGetUserRepos(token)` (`src/store/githubQueries.ts`) — SWR hook fetching `/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member`; returns `string[]` of `full_name` values
- `RepoChipList` updated (`src/components/ui/RepoChipList.tsx`):
  - Optional `suggestions?: string[]` prop
  - `popover="manual"` `<menu>` anchored below the chip area container via CSS anchor positioning
  - Filter state drives visible options; already-added repos excluded
  - Opens on focus and on input; closes on outside `pointerdown`, Escape (intercepted in capture phase to prevent dialog cancel), or after selecting
  - Keyboard nav: `↓` from input focuses first option; `↑`/`↓` between options; `↑` from first returns to input
  - `key={String(open)}` in `ColumnSettingsModal` ensures a fresh remount on each modal open, clearing any unsaved partial text
- `ColumnSettingsModal` updated (`src/components/ColumnSettingsModal.tsx`):
  - Fetches suggestions via `useGetUserRepos` (only when `isMultiRepo`)
  - `key={String(open)}` on `<form>` resets all uncontrolled inputs (title, query) on reopen
  - Passes suggestions to `RepoChipList`

## Files Modified

| File | Change |
|------|--------|
| `src/types/github.ts` | Added `GHRepo` interface |
| `src/store/githubQueries.ts` | Added `useGetUserRepos` |
| `src/components/ui/RepoChipList.tsx` | Suggestions prop + popover dropdown + keyboard nav |
| `src/components/ui/RepoChipList.module.css` | Added `.suggestions` + `.suggestion` styles |
| `src/components/ColumnSettingsModal.tsx` | Fetch suggestions; `key` on form and RepoChipList |

## New Tests

| File | What's covered |
|------|----------------|
| `test/components/ui/RepoChipList.test.tsx` | Chip rendering, add/remove, Enter validation, partial text not saved on remount, suggestions filtering |
| `test/components/ColumnSettingsModal.test.tsx` | Title/query show current values; unsaved edits to title and query are discarded on close + reopen |

## Key Decisions

- **`popover="manual"` not `popover="auto"`**: `auto` light-dismisses on click of the input (outside the popover), causing the dropdown to flash. `manual` requires explicit close logic but behaves correctly.
- **Escape interception in capture phase**: The `<dialog>` handles Escape natively via the `cancel` event before synthetic handlers fire. A `document.addEventListener("keydown", handler, true)` capture-phase listener intercepts Escape when the dropdown is open and stops propagation, preventing the modal from closing.
- **Anchor on `.chipArea` not `<input>`**: Anchoring to the full container aligns the dropdown with the visible field boundary, not just the text input within it.
- **`width: anchor-size(width)`**: Locks dropdown width to the anchor; content wraps (`word-break: break-word`) rather than truncating.
