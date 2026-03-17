# Plan: Add Links to Cards

**Date:** 2026-03-17

## Goal

Make card titles clickable so users can navigate directly to the relevant GitHub resource (PR, issue, CI run, notification, activity event).

## Changes

### 1. Add `url` field to all item types (`src/types/index.ts`)

Add `url: string` to `PRItem`, `IssueItem`, `CIItem`, `NotifItem`, and `ActivityItem`.

### 2. Populate mock data with GitHub-style URLs (`src/data/mock.ts`)

Add realistic URLs to all mock items:
- PRs: `https://github.com/{repo}/pull/{number}`
- Issues: `https://github.com/{repo}/issues/{number}`
- CI: `https://github.com/{repo}/actions/runs/{id}`
- Notifications/Activity: point to the relevant PR, issue, or commit

### 3. Update GitHub API type definitions (`src/types/github.ts`)

- Add `html_url: string` to `GHWorkflowRun`
- Add `html_url` to `GHEvent` payload fields (`pull_request`, `issue`, `comment`)

### 4. Populate `url` in API mappers (`src/store/githubMappers.ts`)

- **PRs / Issues:** use `item.html_url` from the search API response
- **Notifications:** convert `subject.url` (GitHub API URL) to an HTML URL via `apiUrlToHtmlUrl()`, transforming e.g. `https://api.github.com/repos/owner/repo/pulls/123` → `https://github.com/owner/repo/pull/123`
- **CI runs:** use `run.html_url` directly
- **Activity events:** construct from event payload (`pull_request.html_url`, `issue.html_url`, `comment.html_url`, or commit SHA)

### 5. Make card titles clickable (`src/components/cards/*.tsx`, `Card.module.css`)

- Wrap the title `<p>` content in `<a href={item.url} target="_blank" rel="noreferrer">` in all five card components
- Add `.cardTitleLink` CSS class: inherits color by default, underlines and applies `--color-accent` on hover
