# Refactor Label Coloring to Pure CSS with OKLCH

## Context

Labels previously required JS to convert hex → RGB → HSL, passing 6 CSS custom properties
(`--label-r/g/b/h/s/l`) so CSS could compute perceived lightness and adjust text color.
CSS relative color syntax + oklch eliminates all of that: we pass a single `--label-color`
hex variable and let the browser do the color math natively.

OKLCH's `l` channel is perceptually uniform (unlike HSL `l`), so a simple `max(l, 0.82)`
clamp gives correct "lighten dark label text" behavior without any luminance weighting.

## Changes

### `src/components/cards/LabelList.tsx`

- Deleted `hexToRgb()` and `rgbToHsl()` functions
- Replaced the 6-property inline style with a single property:
  ```tsx
  style={{ "--label-color": `#${l.color}` } as React.CSSProperties}
  ```

### `src/components/cards/Label.module.css`

Replaced the entire `.colored` block with:

```css
.colored {
  color: oklch(from var(--label-color) max(l, 0.82) c h);
  background-color: color-mix(in oklch, var(--label-color) 18%, transparent);
  border: 1px solid color-mix(in oklch, var(--label-color) 30%, transparent);
}
```

- `color`: relative color syntax extracts L/C/H from the hex, clamps L to min 0.82
  (dark labels get lightened, bright ones stay as-is)
- `background-color`: replaces `rgba(r, g, b, 0.18)` — same 18% opacity but mixed in oklch
- `border`: replaces `rgba(r, g, b, 0.3)` — same 30% weight
