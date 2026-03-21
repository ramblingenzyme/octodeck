# Uncontrolled Inputs in ColumnSettingsModal

## Context

`ColumnSettingsModal` previously used controlled inputs for `title` and `query` — each mirrored into state, synced with `col` via a `useEffect` on `open`, and read back on submit. This added unnecessary complexity: the modal is a `<dialog>` that re-renders from props on each open, so inputs can be seeded with `defaultValue` and read via `FormData` on submit. `RepoChipList`'s internal text input was also controlled despite not needing to be.

## What Was Built

- `ColumnSettingsModal` (`src/components/ColumnSettingsModal.tsx`):
  - Removed `useState` for `title` and `query`
  - Removed the `useEffect` sync for those fields (kept the one that resets `repos`)
  - `title` and `query` inputs use `defaultValue` seeded from `col`
  - Added `name="title"` and `name="query"` to inputs
  - `handleSave` reads values via `new FormData(e.currentTarget)`
  - `repos` state retained — needed to render chips dynamically

- `RepoChipList` (`src/components/ui/RepoChipList.tsx`):
  - Removed `useState` for `input` and the `onInput` handler
  - `handleKeyDown` reads `(e.target as HTMLInputElement).value` directly
  - Clears the input via `input.value = ""` after a repo is added

## Files Modified

| File | Change |
|------|--------|
| `src/components/ColumnSettingsModal.tsx` | Removed `title`/`query` state + sync effect; `defaultValue` + `FormData` on submit |
| `src/components/ui/RepoChipList.tsx` | Removed `input` state; read/clear via `e.target` |
