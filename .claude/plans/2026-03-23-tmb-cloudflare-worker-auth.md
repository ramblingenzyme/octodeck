# Token-Mediating Backend (TMB) — Cloudflare Workers Auth

## Context

The previous architecture had two problems:
1. `functions/api/exchange-code.ts` and `functions/api/refresh-token.ts` forwarded the OAuth code exchange to GitHub with `client_secret` — the Pages Function was a thin proxy with no real confidentiality.
2. The refresh token was stored in IndexedDB (accessible to page JS in the same origin) via a service worker.

The TMB pattern moves all sensitive token handling server-side. The Worker owns PKCE generation, the OAuth code exchange, and encrypts tokens into an `HttpOnly` session cookie. The frontend receives only a short-lived access token stored in a module-level variable, and calls `api.github.com` directly.

The **service worker was removed**: its only remaining benefit under TMB (XSS isolation of the access token) is marginal for short-lived GitHub tokens with limited scopes. Its responsibilities were replaced by a `githubFetch` wrapper and a module-level token store in `src/auth/token.ts`.

---

## Files Created

### `functions/api/_crypto.ts`
AES-GCM encrypt/decrypt helpers and `parseCookie` utility using `crypto.subtle`. Produces `iv:ciphertext` base64url tokens. All `Uint8Array` buffers must be typed as `Uint8Array<ArrayBuffer>` (not `ArrayBufferLike`) to satisfy TypeScript's `SubtleCrypto` overloads.

### `functions/api/_csrf.ts`
`checkCsrf(request, env)` — requires `X-GitHub-App-CSRF: 1` header, and checks `Origin` only when present (same-origin requests omit `Origin`; cross-origin requests always include it, so wrong origins are still blocked).

### `functions/api/login.ts`
Generates PKCE `code_verifier` + `state`, derives `code_challenge` via SHA-256, encrypts both into `__Host-pkce` cookie (`HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`), redirects to GitHub OAuth. Uses `ALLOWED_ORIGIN` (not `request.url`) for `redirect_uri` so the Vite dev proxy port (`5173`) is used locally rather than the Wrangler port (`8788`).

### `functions/api/callback.ts`
Reads `code`+`state` from query params, decrypts `__Host-pkce` cookie, verifies state, exchanges code+verifier with GitHub server-side, encrypts session into `__Host-session` cookie (`HttpOnly; Secure; SameSite=Strict; Path=/`), clears `__Host-pkce`, redirects to `ALLOWED_ORIGIN/?authed=1`. Also uses `ALLOWED_ORIGIN` for `redirect_uri` echo to GitHub.

### `functions/api/session.ts`
CSRF-guarded `GET`. Decrypts `__Host-session` and returns `{accessToken, expiresAt}`. Never exposes `refreshToken`.

### `functions/api/refresh.ts`
CSRF-guarded `POST`. Decrypts `__Host-session`, exchanges `refreshToken` with GitHub, re-encrypts updated session into a new `__Host-session` cookie, returns `{accessToken, expiresAt}`.

### `src/auth/token.ts`
Module-level token store (`accessToken`, `expiresAt`) + `githubFetch` wrapper. Handles proactive refresh (5-min buffer), Authorization header injection, 401 retry, and refresh deduplication via a promise singleton. Exports `UnauthorizedError`, `setToken`, `clearToken`, `hasToken`, `githubFetch`.

### `test/functions/_helpers.ts`, `_crypto.test.ts`, `csrf.test.ts`, `session.test.ts`, `login.test.ts`
Security test suite covering: encrypt/decrypt round-trip, tamper detection, CSRF enforcement (missing header → 403, wrong origin → 403, absent origin → allowed), session cookie encryption (not plaintext), secret leakage, PKCE uniqueness. Tests use a `mockRequest` plain-object stub to bypass browser forbidden-header restrictions (`Origin`, `Cookie`) in happy-dom.

---

## Files Deleted

- `functions/api/exchange-code.ts`
- `functions/api/refresh-token.ts`
- `src/sw.ts`
- `src/components/Callback.tsx`

---

## Files Modified

### `wrangler.toml`
Added `compatibility_flags = ["nodejs_compat"]`.

### `src/auth/oauthFlow.ts`
- `redirectToGitHub()` → navigates to `/api/login` (no args)
- `fetchSession()` — `GET /api/session` with `X-GitHub-App-CSRF: 1`
- `refreshSession()` — `POST /api/refresh` with same header
- Removed `exchangeCode()`, `consumeOAuthState()`

### `src/components/App.tsx`
- Removed SW registration and `AUTH_EXPIRED`/`GET_STATUS` message listeners
- On mount: calls `fetchSession()` → `setToken()` → `authSuccess()`; cleans up `?authed=1` from URL
- Imports `UnauthorizedError` and `setToken` from `@/auth/token`

### `src/store/authStore.ts`
- `logOut()` and `authExpired()` call `clearToken()` instead of posting to the SW
- `sessionId` retained (used as SWR cache-bust key throughout `githubQueries.ts` and components)

### `src/store/githubQueries.ts`, `src/components/AuthModal.tsx`
Updated imports from deleted `githubClient.ts` to `@/auth/token` directly.

### `vite.config.ts`
Removed SW dev plugin and SW rollup entry point.

---

## Secrets

Stored in `.dev.vars` for local dev (gitignored), provisioned via `wrangler secret put` for production:

| Secret | Notes |
|---|---|
| `GITHUB_CLIENT_ID` | OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | OAuth App client secret |
| `SESSION_CRYPTO_KEY` | 32-byte base64url key: `openssl rand -base64 32 \| tr '+/' '-_' \| tr -d '='` |
| `ALLOWED_ORIGIN` | Frontend origin (`http://localhost:5173` locally, Pages domain in prod) |

GitHub OAuth App callback URL must be set to `{ALLOWED_ORIGIN}/api/callback`.

---

## Key Design Decisions

- **`redirect_uri` from `ALLOWED_ORIGIN`**: Wrangler Pages dev runs on port 8788, Vite on 5173. Using `request.url` would give the wrong port; `ALLOWED_ORIGIN` always gives the correct frontend origin.
- **`Origin` check only when present**: Same-origin `fetch` calls omit the `Origin` header. Requiring it would block the frontend's own `/api/session` call. Cross-origin requests always include it, so the check still blocks foreign origins.
- **`sessionId` kept in `authStore`**: Used as a SWR cache-bust key — queries key on `sessionId` so they refetch when the user signs out and back in.
- **`PagesFunction<Env>` replaced with inline types**: Avoids importing `@cloudflare/workers-types` in the test tsconfig (which transitively picks up function files via `test/functions/` imports).
