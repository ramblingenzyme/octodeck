# Plan: Use API Label Colors Instead of Hardcoded CSS

## Context

Labels on issue/PR cards were colored via CSS class name matching (e.g., `.bug`, `.enhancement`). Only a handful of known labels got colors; everything else fell back to gray. The GitHub API returns a `color` hex string (without `#`) on each label object. We store and use that color to dynamically style labels — matching GitHub's own coloring.

## What We Did

### 1. Updated types

Added `Label` type to `src/types/index.ts`:

```ts
export interface Label {
  name: string;
  color: string;
}
```

Changed `PRItem.labels` and `IssueItem.labels` from `string[]` to `Label[]`.

Updated `GHSearchItem.labels` in `src/types/github.ts` to `Array<{ name: string; color: string }>`.

### 2. Updated mock data

Converted all string label arrays in `src/test/fixtures/mock.ts` to `{ name, color }` objects with realistic GitHub-style hex colors (no `#` prefix, matching API format).

### 3. Updated mapper

`src/store/githubMappers.ts` — changed `.map((l) => l.name)` to `.map((l) => ({ name: l.name, color: l.color }))` for both PR and issue mappers.

### 4. Updated query filter

`src/utils/queryFilter.ts` — updated label filter to use `l.name` instead of treating labels as strings directly.

### 5. LabelList component

`src/components/cards/LabelList.tsx` — JS computes RGB and HSL channel values from the hex string, sets them as CSS custom properties. All visual logic lives in CSS.

```tsx
const { r, g, b } = hexToRgb(l.color);
const { h, s, l: lum } = rgbToHsl(r, g, b);
// style={{ '--label-r': r, '--label-g': g, '--label-b': b,
//          '--label-h': h, '--label-s': s, '--label-l': lum }}
```

### 6. Label CSS

`src/components/cards/Label.module.css` — removed all per-label color classes (`.bug`, `.enhancement`, etc.). The `.colored` class implements GitHub's exact label color algorithm using CSS `calc()`:

```css
.colored {
  --lightness-threshold: 0.6;
  --perceived-lightness: calc(
    (var(--label-r) * 0.2126 + var(--label-g) * 0.7152 + var(--label-b) * 0.0722) / 255
  );
  --lightness-switch: max(0, min(calc(1 / (var(--lightness-threshold) - var(--perceived-lightness))), 1));
  --lighten-by: calc(
    (var(--lightness-threshold) - var(--perceived-lightness)) * 100 * var(--lightness-switch)
  );
  color: hsl(var(--label-h), calc(var(--label-s) * 1%), calc(var(--label-l) * 1% + var(--lighten-by) * 1%));
  background-color: rgba(var(--label-r), var(--label-g), var(--label-b), 0.18);
  border: 1px solid rgba(var(--label-r), var(--label-g), var(--label-b), 0.3);
}
```

This replicates what GitHub does: dark labels get their text lightened (keeping the hue), light labels stay as-is. Background at 18% opacity, border at 30%.

## Alternatives Considered

**Pure CSS via relative color syntax** — we attempted setting only `--label-color: #hex` from JS and using `rgb(from var(--label-color) r g b / 0.18)` etc. in CSS. Background and border work fine this way, but the perceived-lightness calculation for text color requires channel values in `calc()` outside a color function, which CSS doesn't support. Approximations (`max(l, 70%)`) produced near-white text for low-saturation colors. Reverted to JS-computed channel values.

## Files Changed

- `src/types/index.ts`
- `src/types/github.ts`
- `src/test/fixtures/mock.ts`
- `src/store/githubMappers.ts`
- `src/store/githubMappers.test.ts`
- `src/utils/queryFilter.ts`
- `src/utils/queryFilter.test.ts`
- `src/components/cards/LabelList.tsx`
- `src/components/cards/Label.module.css`
