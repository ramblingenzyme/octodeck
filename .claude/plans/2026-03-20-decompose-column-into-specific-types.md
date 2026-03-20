# Decompose Column into Specific Column Types

## Context

`Column.tsx` handled all 5 column types (`prs`, `issues`, `ci`, `notifications`, `activity`) in a single component, switching on `col.type` via `renderCard()`. Decomposing into type-specific components makes them easier to extend independently.

## Approach

Extracted shared logic into a `BaseColumn` component, then created thin type-specific wrappers that compose it. `Column.tsx` became a dispatcher. `Board.tsx` needed no changes.

## Files Created/Modified

- **Created** `src/components/BaseColumn.tsx` — shared column logic with `renderCard: (item: AnyItem) => ReactNode` render prop; contains drag-drop, refresh spinner, confirmation, minute ticker, loading/error states, query editor
- **Created** `src/components/columns/PRColumn.tsx`
- **Created** `src/components/columns/IssueColumn.tsx`
- **Created** `src/components/columns/CIColumn.tsx`
- **Created** `src/components/columns/NotifColumn.tsx`
- **Created** `src/components/columns/ActivityColumn.tsx`
- **Modified** `src/components/Column.tsx` — replaced implementation with dispatcher switch on `col.type`

## Also Fixed (discovered during implementation)

The "Add filter" button in column headers was a no-op (`onOpenSettings={() => {}`). Fixed by:

- Adding `queryOpen` local state in `BaseColumn`; button sets it `true`
- Rendering `InlineEdit` when `col.query != null || queryOpen`
- Adding `initialEditing` prop to `InlineEdit` so the field opens directly in edit mode
- Adding `onCancel` prop to `InlineEdit` so cancelling clears `queryOpen` and hides the field

## Structure

```
Column.tsx (dispatcher — switches on col.type)
├── columns/PRColumn.tsx       → BaseColumn + PRCard
├── columns/IssueColumn.tsx    → BaseColumn + IssueCard
├── columns/CIColumn.tsx       → BaseColumn + CICard
├── columns/NotifColumn.tsx    → BaseColumn + NotifCard
└── columns/ActivityColumn.tsx → BaseColumn + ActivityCard
```
