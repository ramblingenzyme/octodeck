# Redesign PR Icon for Clarity

## Context

The `GitMergeIcon` used for the Pull Requests column header (and `pr_opened`/`pr_merged` activity items) was not reading clearly at small sizes. The original design used three circles arranged in a triangle (top-left, bottom-left, right) connected by lines and curves — resembling a merge but not immediately recognizable as a PR.

## Approach

Redraw `GitMergeIcon` to match the canonical GitHub-style open pull request icon:

- Two nodes stacked vertically on the left (top-left and bottom-left circles)
- One node at the top-right
- A vertical line connecting the two left nodes
- A bezier curve from the bottom-left node sweeping up and right to the top-right node

This shape is the widely-recognized open PR symbol and reads clearly even at small sizes.

## Critical File

`src/components/ui/icons/GitMergeIcon.tsx`

## Implementation

Replaced:
```tsx
<circle cx="5" cy="4" r="2" />
<circle cx="5" cy="12" r="2" />
<circle cx="12" cy="8" r="2" />
<line x1="5" y1="6" x2="5" y2="10" />
<path d="M6.7 3.3 C9 3.3 12 5.5 12 6" />
<path d="M6.7 12.7 C9 12.7 12 10.5 12 10" />
```

With:
```tsx
<circle cx="4" cy="4" r="1.75" />
<circle cx="4" cy="12" r="1.75" />
<circle cx="12" cy="4" r="1.75" />
<line x1="4" y1="5.75" x2="4" y2="10.25" />
<path d="M 4 10.25 C 4 7 12 8 12 5.75" />
```

## Usage

`GitMergeIcon` / `"gitMerge"` is used in:
- `src/constants/index.ts` — `prs` column icon, `pr_opened` and `pr_merged` activity icons
