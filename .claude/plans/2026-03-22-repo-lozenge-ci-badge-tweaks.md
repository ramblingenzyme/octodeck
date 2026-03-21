# Repo Lozenge & CI Badge Tweaks

## Context

Follow-up polish to the Phase 3 repo picker work and existing CI card styling.

1. **Repo lozenge tooltip** — the tooltip was rendering off the right edge of the column, items had no visual separation, and the bullet-prefix approach was wrong.
2. **CI badge** — the PASS/FAIL badge was wrapping onto a second line and vertically centered against the wrapped meta text rather than pinned to the bottom.

## What Was Built

### Tooltip alignment (`src/components/ui/Tooltip.tsx` + `Tooltip.module.css`)

- Added `align?: "center" | "end"` prop (default `"center"`)
- `align="end"` applies `.end` CSS class: `right: anchor(right)` with no horizontal translate, keeping the tooltip inside the column boundary
- Changed `text` prop type from `string` to `ReactNode` — enables structured content (lists, etc.) without a separate component
- Removed `wrapText` prop (was a string-only workaround, no longer needed)

### Repo lozenge tooltip content (`src/components/BaseColumn.tsx`)

- Passes a `<ul>` of `<li>` elements as `text` rather than a newline-joined string
- Items separated by `--border-ghost` bottom border using `:not(:last-child)`
- Padding applied with `:not(:first-child)` / `:not(:last-child)` rather than resetting from a base value

### `--border-ghost` token (`src/globals.css`)

- Added `--border-ghost: #3a3a52` — extends the border scale (structural → card → mid → ghost) to match the existing text scale (primary → secondary → muted → ghost)

### Repo list styles (`src/components/BaseColumn.module.css`)

```css
.repoList {
  list-style: none;
  white-space: nowrap;

  li {
    &:not(:first-child) { padding-top: 4px; }
    &:not(:last-child) {
      padding-bottom: 4px;
      border-bottom: 1px solid var(--border-ghost);
    }
  }
}
```

### CI badge (`src/components/cards/CICard.module.css` + `Card.module.css`)

- Added `white-space: nowrap` and `flex-shrink: 0` to `.ciBadge` — badge never breaks across lines
- Changed `.cardMeta` `align-items` from `center` to `flex-end` — badge (and all meta-row trailing elements) align to the bottom of the row when left-side text wraps

## Files Modified

| File | Change |
|------|--------|
| `src/components/ui/Tooltip.tsx` | `text: ReactNode`; `align` prop; removed `wrapText` |
| `src/components/ui/Tooltip.module.css` | Added `.end` class; removed `.wrapText` |
| `src/components/BaseColumn.tsx` | Repo lozenge passes `<ul>` JSX; `align="end"` on Tooltip |
| `src/components/BaseColumn.module.css` | Added `.repoList` styles; `--border-ghost` used for dividers |
| `src/globals.css` | Added `--border-ghost: #3a3a52` |
| `src/components/cards/Card.module.css` | `.cardMeta` → `align-items: flex-end` |
| `src/components/cards/CICard.module.css` | `.ciBadge` → `white-space: nowrap; flex-shrink: 0` |
