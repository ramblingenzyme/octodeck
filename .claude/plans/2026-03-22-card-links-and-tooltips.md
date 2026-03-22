# Context

Cards were mostly read-only — only the title linked to GitHub. This change makes more card elements interactive (links to repos/profiles/branches, tooltips on PR stats) to make the dashboard feel alive and more useful without changing the data model.

## Files modified

- `src/globals.css` — Added `a:hover { text-decoration: underline }` globally so all card links underline consistently without per-component rules
- `src/components/cards/Card.module.css` — `cardMeta` changed to `align-items: center`; `cardStats` gap tightened to 6px; icon-text gaps reduced to 2px; `cardRepo` and `cardAuthor` get `& a { color: inherit }` so nested links inherit muted color
- `src/components/cards/CardParts.tsx` — Repo name wrapped in `<a href="https://github.com/{repo}">` on every card
- `src/components/cards/PRCard.tsx` — Author `<span>` replaced with `<a>` linking to GitHub profile; stat spans (approvals, reviews requested, comments) wrapped in `<Tooltip>` with count text
- `src/components/cards/IssueCard.tsx` — Assignee name wrapped in `<a>` linking to GitHub profile; `<LabelList>` moved above `<CardMeta>` (labels before assignee/comment row)
- `src/components/cards/CICard.tsx` — Branch wrapped in `<a>` linking to `github.com/{repo}/tree/{branch}`; author span gets `.ciBranchMeta` to override `inline-flex` → `inline` so branch and duration flow as wrapping text
- `src/components/cards/CICard.module.css` — `.ciBranchMeta { display: inline }` to allow branch link and duration to wrap naturally
- `src/components/cards/ActivityCard.tsx` — `item.ref` rendered as `<a href={item.url}>` instead of `<span>`
- `src/components/cards/LabelList.tsx` — Added `repo` prop; labels rendered as `<a>` tags linking to `github.com/{repo}/labels/{name}`
- `src/components/cards/Label.module.css` — Added `margin-bottom: 7px` to `.labelList` for spacing when labels appear above the meta row on issue cards

## Key decisions

- **Tooltips only on PR stats** — type icon tooltips (notif/activity) were considered but felt overbearing
- **Global hover underline** — simpler than per-component rules; card title's `.cardTitle > a:hover` is more specific and still wins for accent-color styling
- **CICard `display: inline` on the span, not the anchor** — anchors inside an `inline-flex` span become flex items and break wrapping; overriding the span to `inline` restores natural text flow
- **Activity refs link to `item.url`** — no separate ref URLs in the data model; the URL already points to the same commit/issue/PR

## Verification

```bash
npm run dev   # check all links open correct GitHub URLs in new tab
              # hover PR stat icons → tooltip appears
              # CI branch wraps correctly with long names
npm run build # TypeScript check passes
npm run lint  # no lint errors
```
