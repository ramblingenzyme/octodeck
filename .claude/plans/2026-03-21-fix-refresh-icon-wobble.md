# Fix Refresh Icon Wobble During Spin Animation

## Context

The refresh icon wobbles visually when the spin CSS animation rotates it. The root cause is that the arc in the current SVG paths is not centered at the viewBox center (8, 8) — the geometric center of the arc is approximately at (9.34, 8.63), and the arrowhead hook lives in the upper-left quadrant. This off-center visual mass causes wobble when the element rotates around its CSS center.

## Approach

Redesign the two `<path>` elements in `RefreshIcon.tsx` so the arc is centered exactly at (8, 8) with radius 5.5.

**New paths:**
- Arc: `M 8 2.5 A 5.5 5.5 0 1 1 3.24 5.25` — clockwise (↻), 300°, centered at (8,8)
- Hook arrowhead: `M 6 2.5 L 8 2.5 L 8 4.5` — at arc start (top of circle), arms extend left and down

Verification:
- (8, 2.5): distance from (8,8) = 5.5 ✓
- (3.24, 5.25): distance from (8,8) = sqrt(4.76²+2.75²) = 5.5 ✓
- Arc covers 300° CW (large-arc=1, sweep=1) ✓

## Critical File

`src/components/ui/icons/RefreshIcon.tsx` — lines 15–16

## Implementation

Replaced:
```tsx
<path d="M1.5 4.5v4h4" />
<path d="M3.5 10a6 6 0 1 0 1.8-5.8" />
```

With:
```tsx
<path d="M 8 2.5 A 5.5 5.5 0 1 1 3.24 5.25" />
<path d="M 6 2.5 L 8 2.5 L 8 4.5" />
```

## Verification

Run `npm run dev` and observe the column refresh button spinning — it should rotate smoothly without any wobble.
