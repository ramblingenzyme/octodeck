# CSS Nesting Refactor Plan

## Context
The CSS module files use flat selector patterns: pseudo-class rules (`:hover`, `:focus`) and modifier classes are declared as separate top-level rules adjacent to their parent. Native CSS nesting (`&`) is broadly supported (Chrome 112+, Firefox 117+, Safari 16.5+) and Vite + PostCSS handle it natively. Using nesting will co-locate related rules, reduce repetition, and make the modifier/state structure self-evident.

---

## Approach

Three nesting patterns to apply throughout:

1. **Pseudo-class/pseudo-element** — `.foo:hover {}` → `.foo { &:hover {} }`
2. **Modifier class** — `.foo.active {}` → `.foo { &.active {} }`
3. **Selector concatenation** — `.fooBar {}` (variant of `.foo`) → `.foo { &Bar {} }` (produces `.fooBar`)
4. **Descendant** — `.foo .bar {}` → `.foo { & .bar {} }`
5. **Nested media query** — `@media { .foo {} }` → `.foo { @media { … } }`

---

## Files to Modify

| File | Key opportunities |
|------|-------------------|
| `src/components/BaseColumn.module.css` | `.btnIcon:hover`, `.btnIconActive`, `.btnIconSpinning`, `.colHeader:hover .dragHandle`, `.dragHandle:hover`, `.btnConfirmCancel:hover`, `.btnConfirmDanger:hover`, `.dropLeft::before` / `.dropRight::after`, `@keyframes skeleton-pulse` inside `.skeletonCard` |
| `src/components/ui/Modal.module.css` | `.dialog::backdrop`, `.btnModal:hover`, `.btnModalPrimary:hover`, `.btnModalDanger:hover/:disabled`, `.fieldInput:focus` |
| `src/components/AuthModal.module.css` | `.btnGitHub:hover`, `.demoLink:hover`, `.btnCancel:hover`, `.btnModal:hover` |
| `src/components/Topbar.module.css` | `.btnAdd:hover`, `.btnSignIn:hover`, `.avatarBtn:hover`, `.menuSignOut:hover` |
| `src/components/AddColumnModal.module.css` | `.typeBtn:hover`, `.typeBtn.active` |
| `src/components/ui/Tooltip.module.css` | `.tooltip.above`, `.tooltip.below`, `.wrapper:hover .tooltip` / `:focus-within .tooltip`, `@media reduced-motion` inside `.tooltip` |
| `src/components/ui/InlineEdit.module.css` | `.display:hover`, `.display:hover .pencil`, `.textarea:focus`, `.confirm:hover`, `.cancel:hover` |
| `src/components/cards/Card.module.css` | `.cardTitleLink:hover` inside `.cardTitleLink` |
| `src/components/cards/Label.module.css` | `.label.colored`, `.label.fallback` |

---

## Important Notes

- **`composes`** rules must remain at the top of the declaration block — do not move them inside a nested rule. (PostCSS processes them separately.)
- **Concatenated variants** like `.btnModalPrimary` can be written as `&Primary {}` inside `.btnModal {}` — the `&` is replaced with `.btnModal` producing `.btnModalPrimary`. The compiled class name is identical, so `styles.btnModalPrimary` in JSX continues to work.
- **`@keyframes` nesting** (inside `.skeletonCard`) is valid CSS but check browser support — if it causes issues, keep keyframes at top level.
- **Status modifier classes** (`.success`, `.failure`, etc. in CICard/DeploymentCard/SecurityCard) are applied on the card root element to set a CSS variable inherited by a badge descendant — do NOT nest these inside the badge class.
- No changes to JSX/TSX files; class names stay the same.

---

## Verification

```bash
npm run build    # TypeScript + Vite build must pass
npm run lint     # oxlint must pass
npm test         # vitest tests must pass
```

Manual: visually verify hover/focus/active states still apply correctly in the browser (especially `.btnIcon`, modal buttons, and card labels).

---

## Status

**Completed 2026-03-21.** All 9 files refactored. Build passes, 272/272 tests pass.
