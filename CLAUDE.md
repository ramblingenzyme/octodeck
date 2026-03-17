# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # TypeScript check + Vite build
npm run lint     # Lint with oxlint
npm run format   # Format with oxfmt (2-space indent, 100-char line width, single quotes)
npm run preview  # Preview production build
npm test         # Run tests (vitest)
npm run test:watch  # Run tests in watch mode
```

## Architecture

**gh-deck** is a TweetDeck-style GitHub dashboard (prototype with mock data). React 19 + TypeScript + Vite, state via Redux Toolkit.

### Key data flow

- `src/types/index.ts` — `ColumnType` discriminated union (`prs | issues | ci | notifications | activity`) and item types
- `src/constants/index.ts` — `COLUMN_TYPES` config (labels/icons per type), `DEFAULT_COLUMNS`, `mkId()`
- `src/store/configApi.ts` — RTK Query API for column layout mutations (add, remove, move); persists to `localStorage` via `layoutStorage.ts`
- `src/data/mock.ts` — Mock data arrays (`MOCK_PRS`, `MOCK_ISSUES`, etc.)

### Component tree

```
App.tsx (Redux + modal state)
├── Topbar.tsx
├── Board.tsx → Column.tsx (switch on col.type → card component)
│   └── cards/{PRCard,IssueCard,CICard,NotifCard,ActivityCard}.tsx
│       └── CardParts.tsx (CardContainer, CardHeader, CardBody, CardFooter)
└── AddColumnModal.tsx
```

`Column.tsx` uses an exhaustive switch on `col.type` to render the correct card — TypeScript enforces this at compile time via the discriminated union.

### CSS

- All design tokens in CSS custom properties on `:root` in `globals.css`
- Each component has a companion `*.module.css` file
- No CSS-in-JS, no inline styles
- Per-column accent color set via `--color-accent` CSS variable

### Path alias

`@/` maps to `src/` (configured in `vite.config.ts`).

## Plans

Persist plans to `.claude/plans/YYYY-MM-DD-<description>.md` (see `AGENTS.md`).
