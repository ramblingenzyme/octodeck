// Use the ESM preact/compat instance stored by src/test/setup.ts, so that
// CJS packages (use-sync-external-store, react-redux) share the same
// currentComponent global as the Preact renderer.
module.exports = globalThis.__preactCompat ?? require('preact/compat');
