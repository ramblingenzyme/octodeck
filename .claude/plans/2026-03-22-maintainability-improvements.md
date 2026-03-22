# Maintainability Improvements

## Context

A review of the codebase identified several issues adding ongoing cost for readers: dead code
from a past refactor, a switch with no exhaustive guard, unexplained non-obvious logic, an
icon file in the wrong directory, CSS module ownership that was unclear, and small type-safety
gaps. All changes were low-risk and non-functional.

---

## Files modified

### Dead code removed
- `src/components/cards/CommentIcon.tsx` — deleted (never imported; canonical icon is `ui/icons/CommentIcon.tsx`)
- `src/components/cards/CommentIcon.module.css` — deleted

### Exhaustive switch guard
- `src/components/Column.tsx` — added `default: col.type satisfies never; return null;` to the
  `col.type` switch so adding a new `ColumnType` without handling it here is a compile error

### Comments added
- `src/hooks/useColumnData.ts` — comment above the block of `useGet*` calls explaining why all
  hooks are called unconditionally (rules of hooks; SWR skips fetching when token is `null`)
- `src/hooks/useColumnData.ts` — comment above `shouldFilter` explaining that prs/issues use
  GitHub Search API (server-side filtering), while all other types need client-side filtering

### Icon file relocated
- `src/components/ui/PencilIcon.tsx` → `src/components/ui/icons/PencilIcon.tsx`
- `src/components/ui/InlineEdit.tsx` — import updated to `./icons/PencilIcon`

### Tooltip `any` cast removed
- `src/components/ui/Tooltip.tsx` — removed `as any` casts on `showPopover`/`hidePopover`;
  TypeScript's DOM lib already types these on `HTMLElement`, so direct calls work

### Warning dismissal reset
- `src/components/BaseColumn.tsx` — added `useEffect` that resets `warnDismissed` whenever
  the `warnings` array content changes, so new or different fetch errors always surface

### CSS module split
`src/components/cards/Card.module.css` was shared across the entire card family but named as
if it belonged to `Card.tsx` (which lives in `ui/`, not `cards/`). Split into two files that
each sit next to the component they serve:

- **`src/components/ui/Card.module.css`** (new) — base card structure: `.card`, `.cardTitle`,
  `.cardFooter`, `.cardAuthor`, `.cardStats`, `.cardBadge`
- **`src/components/cards/CardParts.module.css`** (new) — `CardParts`-only styles: `.cardRepo`,
  `.cardStat`, `.cardStatApproved`, `.cardStatPending`, `.cardIcon`

Import updates:
- `src/components/ui/Card.tsx` — `./Card.module.css`
- `src/components/cards/CardParts.tsx` — `./CardParts.module.css`
- `src/components/cards/PRCard.tsx` — `../ui/Card.module.css`
- `src/components/cards/IssueCard.tsx` — `../ui/Card.module.css`
- `src/components/cards/DeploymentCard.tsx` — `../ui/Card.module.css`
- `src/components/cards/ReleaseCard.tsx` — `../ui/Card.module.css`
- `src/components/cards/DeploymentCard.module.css` — `composes` path updated to `../ui/Card.module.css`
- `src/components/cards/ReleaseCard.module.css` — `composes` path updated to `../ui/Card.module.css`
- `src/components/cards/SecurityCard.module.css` — `composes` path updated to `../ui/Card.module.css`

---

## Verification

- `npm run build` — passes, no TypeScript errors
- `npm test` — 282 tests pass across 30 test files
