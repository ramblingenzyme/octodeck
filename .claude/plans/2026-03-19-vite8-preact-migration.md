# Vite 8 upgrade + Preact migration

## What was done

Replaced React 19 with Preact 10 throughout the codebase, upgraded Vite 6 → 8, and fixed
all tests that were blocked by a CJS/ESM module-instance split.

## Part 1 — Preact migration

### Packages

| Removed | Added |
|---------|-------|
| `react`, `react-dom` | `preact` |
| `@testing-library/react` | `@testing-library/preact` |
| `@types/react`, `@types/react-dom` | — |
| `@vitejs/plugin-react` | `@preact/preset-vite` |

`react-redux` stays — it works with Preact via the `preact/compat` shim.

### Source imports

All `import … from 'react'` → `import … from 'preact/hooks'` (hooks) or `from 'preact'`
(Component etc.). Affected files: every hook in `src/hooks/`, every component in
`src/components/`, and `src/auth/useDeviceFlow.ts`.

Notable: Preact's synthetic events don't widen `e.target` automatically, so
`e.target.value` needed explicit casts to `(e.target as HTMLInputElement).value` in
`AddColumnModal.tsx` and similar.

### `src/main.tsx`

Switched from `ReactDOM.createRoot().render()` to Preact's `render()`:

```tsx
// before
ReactDOM.createRoot(root).render(<React.StrictMode><Provider …><App /></Provider></React.StrictMode>)

// after
render(<Provider store={store}><App /></Provider>, root)
```

`React.StrictMode` removed — Preact has no equivalent (and no need for one).

### `tsconfig.app.json`

Added `jsxImportSource: "preact/compat"` and TypeScript path aliases so the compiler
resolves `react` / `react-dom` imports to preact/compat types:

```json
"jsxImportSource": "preact/compat",
"paths": {
  "@/*": ["./src/*"],
  "react": ["./node_modules/preact/compat/"],
  "react-dom": ["./node_modules/preact/compat/"],
  "react-dom/client": ["./node_modules/preact/compat/client"]
}
```

### Test files

All test imports of `@testing-library/react` → `@testing-library/preact`. `act()`
wrapping in `useRefreshSpinner.test.ts` updated from expression form to block form
(`act(() => { … })`) to satisfy Preact testing library's stricter requirement.

---

## Part 2 — Vite 8 upgrade

`vite@^6.3.1` → `vite@^8.0.1`. Vitest 4.1.0 was already current and supports Vite 8.

Reinstalled `@preact/preset-vite` — this picked up the upstream fix for a `this.meta`
crash in the plugin's `config` hook that had required a manual `node_modules` patch.

---

## Part 3 — Fixing tests (CJS/ESM Preact instance split)

### Root cause

`react-redux` → `use-sync-external-store` does a CJS `require('react')` at runtime.
Vite's alias system, `server.deps.inline`, `vi.mock`, and similar config options all
operate at the Vite/ESM layer and cannot intercept a raw Node.js `require()` call made
from within a CJS module.

Even after replacing `node_modules/react` with a shim re-exporting `preact/compat`,
tests still crashed with `Cannot read properties of undefined (reading '__H')`. This is
the Preact "multiple instances" error: CJS `require('preact/compat')` loads the **CJS
build** of preact/compat → CJS preact/hooks, which has its own `currentComponent` global,
separate from the **ESM** `currentComponent` used by the Preact renderer running the test
component tree.

### Fix A — `shims/react/` local npm package

```
shims/react/
  package.json   name: "react", exports: { import: index.mjs, require: index.cjs }
  index.mjs      export * from 'preact/compat'; export { default } from 'preact/compat'
  index.cjs      module.exports = globalThis.__preactCompat ?? require('preact/compat')
```

Installed as `"react": "file:./shims/react"` in `package.json` dependencies. This makes
every `require('react')` — at any depth in the dep tree — resolve to our shim via Node.js
module resolution, with no Vite involvement.

The ESM shim (`index.mjs`) is what Vite uses for the build and for ESM imports in tests.
The CJS shim (`index.cjs`) is what Node.js's `require()` calls hit — and it reads from a
globalThis bridge (see below) instead of loading a second CJS preact/compat instance.

### Fix B — `src/test/setup.ts` Vitest setupFile

```ts
import * as preactCompat from 'preact/compat';

declare global {
  var __preactCompat: typeof preactCompat | undefined;
}

globalThis.__preactCompat = preactCompat;
```

Vitest's `setupFiles` runs this before each worker starts. It imports `preact/compat` via
ESM (the same path as the component tree) and stores it on `globalThis`. The CJS shim then
reads `globalThis.__preactCompat` instead of calling `require('preact/compat')`, ensuring
all hook calls share the same closure over ESM `currentComponent`.

### Fix C — `vite.config.ts`

```ts
const srcPath = resolve(__dirname, './src');   // shared constant for both aliases

export default defineConfig({
  plugins: [preact()],                          // @preact/preset-vite
  test: {
    environment: 'happy-dom',
    pool: 'vmThreads',                          // each worker gets isolated globalThis
    alias: [{ find: '@', replacement: srcPath }],
    setupFiles: ['src/test/setup.ts'],
  },
  resolve: {
    alias: [{ find: '@', replacement: srcPath }],
  },
});
```

`vmThreads` gives each worker an isolated V8 context (own `globalThis`) and is lighter
than `vmForks`. The `@` alias is defined once and shared between test and build configs.

---

## Result

```
npm run build   # 162KB / 54KB gzip, zero errors (down from 168KB with React)
npm test        # 113/113 pass
npm run lint    # 0 warnings, 0 errors
```
