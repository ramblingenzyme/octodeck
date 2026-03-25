# Context

A nitpicky review of the codebase found several small but real issues: dead CSS classes, a design token used inconsistently, an interface duplicated six times, and unnecessary CSS fallback values. The goal is to tighten the codebase without changing behavior.

---

# Changes

## 1. Remove dead `.cardIcon` CSS class

**File**: `src/components/cards/CardParts.module.css` (lines 31–34)

The `CardTypeIcon` component that used this class was already removed from `CardParts.tsx`. The orphaned CSS class remains.

Remove:

```css
.cardIcon {
  color: var(--text-muted);
  flex-shrink: 0;
}
```

---

## 2. Remove dead `.cardBadge` CSS class

**File**: `src/components/ui/Card.module.css` (lines 65–80)

Grep confirms `.cardBadge` is never referenced outside this file — not imported, not used in any JSX.

Remove:

```css
.cardBadge {
  font-size: var(--text-md);
  padding-left: 6px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.03em;
  font-family: var(--font-mono);
  white-space: nowrap;
  flex-shrink: 0;
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 2px;
}
```

---

## 3. Use design token in `::selection` rule

**File**: `src/globals.css` (line 42)

The `::selection` rule hardcodes `oklch(0.7 0.16 265 / 0.35)`, which is the same value as `--accent-ui` but with added alpha. The correct approach per the project's CSS philosophy (CLAUDE.md: use relative OKLCH color syntax with alpha) is:

Change:

```css
background-color: oklch(0.7 0.16 265 / 0.35);
```

To:

```css
background-color: oklch(from var(--accent-ui) l c h / 0.35);
```

---

## 4. Deduplicate `ColumnProps` interface

**Files**: All 6 column components define the same interface locally:

```typescript
interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}
```

Export this once from `BaseColumn.tsx` (where `BaseColumnProps` already lives), and import it in each column file. No new file needed — it's a natural addition to the module that defines `BaseColumn`.

Files to update:

- `src/components/BaseColumn.tsx` — add `export interface ColumnProps { col: ColumnConfig; onRemove: (id: string) => void; }`
- `src/components/columns/PRColumn.tsx`
- `src/components/columns/IssueColumn.tsx`
- `src/components/columns/CIColumn.tsx`
- `src/components/columns/ActivityColumn.tsx`
- `src/components/columns/ReleasesColumn.tsx`
- `src/components/columns/DeploymentsColumn.tsx`

Each column: remove local `ColumnProps` definition, add `import type { ColumnProps } from '../BaseColumn';`.

---

## 5. Remove unnecessary CSS fallback values

**File**: `src/components/cards/FallbackCard.module.css`

`--font-mono` and `--radius-sm` are always defined in `globals.css`. The fallback values (`monospace`, `3px`) are dead code:

- Line 4: `var(--font-mono, monospace)` → `var(--font-mono)`
- Line 9: `var(--radius-sm, 3px)` → `var(--radius-sm)`

---

# Verification

- `npm run build` — TypeScript must pass; removing unused CSS and deduplicating the interface shouldn't affect type checking
- `npm test` — no test changes expected since these are all structural/CSS fixes
- Visual inspection — selection highlight, card borders, and fallback card appearance unchanged
