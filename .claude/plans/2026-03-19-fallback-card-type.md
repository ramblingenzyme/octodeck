# Fallback Card Type for Unsupported Column Data

## Context
As gh-deck adds new column types, data items that don't yet have a dedicated card component need to display something meaningful rather than crash or silently fail. A `FallbackCard` renders any item in a generic way, surfacing key fields so the UI remains functional and the gap in support is visible to the developer.

The `renderCard` switch in `Column.tsx` was exhaustive over the `ColumnType` union — adding a new type without a card caused a TypeScript error. The fallback is also wired into `useColumnData` so any new type degrades gracefully.

## What was implemented

### `src/types/index.ts`
- Added `FallbackItem` interface with `id`, `title`, `repo`, `age`, `url`, and an index signature `[key: string]: unknown` to capture arbitrary extra fields.
- Added `KnownItem = PRItem | IssueItem | CIItem | NotifItem | ActivityItem` — the union of all concrete item types.
- Added `AnyItem = KnownItem | FallbackItem` — the general item type used across the app.

### `src/components/cards/FallbackCard.tsx` (new)
Simple card using `Card` and `CardTitle` from `src/components/ui/Card.tsx`:
- Shows `repo` + `age` via `Card`
- Shows `title` as a link via `CardTitle`
- Renders a read-only monospace `<textarea>` with `JSON.stringify(item, null, 2)` so all raw fields are visible

### `src/components/cards/FallbackCard.module.css` (new)
Styles the `<textarea>`: monospace font, `max-height: 120px` with scroll, muted colour, card-matched background and border.

### `src/components/Column.tsx`
- Imported `FallbackCard` and `FallbackItem`.
- Extended `renderCard` parameter to include `FallbackItem`.
- Added `default` branch to the `renderCard` switch that renders `<FallbackCard>`.

### `src/hooks/useColumnData.ts`
- Replaced local `AnyItem` definition with imported `AnyItem` and `KnownItem` from `@/types`.
- Changed `DEMO_DATA_MAP` from `Record<...>` to `Partial<Record<...>>` so unknown types fall back to `[]` rather than causing a type error.
- Added `default` case to the live-data switch returning empty data and a noop refetch.
- Casts items to `KnownItem` when calling `matchesTokens` (which only operates on known fields).

### `src/utils/queryFilter.ts`
- Replaced local `AnyItem` type alias with imported `KnownItem` from `@/types`.
- `matchesTokens` now takes `KnownItem` — correct, since it only inspects known fields.

## Type unification
Previously `AnyItem` was defined independently in both `useColumnData.ts` and `queryFilter.ts`. Both definitions are now removed and the canonical `KnownItem` / `AnyItem` types live solely in `src/types/index.ts`.
