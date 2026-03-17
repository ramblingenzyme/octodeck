# HubDeck — GitHub Dashboard

A TweetDeck-style GitHub dashboard built with React, TypeScript, and Vite.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Format code
npm run format
```

## Architecture

### Config
- **Vite** for bundling and dev server
- **TypeScript strict mode** (`noUncheckedIndexedAccess`, `noImplicitOverride`)
- **oxfmt** for formatting, **oxlint** for linting
- **@types/react@19**, **react@19**

### File Structure

```
src/
├── main.tsx              # App entry point
├── globals.css           # Design tokens + component styles
├── types/index.ts        # ColumnType, PRItem, CIItem, etc.
├── constants/index.ts    # LABEL_COLORS, CI_STATUS, COLUMN_TYPES
├── data/mock.ts          # Mock data arrays (MOCK_PRS, MOCK_ISSUES, etc.)
├── store/
│   ├── index.ts          # Redux store configuration
│   ├── configApi.ts      # RTK Query API (add/remove/move column mutations)
│   └── layoutStorage.ts  # localStorage persistence ("gh-deck:layout")
└── components/
    ├── App.tsx           # Top-level state & modal
    ├── Topbar.tsx        # Header with logo + "Add Column"
    ├── Board.tsx         # Scrollable column grid
    ├── Column.tsx        # Column container + card rendering
    ├── AddColumnModal.tsx # Type/title picker
    ├── Icon.tsx          # Emoji/unicode icon utility
    └── cards/
        ├── CardParts.tsx    # Shared card sub-components
        ├── LabelList.tsx    # Label badge list
        ├── PRCard.tsx       # Pull request card
        ├── IssueCard.tsx    # Issue card
        ├── CICard.tsx       # CI/CD run card
        ├── NotifCard.tsx    # Notification card
        └── ActivityCard.tsx # Activity event card
```

### Key Design Decisions

**CSS Architecture**
- All tokens in CSS custom properties (`:root`)
- No CSS-in-JS, no inline styles
- `.btn { all: unset }` for universal button reset
- `--color-accent` pattern: Column sets it on root, header/title consume it

**Type Safety**
- `ColumnType` union for exhaustive column types
- Strict `noUncheckedIndexedAccess` → `LABEL_COLORS[label] ?? LABEL_FALLBACK`
- Discriminated union in `Column.renderCard()` for type-safe card rendering

**State Management**
- Redux Toolkit with RTK Query (`configApi.ts`) handles column mutations (add/remove/moveLeft/moveRight)
- Column layout persisted to `localStorage` under `"gh-deck:layout"`; falls back to `DEFAULT_COLUMNS`
- `Column` owns: `confirming` flag for removal confirmation
- `AddColumnModal` owns: selectedType and title form state

**Mock Data**
- Named exports per type (`MOCK_PRS`, `MOCK_ISSUES`, etc.)
- Tree-shakeable: unused arrays can be dropped in production
- Column.tsx uses `DATA_MAP` discriminated by `col.type`

## Design System

### Palette
- **Background**: `#080808` (root), `#0a0a0a` (topbar), `#0d0d0d` (column), `#111111` (card)
- **Text**: `#e5e7eb` (primary), `#d1d5db` (secondary), `#6b7280` (muted), `#4b5563` (faint), `#374151` (ghost)
- **Accents per column**:
  - Notifications: `#4ade80` (green)
  - PRs: `#818cf8` (indigo)
  - Issues: `#f87171` (red)
  - CI/CD: `#fbbf24` (amber)
  - Activity: `#c4b5fd` (purple)

### Typography
- **Mono**: JetBrains Mono (body, UI text)
- **Display**: Syne (column titles)

## Deferred Features

- GitHub OAuth authentication
- Real API calls (currently 100% mock data)
- Per-column filter/search config UI
- Drag-to-reorder columns

## Development

### Adding a New Column Type

1. Add type to `ColumnType` in `src/types/index.ts`
2. Add data interface (e.g., `NewItem`) in same file
3. Add mock data export in `src/data/mock.ts`
4. Add config in `COLUMN_TYPES` in `src/constants/index.ts`
5. Create card component in `src/components/cards/NewCard.tsx`
6. Update `DATA_MAP` and card dispatch in `Column.tsx`
7. Update `DEFAULT_COLUMNS` if desired

### Type Checking

```bash
# Check types (without emit)
npx tsc --noEmit

# Build with Vite (handles TS via esbuild)
npm run build
```

## Files Generated

- **Config**: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `oxlint.json`, `index.html`
- **Docs**: `PLAN.md`, `SETUP.md`, `README.md`
- **Source**: 16 TypeScript/TSX files + 1 CSS file (see structure above)

All changes were formatted with **oxfmt** (single quotes, 2-space indent, line width 100).

---

**Prototype Status**: Refactored from `/src/index.tsx` (600 lines, no types, all inline) → modular multi-file codebase. All visual design and mock data preserved. Ready for API integration.
