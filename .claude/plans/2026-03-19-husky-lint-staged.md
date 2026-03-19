# Plan: Setup Husky & lint-staged for Pre-commit Hooks

## Context

The project has linting (oxlint), formatting (oxfmt), and tests (vitest) already configured but no pre-commit enforcement. Adding husky + lint-staged ensures code quality gates run automatically before every commit, catching issues early without requiring developers to remember to run them manually.

## What was implemented

### Dependencies installed

```bash
npm install --save-dev husky lint-staged
npx husky init
```

### `package.json` — lint-staged config

```json
"lint-staged": {
  "src/**/*.{ts,tsx}": [
    "oxfmt",
    "oxlint",
    "vitest run --related"
  ]
}
```

- `oxfmt` formats staged files in-place before lint sees them
- `oxlint` lints staged files only
- `vitest run --related` runs only tests related to the staged files (vitest traces imports to find affected tests); lint-staged appends the staged file paths automatically

### `.husky/pre-commit`

```sh
lint-staged
```

- Calls `lint-staged` directly (no `npx`) — husky v9 hooks run with `node_modules/.bin` in PATH
- lint-staged handles format, lint, and related tests in one step

## Key decisions

- **No `npx`**: husky v9 adds `node_modules/.bin` to PATH in hook scripts, so `npx` overhead is unnecessary
- **Tests inside lint-staged**: `vitest run --related` accepts file paths as arguments, so lint-staged can pass staged files and vitest will run only affected tests — faster than running the full suite on every commit
