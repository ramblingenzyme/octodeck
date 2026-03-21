# Add Column Modal Polish

## Changes made

### Modal title size fix (`src/components/ui/Modal.module.css`)
The modal header styled `& h2` but the markup renders `<h1>`, so the title was getting default browser h1 sizing. Fixed by changing the selector to `& h1`.

### Per-column color indication (`src/components/AddColumnModal.module.css`)
Each type button already receives its column's accent CSS class (e.g. `prStyles.accent`), which scopes `--color-accent`. Added `color: var(--color-accent)` to `.colIcon` so each button's icon shows in the column's accent color.

### Active state redesign (`src/components/AddColumnModal.module.css`)
Previously the active/selected button used a hardcoded `var(--accent-prs)` color for its border and background tint — always indigo regardless of which type was selected. Replaced with a neutral active state (mid border + hover background) and a colored left-edge stripe via `box-shadow: inset 3px 0 0 var(--color-accent)`.

### Icon/text gap (`src/components/AddColumnModal.module.css`)
Reduced gap between icon and label in type buttons from `10px` to `6px`.

### Default column name sync (`src/constants/index.ts`)
Synced `COLUMN_TYPES` labels (used as default titles when adding a column) with the more natural names from `DEFAULT_COLUMNS`:
- "Pull Requests" → "Open PRs"
- "Notifications" → "Inbox"
- "My Activity" → "Activity"

### Accent color palette overhaul (all `src/components/columns/*.module.css`, `src/globals.css`)
All accent colors converted to `oklch()` for perceptual consistency. Previous hex values had uneven lightness/chroma and poor hue spacing (Releases and Issues were only 4.4° apart in OKLCH hue).

New palette (L and C normalized, hues spaced ~35–52° apart):

| Column | OKLCH | Hue |
|---|---|---|
| Issues | `oklch(0.72 0.17 22)` | 22° red |
| Security | `oklch(0.75 0.17 55)` | 55° orange |
| CI | `oklch(0.83 0.16 90)` | 90° yellow (higher L needed for amber to read correctly) |
| Notifications | `oklch(0.80 0.16 142)` | 142° green |
| Releases | `oklch(0.72 0.17 345)` | 345° magenta-rose |
| Deployments | `oklch(0.72 0.15 225)` | 225° blue |
| PRs | `oklch(0.70 0.16 265)` | 265° indigo |
| Activity | `oklch(0.78 0.13 308)` | 308° purple |

Global `--accent-*` variables in `globals.css` updated to match.
