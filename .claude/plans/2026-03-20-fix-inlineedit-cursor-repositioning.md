# Fix InlineEdit Cursor Repositioning — Draggable Interference

## Context
Clicking inside the InlineEdit textarea to reposition the cursor didn't work. The root cause: pragmatic-drag-and-drop's `draggable()` permanently sets `draggable="true"` on the Column's `<section>` element. When the browser sees a `mousedown` inside a `draggable="true"` element, it suppresses normal cursor positioning because it's preparing for a potential drag. Even though the library cancels the drag on `dragstart` (when the click wasn't on the handle), cursor positioning was already suppressed at `mousedown` time.

## Fix

### `src/hooks/useColumnDragDrop.ts`

After `draggable()` setup, immediately remove the `draggable` attribute from the section. Then only enable it during drag-handle interaction via `pointerdown`/`pointerup` listeners on the handle.

Event sequence for **drag** (handle click):
1. `pointerdown` on handle → `el.draggable = true`
2. User moves mouse → `dragstart` fires on section → drag proceeds normally
3. `pointerup` → `el.draggable = false`

Event sequence for **textarea click**:
1. `pointerdown` on textarea → no handler, `draggable` stays off
2. `mousedown` → browser sees no `draggable` ancestor → cursor positioned normally

## Status
Implemented and verified. All 122 tests pass.
