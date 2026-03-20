# Activity Event Improvements

## Context

Several issues were discovered with the Activity column when testing against live GitHub data:

1. **Push event SHA missing** — `ref` was derived from `commits[0].sha`, but the public Events API returns an empty `commits` array. The `head` field (always present) was not being used as a fallback.
2. **Commit count always showing 1** — `size` and `distinct_size` were absent from the public API payload. With no reliable count, showing a hardcoded `1` was misleading.
3. **Several event types not handled** — `CreateEvent`, `ForkEvent`, `WatchEvent`, and `PullRequestEvent` with `action: "merged"` all returned `null` from `mapEvent` and were silently dropped.

## Changes Made

### `src/types/github.ts`
- Added `head?: string` to `GHEvent.payload` (SHA of HEAD after push)
- Added `distinct_size?: number` to `GHEvent.payload`
- Added `ref_type?: string` to `GHEvent.payload` (for CreateEvent branch vs tag)
- Added `forkee?: { full_name: string; html_url: string }` to `GHEvent.payload`

### `src/types/index.ts`
- Added `IconName` values: `gitBranch`, `gitFork`, `star`
- Added `ActivityType` values: `pr_merged`, `branch_created`, `fork`, `star`

### `src/components/ui/icons/`
- Added `GitBranchIcon.tsx`, `GitForkIcon.tsx`, `StarIcon.tsx`

### `src/components/ui/SvgIcon.tsx`
- Registered the three new icons in `ICON_MAP`

### `src/constants/index.ts`
- Added icon mappings for the new `ActivityType` values in `ACTIVITY_ICONS`

### `src/store/githubMappers.ts`
- `PushEvent`: fall back to `payload.head` for SHA when `commits` is empty
- `PushEvent`: use `size ?? distinct_size ?? commits.length` for count; omit count text entirely when unknown rather than showing a false `1`
- `PullRequestEvent`: handle `action: "merged"` in addition to `"opened"`
- Added `CreateEvent` handler (branch creation only; repo/tag creation returns null)
- Added `ForkEvent` handler
- Added `WatchEvent` handler (starring)
