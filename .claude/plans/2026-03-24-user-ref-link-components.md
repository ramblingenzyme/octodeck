# Context

Two related agent tasks from TODO.md:

1. **Extract user link for card footers** — PRCard and IssueCard each inline their own GitHub author/assignee `<a>` tags; DeploymentCard shows `creator` as plain text with no link.
2. **Fix deployments footer to link users & refs** — `{item.ref} · {item.creator}` is currently unstyled plain text.

CICard already links its branch via `https://github.com/{repo}/tree/{branch}`, making it a natural candidate to share a `RefLink` component too.

Goal: extract `UserLink` and `RefLink` as shared UI components, then use them consistently across PRCard, IssueCard, DeploymentCard, and CICard.

---

## Files to modify

- `src/components/cards/PRCard.tsx` — replace inline author `<a>` with `<UserLink>`
- `src/components/cards/IssueCard.tsx` — replace inline assignee `<a>` with `<UserLink>`
- `src/components/cards/DeploymentCard.tsx` — replace plain-text creator/ref with `<UserLink>` + `<RefLink>`
- `src/components/cards/CICard.tsx` — replace inline branch `<a>` with `<RefLink>`

## New files

- `src/components/ui/UserLink.tsx` — renders `<a href="https://github.com/{username}" target="_blank" rel="noreferrer">@{username}</a>`; returns null when username is null/empty
- `src/components/ui/RefLink.tsx` — renders `<a href="https://github.com/{repo}/tree/{gitRef}" target="_blank" rel="noreferrer">{gitRef}</a>`

Link color (`var(--text-muted)`) applied via `& footer a` element selector scoped to `.card` in `Card.module.css` — no per-component CSS modules needed on the link components themselves.

## Implementation notes

- `UserLink` props: `username: string | null`
- `RefLink` props: `repo: string; gitRef: string` (not `ref` — reserved in React)
- IssueCard wraps assignee in a local `.assignee` span (inline-flex, gap, muted color) for icon + link grouping
- DeploymentCard uses a local `.deployMeta` span (inline-flex, gap) to group `<RefLink> · <UserLink>`
- `@` prefix on UserLink: standardise to `@username` (matches GitHub mention convention)
- No barrel files — import directly from `@/components/ui/UserLink` and `@/components/ui/RefLink`

## Verification

1. `npm run build` — no TS errors
2. `npm test` — existing tests pass
3. Visual check in dev server: PR, Issue, Deployment, and CI cards all show linked authors/refs
