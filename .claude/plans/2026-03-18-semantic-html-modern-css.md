# Semantic HTML & Modern CSS Improvements

## Context
The codebase uses `<div role="dialog">` instead of native `<dialog>`, generic containers where semantic elements fit better, hardcoded color values that duplicate existing tokens, and per-component styles that belong in the global reset. This pass improves accessibility, semantics, and CSS consistency.

---

## 1. Native `<dialog>` for all three modals

**Files:** `AddColumnModal.tsx`, `ColumnSettingsModal.tsx`, `AuthModal.tsx`
**CSS:** `AddColumnModal.module.css`, `AuthModal.module.css`

Replace `<div role="dialog" aria-modal="true">` with native `<dialog>`. Benefits: built-in focus trap, `::backdrop`, Escape key via `cancel` event.

**Pattern:**
```tsx
const dialogRef = useRef<HTMLDialogElement>(null);
useEffect(() => { dialogRef.current?.showModal(); }, []);

<dialog
  ref={dialogRef}
  className={styles.dialog}
  onClose={onClose}
  onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  aria-labelledby="modal-title"
>
  <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
    {/* content */}
  </div>
</dialog>
```

- `AddColumnModal` and `ColumnSettingsModal`: remove `useEscapeKey` import/usage (browser handles Escape natively via `onClose`)
- `AuthModal`: has custom Escape logic (only dismiss when `status === "idle"`). Use `onCancel={(e) => e.preventDefault()}` to suppress native Escape, keep the existing manual keydown listener.
- Remove the outer `.modalOverlay` wrapper div; style `::backdrop` in CSS instead
- The `<dialog>` element gets a reset-only class (`.dialog`); the visual box styles go on an inner `<div className={styles.modal}>`. This avoids specificity issues where `dialog.modal { background: none }` would override `.modal { background: var(--bg-column) }`.
- Add `color: inherit` to `.dialog` reset to override the browser default `color: CanvasText`.

**CSS in `AddColumnModal.module.css` and `AuthModal.module.css`:**
- Remove `.modalOverlay { position: fixed; inset: 0; ... }` block
- Add:
  ```css
  .dialog {
    margin: auto;
    padding: 0;
    border: none;
    background: none;
    color: inherit;
    max-height: 100dvh;
    overflow: visible;
  }
  .dialog::backdrop {
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
  }
  ```

---

## 2. Semantic label list

**File:** `src/components/cards/LabelList.tsx`
**CSS:** `src/components/cards/Label.module.css`

`<div>` → `<ul>`, each label wrapped in `<li>`:
```tsx
<ul className={labelStyles.labelList}>
  {labels.map((l) => (
    <li key={l}>
      <span className={`${labelStyles.label} ${labelStyles[l] ?? labelStyles.fallback}`}>
        {l}
      </span>
    </li>
  ))}
</ul>
```
Add `list-style: none` to `.labelList`.

---

## 3. `<time>` for card ages

**File:** `src/components/cards/CardParts.tsx`
Change `<span className={styles.cardAge}>{age}</span>` → `<time className={styles.cardAge}>{age}</time>`.
The `dateTime` attribute isn't available (data only has formatted strings), but the element still conveys semantic intent.

---

## 4. `<output>` for column item-count badge

**File:** `src/components/Column.tsx`
Change `<div className={styles.colBadge} aria-label={...}>{data.length}</div>` → `<output className={styles.colBadge} aria-label={...}>{data.length}</output>`.
`<output>` semantically represents a live computed value.

---

## 5. CSS variable / hardcoded color fixes

### New tokens added in `globals.css` `:root`
```css
--text-on-light: #000;       /* text on light/accent-coloured backgrounds */
--bg-hover: #161616;         /* generic hover background (slightly lighter than --bg-card) */
--border-hover: #3a3a3a;     /* scrollbar-thumb hover, above --border-mid */
```

### Replacements

| File | Value | Replace with |
|------|-------|--------------|
| `globals.css` | `#3a3a3a` (scrollbar hover) | `var(--border-hover)` |
| `AddColumnModal.module.css` | `color: #000` (primary btn) | `color: var(--text-on-light)` |
| `AddColumnModal.module.css` | `background: #161616` (typeBtn hover) | `background: var(--bg-hover)` |
| `AddColumnModal.module.css` | `background: #13131f` (typeBtn active) | `background: color-mix(in srgb, var(--accent-prs) 8%, var(--bg-card))` |
| `PRCard.module.css` | `background: #1f2937` (draftBadge) | `background: var(--border-card)` |
| `Topbar.module.css` | `color: #000` (btnAdd) | `color: var(--text-on-light)` |
| `AuthModal.module.css` | `color: #000` (btnGitHub) | `color: var(--text-on-light)` |

### Label colors — use `color-mix()` for backgrounds

In `Label.module.css`, replace all bespoke background hex values with `color-mix()` derived from the text color (12% opacity pattern):

```css
.fallback  { color: #9ca3af; background: color-mix(in srgb, #9ca3af 12%, transparent); }
.bug       { color: var(--accent-issues); background: color-mix(in srgb, var(--accent-issues) 12%, transparent); }
.critical,
.urgent    { color: #fca5a5; background: color-mix(in srgb, #fca5a5 12%, transparent); }
.enhancement { color: var(--ci-success); background: color-mix(in srgb, var(--ci-success) 12%, transparent); }
.refactor  { color: var(--accent-prs); background: color-mix(in srgb, var(--accent-prs) 12%, transparent); }
.documentation { color: #86efac; background: color-mix(in srgb, #86efac 12%, transparent); }
.dependencies { color: #9ca3af; background: color-mix(in srgb, #9ca3af 12%, transparent); }
.perf      { color: #6ee7b7; background: color-mix(in srgb, #6ee7b7 12%, transparent); }
.platform  { color: #a5b4fc; background: color-mix(in srgb, #a5b4fc 12%, transparent); }
.observability { color: var(--accent-activity); background: color-mix(in srgb, var(--accent-activity) 12%, transparent); }
```

### CICard — derive `--ci-bg` from `--ci-color`

Replace hardcoded hex values with token refs; remove `--ci-bg`, derive inline:

```css
.success { --ci-color: var(--ci-success); }
.failure { --ci-color: var(--ci-failure); }
.running { --ci-color: var(--ci-running); }

.ciBadge {
  background: color-mix(in srgb, var(--ci-color, var(--text-muted)) 12%, transparent);
  color: var(--ci-color, var(--text-muted));
}
```

### Topbar — consolidate duplicate button rules

`.btnSignIn` and `.btnSignOut` are identical — combine into a single rule:
```css
.btnSignIn,
.btnSignOut { ... }
.btnSignIn:hover,
.btnSignOut:hover { ... }
```

---

## 6. Global reset additions

**File:** `src/globals.css`

### `a` element reset
```css
a {
  color: inherit;
  text-decoration: none;
}
```
Allows removing from `Card.module.css` `.cardTitleLink`:
```css
/* REMOVED — covered by global reset */
color: inherit;
text-decoration: none;
```
The hover rule stays.

### Standard scrollbar CSS (Firefox support)
Added to the `*` reset block:
```css
* {
  scrollbar-width: thin;
  scrollbar-color: var(--border-mid) var(--bg-column);
}
```
Keep `-webkit-` rules for older Safari.

### Removed redundant button properties from `.demoLink`
`background: none; border: none; padding: 0` — already zeroed by `button { all: unset }`.

---

## Implementation notes

- **Specificity trap**: Do NOT use `dialog.modal` as a compound selector for the dialog reset — it has higher specificity (0,1,1) than `.modal` (0,1,0) and will override `background: var(--bg-column)`. Use a separate `.dialog` class for the reset and `.modal` for the visual box.
- **Browser dialog color default**: `<dialog>` has `color: CanvasText` by default (black). Must explicitly set `color: inherit` on `.dialog` reset.
- **AuthModal inner wrapper**: Since AuthModal's dialog wraps content directly (no stopPropagation div), an extra `<div className={styles.modal}>` wrapper is needed inside the `<dialog className={styles.dialog}>`.
