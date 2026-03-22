# Context

The `notifications` column type is incompatible with GitHub App user access tokens. The GitHub API endpoint `GET /notifications` explicitly does not support GitHub App user access tokens, installation access tokens, or fine-grained personal access tokens — only Classic PATs. Since gh-deck now uses GitHub App auth, this column can never work.

**Decision**: remove the notifications column type entirely from the codebase.

---

## Status: COMPLETE

All changes applied. Build passes, all 246 tests pass.

---

## Files modified

- `src/types/index.ts` — removed `"notifications"` from `ColumnType` union; removed `NotifType` type; removed `NotifItem` interface; removed `NotifItem` from `KnownItem` union
- `src/constants/index.ts` — removed `NotifType` import; removed `NOTIF_ICONS` constant; removed `notifications` entry from `COLUMN_TYPES`; removed notifications column from `DEFAULT_COLUMNS`
- `src/types/github.ts` — removed `GHNotification` interface
- `src/store/githubMappers.ts` — removed `mapNotification`, `REASON_TO_NOTIF`, `apiUrlToHtmlUrl`; removed `NotifItem`, `NotifType`, `GHNotification` imports
- `src/store/githubQueries.ts` — removed `useGetNotifications`; removed `NotifItem`, `GHNotification`, `mapNotification` imports
- `src/hooks/useColumnData.ts` — removed `useGetNotifications` import + call; removed `MOCK_NOTIFS` import; removed `notifications` from `DEMO_DATA_MAP`; removed `notifications` case from switch
- `src/components/Column.tsx` — removed `NotifColumn` lazy import; removed `notifications` case from switch
- `src/components/AddColumnModal.tsx` — removed `notifStyles` import; removed `notifications` from `ACCENT_CLASS`
- `src/demo/mock.ts` — removed `NotifItem` import; removed `MOCK_NOTIFS` array
- `test/components/App.e2e.test.tsx` — removed "Inbox" references; updated column count from 5 to 4
- `test/components/Column.test.tsx` — removed notifications column render test
- `test/store/configApi.test.ts` — changed fixture column from `notifications` to `activity`
- `test/store/githubMappers.test.ts` — removed `mapNotification` import and all `mapNotification` tests
- `test/store/githubQueries.test.ts` — removed `GHNotification` import, `useGetNotifications` import, and all `useGetNotifications` tests
- `test/utils/getItemDisplayText.test.ts` — removed `NotifItem` import, `notifItem` fixture, and `NotifItem` test case

## Files deleted

- `src/components/cards/NotifCard.tsx`
- `src/components/cards/NotifCard.module.css`
- `src/components/columns/NotifColumn.tsx`
- `src/components/columns/NotifColumn.module.css`
