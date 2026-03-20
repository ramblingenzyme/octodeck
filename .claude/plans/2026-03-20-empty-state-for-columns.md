# Empty State for Columns

## Context

Columns currently show a loading skeleton and an error state, but nothing when `data` is empty. Users see a blank body with no feedback, which is confusing.

## Approach

Add an inline empty state directly in `BaseColumn.tsx` — no new component file needed. Style it in the existing `Column.module.css` alongside `.errorState`.

### BaseColumn.tsx (`src/components/BaseColumn.tsx`)

Add one conditional block after the error check:

```tsx
{!isLoading && !error && data.length === 0 && (
  <p className={styles.emptyState}>No results</p>
)}
```

Guard the existing `data.map` line:

```tsx
{!isLoading && !error && data.length > 0 && data.map((item) => renderCard(item))}
```

### Column.module.css (`src/components/Column.module.css`)

Added after `.errorState`:

```css
.emptyState {
  padding: 12px;
  font-size: var(--text-md);
  color: var(--text-ghost);
  text-align: center;
  margin: 0;
}
```

## Files modified

- `src/components/BaseColumn.tsx`
- `src/components/Column.module.css`

## Status

Implemented.
