# Plan: Remove Security Alerts column

## Context

The Security Alerts column calls `/repos/{owner}/{repo}/dependabot/alerts` via a GitHub App user access token. GitHub App user tokens cannot access Dependabot alerts — the endpoint only works with installation access tokens, classic PATs with `security_events` scope, or fine-grained PATs with "Dependabot alerts: read". Even with the "Dependabot alerts: read" permission configured on the GitHub App, the user authorization flow produces user access tokens which are rejected with "Resource not accessible by integration" (403).

The fix requires proxying through the Cloudflare Worker using an installation token (significant backend work). Until then, the column is non-functional and misleading, so it is removed entirely.

---

## Files modified

| File                                | Change                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/types/index.ts`                | Removed `"security"` from `ColumnType`, removed `SecurityItem` interface and `AlertSeverity` type                                                |
| `src/constants/index.ts`            | Removed `security` entry from `COLUMN_TYPES`, removed `"security"` from `MULTI_REPO_COLUMN_TYPES`                                                |
| `src/components/Column.tsx`         | Removed `case "security"` and `SecurityColumn` import                                                                                            |
| `src/components/AddColumnModal.tsx` | Removed `securityStyles` import and `security` entry from `ACCENT_CLASS`                                                                         |
| `src/hooks/useColumnData.ts`        | Removed `MOCK_SECURITY` import, `useGetSecurityAlerts` import, `security` entry from demo map, `securityResult` hook call, and `case "security"` |
| `src/store/githubQueries.ts`        | Removed `useGetSecurityAlerts` function and related imports                                                                                      |
| `src/store/githubMappers.ts`        | Removed `mapDependabotAlert` function and related imports                                                                                        |
| `src/types/github.ts`               | Removed `GHDependabotAlert` interface                                                                                                            |
| `src/demo/mock.ts`                  | Removed `MOCK_SECURITY` array and `SecurityItem` import                                                                                          |

## Files deleted

- `src/components/cards/SecurityCard.tsx`
- `src/components/cards/SecurityCard.module.css`
- `src/components/columns/SecurityColumn.tsx`
- `src/components/columns/SecurityColumn.module.css`

## Tests updated

- `test/store/githubMappers.test.ts` — removed `mapDependabotAlert` tests
- `test/store/githubQueries.test.ts` — removed `useGetSecurityAlerts` tests
- `test/utils/getItemDisplayText.test.ts` — removed `SecurityItem` test case

---

## Verification

- `npm test` — all 324 tests pass
- Security Alerts no longer appears in the Add Column modal
- Existing security columns in localStorage will silently render nothing (hit the switch default)
