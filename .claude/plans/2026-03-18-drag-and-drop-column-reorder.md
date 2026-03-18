# Drag-and-Drop Column Reorder

## Goal

Replace the move left/right arrow buttons in each column header with drag-and-drop reordering using `@atlaskit/pragmatic-drag-and-drop`.

## What was implemented

### Dependencies

Added `@atlaskit/pragmatic-drag-and-drop` (~4.7kB core).

### `src/store/layoutMutations.ts`

Replaced `applyMoveLeft(d, id)` and `applyMoveRight(d, id)` with `applyReorder(d, from, to)`:

```ts
export function applyReorder(d: ColumnConfig[], from: number, to: number): void {
  const [item] = d.splice(from, 1);
  d.splice(to, 0, item!);
}
```

### `src/store/configApi.ts`

Replaced `moveLeft` / `moveRight` mutations with a single `reorder` mutation:

```ts
reorder: build.mutation<ColumnConfig[], { from: number; to: number }>({
  queryFn: ({ from, to }) => ({
    data: mutateLayout((d) => applyReorder(d, from, to)),
  }),
  invalidatesTags: ['Layout'],
}),
```

Exports updated: removed `useMoveLeftMutation` / `useMoveRightMutation`, added `useReorderMutation`.

### `src/components/App.tsx`

Removed `useMoveLeftMutation` / `useMoveRightMutation` hooks and the `onMoveLeft` / `onMoveRight` props passed to `<Board>`.

### `src/components/Board.tsx`

- Removed `onMoveLeft` / `onMoveRight` / `isFirst` / `isLast` from props
- Added `monitorForElements` effect to handle drops:

```tsx
const [reorder] = useReorderMutation();

useEffect(() => {
  return monitorForElements({
    onDrop({ source, location }) {
      const target = location.current.dropTargets[0];
      if (!target) return;
      const fromId = source.data.columnId as string;
      const toId = target.data.columnId as string;
      if (fromId === toId) return;
      const from = columns.findIndex((c) => c.id === fromId);
      const to = columns.findIndex((c) => c.id === toId);
      if (from !== -1 && to !== -1) reorder({ from, to });
    },
  });
}, [columns, reorder]);
```

Note: `columns.findIndex` is used directly (not a pre-mapped `columnIds` array) to avoid re-registering the listener on every render.

### `src/components/Column.tsx`

- Removed `onMoveLeft`, `onMoveRight`, `isFirst`, `isLast` props
- Removed move button JSX
- Added `draggable` + `dropTargetForElements` on the column `<section>`:

```tsx
const ref = useRef<HTMLElement>(null);
const [isDragging, setIsDragging] = useState(false);

useEffect(() => {
  const el = ref.current;
  if (!el) return;
  const cleanupDraggable = draggable({
    element: el,
    getInitialData: () => ({ columnId: col.id }),
    onDragStart: () => setIsDragging(true),
    onDrop: () => setIsDragging(false),
  });
  const cleanupDropTarget = dropTargetForElements({
    element: el,
    getData: () => ({ columnId: col.id }),
  });
  return () => { cleanupDraggable(); cleanupDropTarget(); };
}, [col.id]);
```

Applied `ref` to the outer `<section>` and `styles.columnDragging` when dragging.

### `src/components/Column.module.css`

- Added `cursor: grab` to `.colHeader` to signal draggability
- Added `.columnDragging { opacity: 0.5; }` for visual feedback during drag

### `src/store/configApi.test.ts`

Replaced `applyMoveLeft` / `applyMoveRight` describe blocks with `applyReorder` tests covering forward move, backward move, same-index no-op, data preservation, and no duplicate IDs.
