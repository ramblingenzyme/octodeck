// Store the ESM preact/compat on globalThis so the CJS react shim can reference
// the same module instance as the component tree (avoiding the "multiple preact
// instances" / __H undefined error when react-redux's CJS deps call hooks).
import * as preactCompat from "preact/compat";

declare global {
  var __preactCompat: typeof preactCompat | undefined;
}

globalThis.__preactCompat = preactCompat;
