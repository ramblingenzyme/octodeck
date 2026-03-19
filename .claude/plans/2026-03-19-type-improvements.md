# Type Improvements Plan

## Context

Reviewing `src/types/index.ts` and related utilities for duplication, inconsistencies, and simplification opportunities. The goal is tighter, more reusable types without over-engineering.

## Issues Found

### 1. Duplicate `AnyItem` definition
`src/utils/getItemDisplayText.ts` defines its own local `type AnyItem = PRItem | IssueItem | CIItem | NotifItem | ActivityItem` instead of importing `KnownItem` from `@/types`. These are identical — pure duplication.

**Fix:** Remove the local type and use the imported `KnownItem`.

### 2. Inline literal unions not exported
Two literal unions are defined inline on interfaces but never exported, so they can't be referenced elsewhere without duplicating them:
- `IssueItem.state: "open" | "closed"` → export as `IssueState`
- `CIItem.triggered: "push" | "pull_request" | "release"` → export as `CITrigger`

**Fix:** Export named types and reference them in the interfaces.

## Files Modified

- `src/types/index.ts` — added `IssueState` and `CITrigger` exports; referenced them in `IssueItem` and `CIItem`
- `src/utils/getItemDisplayText.ts` — removed local `AnyItem`, imports and uses `KnownItem`

## Changes

### `src/types/index.ts`
```ts
export type IssueState = "open" | "closed";
export type CITrigger = "push" | "pull_request" | "release";

// IssueItem.state: IssueState
// CIItem.triggered: CITrigger
```

### `src/utils/getItemDisplayText.ts`
```ts
import type { KnownItem } from "@/types";
// remove local AnyItem; use KnownItem as parameter type
```

## Not Changed

- `queryFilter.ts` `'in' checks` + type casts — pragmatic and correct given the union shape; narrowing would require adding a discriminant field (`kind`) to every item type which is a larger refactor
- `FallbackItem` — its index signature is intentional for resilience
- `age: string` pre-formatted timestamps — out of scope

## Verification

- `npm run build` — passed with zero errors
- `npm run lint` — 0 warnings, 0 errors
