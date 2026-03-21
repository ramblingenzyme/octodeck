# Plan: Releases, Deployments & Security Alerts Column Types

## Context

Added three new column types to gh-deck to surface more GitHub signals beyond
the original five (PRs, Issues, CI, Notifications, Activity):

- **Releases** — latest releases across watched repos
- **Deployments** — deployment events with live status
- **Security Alerts** — open Dependabot vulnerability alerts

Each follows the established pattern: discriminated union type → item interface →
mock data → GitHub API query hook → mapper → column component → card component → CSS.

---

## New Item Types (`src/types/index.ts`)

Extended `ColumnType` union with `"releases" | "deployments" | "security"`.

Added new types:
- `DeploymentStatus` — `"success" | "failure" | "pending" | "in_progress"`
- `AlertSeverity` — `"critical" | "high" | "medium" | "low"`

Added new interfaces:
- `ReleaseItem` — `{ id, repo, tag, name, prerelease, age, url }`
- `DeploymentItem` — `{ id, repo, environment, status, ref, creator, age, url }`
- `SecurityItem` — `{ id, repo, package, severity, summary, age, url }`

Extended `KnownItem` union to include all three.

---

## New Icons (`src/components/ui/icons/`)

Created `ShieldIcon.tsx` and `RocketIcon.tsx`. Added both to `SvgIcon.tsx`
and the `IconName` union in `types/index.ts`.

---

## Constants (`src/constants/index.ts`)

Added to `COLUMN_TYPES`:
- `releases` — icon: `tag`, accent: `#34d399` (emerald)
- `deployments` — icon: `rocket`, accent: `#60a5fa` (blue)
- `security` — icon: `shield`, accent: `#f87171` (red)

Added `DEPLOYMENT_STATUS` map (mirrors `CI_STATUS` pattern).
Added `SEVERITY_ORDER` map for sorting alerts by severity.

---

## GitHub Raw Types (`src/types/github.ts`)

Added `GHRelease`, `GHDeployment`, `GHDeploymentStatus`, `GHDependabotAlert`.

---

## Mappers (`src/store/githubMappers.ts`)

Added `mapRelease`, `mapDeployment`, `mapDependabotAlert`.

---

## Query Hooks (`src/store/githubQueries.ts`)

All three use the same repo-list pattern as `useGetCIRuns` — repos are
extracted from `col.query` tokens (e.g. `repo:owner/repo`).

- `useGetReleases(repos, token)` — `GET /repos/{repo}/releases?per_page=10`
- `useGetDeployments(repos, token)` — `GET /repos/{repo}/deployments` + per-deployment status fetch
- `useGetSecurityAlerts(repos, token)` — `GET /repos/{repo}/dependabot/alerts?state=open`

All poll at `POLL` (5 min).

---

## Column Data Hook (`src/hooks/useColumnData.ts`)

- Added `MOCK_RELEASES`, `MOCK_DEPLOYMENTS`, `MOCK_SECURITY` to `DEMO_DATA_MAP`
- Added three hook calls (gated on `col.type`)
- Added three cases to the switch

---

## Components

| File | Purpose |
|------|---------|
| `src/components/columns/ReleasesColumn.tsx` + `.module.css` | Column wrapper, emerald accent |
| `src/components/columns/DeploymentsColumn.tsx` + `.module.css` | Column wrapper, blue accent |
| `src/components/columns/SecurityColumn.tsx` + `.module.css` | Column wrapper, red accent |
| `src/components/cards/ReleaseCard.tsx` + `.module.css` | Tag + name + pre-release badge |
| `src/components/cards/DeploymentCard.tsx` + `.module.css` | Environment + ref/creator + status badge |
| `src/components/cards/SecurityCard.tsx` + `.module.css` | Package + severity badge + summary |

`DeploymentCard` mirrors `CICard` style (color-coded via CSS custom property + `color-mix`).
`SecurityCard` uses the same badge pattern with severity-keyed CSS classes.

---

## Other Modified Files

- `src/components/Column.tsx` — three new lazy-loaded cases
- `src/components/AddColumnModal.tsx` — accent class entries for three new types
- `src/utils/getItemDisplayText.ts` — extended to handle `DeploymentItem` and `SecurityItem`
- `src/test/fixtures/mock.ts` — added `MOCK_RELEASES` (4), `MOCK_DEPLOYMENTS` (4), `MOCK_SECURITY` (4)
