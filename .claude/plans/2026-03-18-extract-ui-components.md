# Extract Reusable Components to src/components/ui/

## Context

The codebase had three modals sharing boilerplate (`<dialog>` + `showModal()`, CSS structure) and five card components sharing an identical outer skeleton (article → CardTop → title link → footer → labels). Extracting these into `src/components/ui/` removes duplication and gives reusable primitives a clear home. `Icon.tsx` was already reusable and moved there too.

---

## Components extracted

### 1. `src/components/ui/Icon.tsx` (moved from `src/components/Icon.tsx`)
Moved the file and `Icon.module.css`. Updated imports in:
- `src/components/AddColumnModal.tsx`
- `src/components/Column.tsx`
- `src/components/cards/CardParts.tsx`
- `src/components/cards/PRCard.tsx`
- `src/components/cards/CICard.tsx`

### 2. `src/components/ui/Modal.tsx` + `Modal.module.css`

Abstracts the `<dialog>` boilerplate shared by all three modals.

**API:**
```tsx
<Modal
  title="Add Column"
  titleId="add-column-modal-title"
  onClose={onClose}
  onBackdropClick={onClose}   // optional; omit to disable backdrop-click-to-close
  preventCancel               // optional boolean; calls e.preventDefault() on native cancel (Escape)
>
  <ModalBody>...</ModalBody>
  <ModalFooter>...</ModalFooter>
</Modal>
```

- `Modal` handles: `useRef` + `showModal()` on mount, `onClose` on `<dialog onClose>`, optional `onBackdropClick`, optional `preventCancel`
- `ModalBody` and `ModalFooter` are thin named exports applying `.modalBody` / `.modalFooter` classes
- `modalStyles` is also exported for consuming shared button/input classes directly
- Header is rendered by `Modal` itself from `title` + `titleId` props

**Modal.module.css** — styles shared across all modals:
- `.dialog`, `.modal`, `.modalHeader`, `.modalTitle`, `.modalBody`, `.modalFooter`
- `.btnModal`, `.btnModalPrimary`, `.btnModalDanger`
- `.fieldInput`

**AddColumnModal.module.css** keeps only its specific styles:
- `.modalTypes`, `.typeBtn`, `.typeBtn.active`, `.colIcon`, `.modalField`, `.modalFieldLabel`
- `.clearConfirm`, `.clearConfirmText`, `.clearConfirmButtons`

**AuthModal.module.css** unchanged (all styles unique to auth flow).

**Modals refactored:**
- `AddColumnModal.tsx` — uses `Modal`, `ModalBody`, `ModalFooter`; shared CSS from `modalStyles`
- `ColumnSettingsModal.tsx` — same; no longer imports `AddColumnModal.module.css` for shared classes
- `AuthModal.tsx` — uses `Modal` with `preventCancel`; keeps its own body HTML

### 3. `src/components/ui/Card.tsx`

Compositional card skeleton used by all five card components.

**Sub-components:**
- `Card` — renders `<article className={cardStyles.card}>` wrapper with internal `CardTop`; accepts `repo`, `age`, optional `className`
- `CardTitle` — renders `<p className={cardStyles.cardTitle}><a ...>` with `href` and optional `prefix` (e.g. `#123`)
- `CardMeta` — renders `<footer className={cardStyles.cardMeta}>` (space-between; PR, Issue, CI)
- `CardFooter` — renders `<footer className={cardStyles.cardFooter}>` (gap/left-aligned; Notif, Activity)

`CardTop` is internal to `Card` (not exported). `LabelList` and `CardTypeIcon` stay in `cards/`.

**Cards refactored:** all five in `src/components/cards/`.

---

## Files created
- `src/components/ui/Modal.tsx`
- `src/components/ui/Modal.module.css`
- `src/components/ui/Card.tsx`
- `src/components/ui/Icon.tsx` (moved)
- `src/components/ui/Icon.module.css` (moved)

No barrel `index.ts` — imports point directly to the specific file (e.g. `'./ui/Modal'`, `'../ui/Card'`).

## Files modified
- `src/components/AuthModal.tsx`
- `src/components/AddColumnModal.tsx`
- `src/components/AddColumnModal.module.css`
- `src/components/ColumnSettingsModal.tsx`
- `src/components/Column.tsx`
- `src/components/cards/CardParts.tsx`
- `src/components/cards/PRCard.tsx`
- `src/components/cards/IssueCard.tsx`
- `src/components/cards/CICard.tsx`
- `src/components/cards/NotifCard.tsx`
- `src/components/cards/ActivityCard.tsx`

## Decisions
- No barrel `index.ts` in `ui/` — direct imports preferred.
- No `Button` component extracted — button styles are too context-specific across the app; modal button styles are already shared via `modalStyles`.
- `AuthModal` visual shell (modal width, padding) now matches the shared `Modal.module.css` rather than its original bespoke styles, as a consequence of the refactor.
