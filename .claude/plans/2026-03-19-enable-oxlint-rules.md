# Plan: Enable More oxlint Rules

## Context

The `oxlint.json` had only a single rule (`@typescript-eslint/no-explicit-any`). The goal was to enable plugins for React, accessibility, and performance linting, configure sensible rules, and fix the real violations that surfaced. This increases confidence that components are correct (hooks deps, keys in lists, ARIA usage, button types) without introducing noisy false positives.

## Changes

### 1. `oxlint.json` — enable plugins + configure rules

Added three plugins: `react` (includes exhaustive-deps, jsx-key, etc.), `jsx-a11y` (ARIA/accessibility), and `react_perf` (inline JSX anti-patterns). Each rule is annotated with a JSONC comment explaining its severity choice:

- `react/exhaustive-deps`: `warn` — has known false positives when stable method refs are accessed via object property rather than destructured before the effect
- `react/button-has-type`: `warn` — intentional omissions (e.g. type="submit") are rare but valid
- `react/no-array-index-key`: `warn` — acceptable for static/non-reordered lists (e.g. skeletons)
- `jsx-a11y/click-events-have-key-events` / `no-static-element-interactions`: `warn` — `<dialog>` and propagation-stopper patterns are false positives here
- `jsx-a11y/no-autofocus`: `warn` — one intentional usage in Column.tsx

### 2. `src/components/Column.tsx` — fix `prefer-tag-over-role`

The `<span role="button">` for the editable query display was replaced with a `<button type="button">`. Removed `role="button"` and `tabIndex={0}` (button is focusable by default).

Added a suppression comment on the `autoFocus` attribute with rationale:
```tsx
// eslint-disable-next-line jsx-a11y/no-autofocus -- user-triggered edit (clicking the query text), not autofocus on page load
autoFocus
```

### 3. `src/components/ui/Modal.tsx` — suppress two false positives

- `<dialog onClick={...}>` (~line 40): backdrop click; `<dialog>` has native keyboard accessibility via `onCancel`/Escape. Suppressed `click-events-have-key-events` and `no-static-element-interactions` with inline rationale.
- `<div onClick={(e) => e.stopPropagation()}>` (~line 43): not an interaction point — stopPropagation prevents backdrop-click from firing on modal content clicks. Same two rules suppressed with inline rationale.

### 4. `src/components/App.tsx` — fix `exhaustive-deps`

`authModal.close` was referenced inside a `useEffect` dep array as `authModal.close`. Destructured before the effect so the stable `useCallback` ref is captured directly:
```tsx
const { close: closeAuthModal } = authModal;
useEffect(() => {
  if (auth.status === "authed") closeAuthModal();
}, [auth.status, closeAuthModal]);
```

### 5. `src/hooks/useModal.test.ts` — fix same pattern in 3 test hooks

Three test hooks used the same `[status, modal.close]` dep array pattern. Applied the same destructuring fix (`const { close } = modal`) in all three.

## Verification

```
npm run lint   → Found 0 warnings and 0 errors.
npm test       → 113 passed
npm run build  → built in 607ms, no TypeScript errors
```
