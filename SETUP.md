# HubDeck Setup Instructions

All files have been scaffolded. To complete the setup and run the project:

## Prerequisites
- Node.js 18+ and npm

## Installation & Development

```bash
# Install dependencies
npm install

# Start dev server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint with oxlint
npm run lint

# Format with oxfmt
npm run format
```

## Project Structure

```
src/
├── main.tsx                    # Entry point
├── globals.css                 # Design tokens, resets, component styles
├── types/index.ts              # TypeScript type definitions
├── constants/index.ts          # Design system & column configs
├── data/mock.ts                # Typed mock data
├── store/
│   ├── index.ts                # Redux store
│   ├── configApi.ts            # RTK Query column mutations
│   └── layoutStorage.ts        # localStorage persistence
└── components/
    ├── App.tsx                 # Top-level component
    ├── Topbar.tsx              # Header bar
    ├── Board.tsx               # Column grid
    ├── Column.tsx              # Single column container
    ├── AddColumnModal.tsx      # Add column dialog
    ├── Icon.tsx                # Icon utility
    └── cards/
        ├── CardParts.tsx       # Shared card sub-components
        ├── LabelList.tsx       # Label badges
        ├── PRCard.tsx
        ├── IssueCard.tsx
        ├── CICard.tsx
        ├── NotifCard.tsx
        └── ActivityCard.tsx
```

## Verification Checklist

After `npm install && npm run dev`:

- [ ] All 5 default columns render (Inbox, Open PRs, Issues, CI/CD, Activity)
- [ ] Mock data displays correctly in each column
- [ ] "+ Add Column" button opens modal
- [ ] Can select column type and custom title
- [ ] New columns append to the right
- [ ] Move left/right buttons work (first/last column disabled appropriately)
- [ ] Remove button shows confirmation dialog
- [ ] Confirmation cancels/proceeds correctly
- [ ] Dark aesthetic matches prototype (fonts, colors, spacing)

## Design System

All visual design is driven by CSS custom properties in `globals.css`:
- Background colors: `--bg-root`, `--bg-topbar`, `--bg-column`, `--bg-card`
- Text colors: `--text-primary`, `--text-secondary`, `--text-muted`, `--text-faint`, `--text-ghost`
- Column accents: `--color-accent` set per-column on `.column` root
- Fonts: `--font-mono` (JetBrains Mono), `--font-display` (Syne)


## Next Steps (Deferred)

- GitHub OAuth authentication
- Real API calls to GitHub
- Per-column filter/search configuration
- Drag-to-reorder columns
