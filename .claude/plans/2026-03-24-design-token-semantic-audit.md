# Context

The TODO in `globals.css` asked us to review whether design tokens are used semantically. The audit found two problems:

1. Column-type accent tokens (`--accent-prs`, `--accent-issues`) had leaked into generic UI components (focus rings, modal buttons, input focus, chip remove hover).
2. The `--ci-*` status tokens were used broadly outside CI contexts (errors, warnings, severity levels, deployment status, release badges) — the names implied CI-specificity but the intent was generic status colours.

---

## Changes made

### Renamed `--ci-*` → `--status-*`

| Old            | New                |
| -------------- | ------------------ |
| `--ci-success` | `--status-success` |
| `--ci-failure` | `--status-danger`  |
| `--ci-running` | `--status-warning` |

Updated in: `globals.css`, `BaseColumn.module.css`, `AuthModal.module.css`, `CardParts.module.css`, `CICard.module.css`, `SecurityCard.module.css`, `DeploymentCard.module.css`, `ReleaseCard.module.css`, `RepoChipList.module.css`.

Note: `--ci-color` in `CICard.module.css` is a component-scoped local variable (not a global token) and was left as-is.

### Added `--accent-ui`

```css
--accent-ui: oklch(0.7 0.16 265); /* same value as --accent-prs */
```

Replaces `--accent-prs` in all generic interactive/focus contexts:

- `:focus-visible` outline (`globals.css`)
- Modal submit button background + border (`Modal.module.css`)
- `fieldInput:focus` border (`Modal.module.css`)
- `chipArea:focus-within` border (`RepoChipList.module.css`)

### Fixed chip remove hover

`chipRemove:hover` was using `--accent-issues` (orange). Changed to `--status-danger` (red) — semantically correct for a destructive remove action.

### Removed TODO comment

The design token review TODO in `globals.css` was removed.
