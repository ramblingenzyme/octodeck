# Repo Chip Picker in Column Settings Modal (Phase 2 of 3)

## Context

CI, Releases, Deployments, and Security columns make parallel API requests per repo. Previously, users had to type `repo:owner/repo` tokens into the filter query manually — opaque and error-prone. This plan adds a visual chip-based repo picker to the Column Settings modal for those column types, backed by a dedicated `repos` field on `ColumnConfig` rather than encoding repos in the query string.

## What Was Built

- `repos?: string[]` added to `ColumnConfig` in `src/types/index.ts` — repos stored as first-class data, not embedded in `query`
- `applyUpdateRepos` mutation in `src/store/layoutMutations.ts`
- `updateColumnRepos` action in `src/store/layoutStore.ts`
- `loadLayout` in `src/store/layoutStorage.ts` — removed the old migration that had converted a `repos` field to query string tokens; repos now pass through as-is
- `MULTI_REPO_COLUMN_TYPES = new Set(['ci', 'releases', 'deployments', 'security'])` in `src/constants/index.ts`
- `RepoChipList` component (`src/components/ui/RepoChipList.tsx` + `RepoChipList.module.css`):
  - Chips and input share a single field-style container (matching `fieldInput` in `Modal.module.css`)
  - Input validates that input contains `/` before accepting Enter; placeholder adapts to "Add another…" once repos exist
  - × remove button turns red (`var(--accent-issues)`) with a tinted background on hover
- `ColumnSettingsModal` updated to show `RepoChipList` above Filter Query for multi-repo types; reads/writes `col.repos` directly; `query` field shows/edits only non-repo filter tokens
- `useColumnData` updated to use `col.repos ?? []` directly instead of parsing `repo:` tokens from the query string

## Files Modified

| File | Change |
|------|--------|
| `src/types/index.ts` | Added `repos?: string[]` to `ColumnConfig` |
| `src/constants/index.ts` | Added `MULTI_REPO_COLUMN_TYPES` |
| `src/store/layoutMutations.ts` | Added `applyUpdateRepos` |
| `src/store/layoutStore.ts` | Added `updateColumnRepos` action |
| `src/store/layoutStorage.ts` | Removed old `repos → query` migration |
| `src/hooks/useColumnData.ts` | Use `col.repos ?? []` directly |
| `src/components/ColumnSettingsModal.tsx` | Conditional `RepoChipList`; reads/writes `col.repos` |
| `test/store/layoutStorage.test.ts` | Updated migration test to reflect `repos` passthrough |

## New Files

| File | Purpose |
|------|---------|
| `src/components/ui/RepoChipList.tsx` | Chip list + add-repo input |
| `src/components/ui/RepoChipList.module.css` | Chip and input styles |
