# Context

gh-deck needs secure OAuth for a publicly hosted web app with best-practice UX. The approach:

- **Authorization Code flow** with a **GitHub App** — standard redirect UX ("Sign in with GitHub" → GitHub authorize page → back to app)
- **One Cloudflare Pages Function** (`/api/exchange-code`) to exchange the authorization code for tokens using the `client_secret` (which must stay server-side)
- **Second Cloudflare Pages Function** (`/api/refresh-token`) to refresh expired tokens (GitHub App tokens expire in ~8 hours; refresh tokens valid 30 days)
- **Service Worker**: holds the token in SW memory (never in localStorage/page JS), intercepts `api.github.com` requests to inject Authorization header
- The device flow setup is replaced entirely
- `tokenStorage.ts`, `deviceFlow.ts`, and `useDeviceFlow.ts` are deleted

Uses a **GitHub App** (not OAuth App): user tokens expire (~8 hours) and are refreshed automatically by the Service Worker using a refresh token. This avoids a future migration and gives users better permission granularity.

---

## Auth flow

```
1. User clicks "Sign in with GitHub"
2. Page generates random `state` (CSRF), stores in sessionStorage
3. Browser redirects to:
   https://github.com/login/oauth/authorize
     ?client_id=...
     &redirect_uri=https://gh-deck.example.com/callback
     &scope=repo read:user security_events
     &state=<random>

4. GitHub redirects back to /callback?code=...&state=...

5. Callback: verify state matches sessionStorage; clear it
6. Callback: POST /api/exchange-code { code, redirect_uri }
7. CF Pages Function: POST github.com/login/oauth/access_token
     { client_id, client_secret, code, redirect_uri }
   Returns { access_token, refresh_token, expires_in } to page

8. Page posts { type: "SET_TOKENS", accessToken, refreshToken, expiresAt } to SW
9. SW stores token in SW-scope memory
10. Page calls authStore.authSuccess() → status = "authed"

11. On every api.github.com request: SW injects Authorization header
12. If token within 5 min of expiry → SW calls refreshTokens() first
13. On 401: SW tries refresh; if that fails, clears tokens + posts { type: "AUTH_EXPIRED" } to all clients
14. Page calls logOut() → status = "idle", auth modal opens
```

No PKCE needed since the code exchange happens server-side (CF function holds the client_secret).

---

## Status: COMPLETE

All files have been created/modified. The implementation is working.

---

## Files created

- `src/sw.ts` — Service Worker (token storage in SW memory, fetch interception, proactive refresh 5 min before expiry)
- `src/auth/oauthFlow.ts` — auth URL redirect + code exchange utilities + `consumeOAuthState()`
- `src/components/Callback.tsx` — post-redirect handler (state check, code exchange, SW handoff)
- `functions/api/exchange-code.ts` — CF Pages Function: code → tokens
- `functions/api/refresh-token.ts` — CF Pages Function: refresh_token → new tokens
- `functions/tsconfig.json` — CF Worker TS config (target ES2022, no DOM)
- `public/_redirects` — `/* /index.html 200` for SPA routing on Cloudflare Pages
- `wrangler.toml` — CF Pages config (`name = "octodeck"`, `pages_build_output_dir = "dist"`)
- `.dev.vars.example` — documents `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ALLOWED_ORIGIN`

## Files modified

- `src/store/authStore.ts` — removed device flow fields + token; added `sessionId` (UUID per session), SW messaging in `logOut()`
- `src/store/githubClient.ts` — dropped `token` param (SW injects header); added `UnauthorizedError`
- `src/store/githubQueries.ts` — all hooks: `token` → `sessionId` (cache key only, not credential); added `checkOk()` helper; throws `UnauthorizedError` on 401
- `src/hooks/useColumnData.ts` — `token` → `sessionId`
- `src/components/App.tsx` — SW registration + `GET_STATUS` init check, `SWRConfig` onError, `AUTH_EXPIRED` listener, `/callback` path detection
- `src/components/AuthModal.tsx` — replaced device flow UI with single "Sign in with GitHub" button
- `src/components/Topbar.tsx` — `s.token` → `s.sessionId`
- `src/components/ColumnSettingsModal.tsx` — `s.token` → `s.sessionId`
- `vite.config.ts` — added `serviceWorkerDevPlugin()` (serves `src/sw.ts` at `/sw.js` in dev with `Service-Worker-Allowed: /`); added `build.rollupOptions.input.sw` to emit `dist/sw.js` at root; changed proxy from `/github-oauth` to `/api`
- `package.json` — added `"dev:api": "wrangler pages dev dist --port 8788"`; added `wrangler` + `@cloudflare/workers-types` devDependencies

## Files deleted

- `src/store/tokenStorage.ts`
- `src/auth/deviceFlow.ts`
- `src/auth/useDeviceFlow.ts`
- `test/auth/deviceFlow.test.ts`
- `test/auth/useDeviceFlow.test.ts`
- `test/store/tokenStorage.test.ts`

---

## Key technical decisions

- **SW scope**: SW must be registered at `/sw.js` (not `/src/sw.ts`) so its scope covers `/`. A Vite dev plugin transforms `src/sw.ts` and serves it at `/sw.js` with `Service-Worker-Allowed: /`. Production build emits `dist/sw.js` at root via Rollup named entry.
- **`navigator.serviceWorker.ready` vs `.controller`**: `.controller` is null on first page load before SW claims the page. Callback uses `navigator.serviceWorker.ready` then falls back to `reg.active` to ensure `SET_TOKENS` message is delivered.
- **`sessionId`**: random UUID generated on `authSuccess()`, used as SWR cache key instead of token. Provides cache busting on re-login without exposing the token to React.
- **`fail()` in Callback**: calls `window.history.replaceState({}, '', '/')` before `setError()` so the browser leaves `/callback` before App re-renders, avoiding an infinite Callback render loop.

---

## Dev setup

1. Create a GitHub App at github.com/settings/apps/new
   - Callback URL: `http://localhost:5173/callback` (and your prod URL)
   - Permissions: Contents (read), Pull requests (read), Checks (read), Deployments (read), Metadata (read), Security events (read)
   - Check "Expire user authorization tokens"
2. Copy `.dev.vars.example` to `.dev.vars` and fill in `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ALLOWED_ORIGIN=http://localhost:5173`
3. Add `VITE_GITHUB_CLIENT_ID=<your client id>` to `.env.local`
4. Run `npm run build` first (wrangler needs the dist to exist)
5. In terminal 1: `npm run dev`
6. In terminal 2: `npm run dev:api`

---

## Verification

1. Click "Sign in with GitHub" → redirected to github.com/login/oauth/authorize
2. After authorizing → redirected to `/callback?code=...&state=...`
3. State matches sessionStorage → exchange-code CF function called → tokens received
4. DevTools → Application → Service Workers: SW registered and active
5. DevTools → Application → Local Storage / Session Storage: no access token (only the ephemeral `state` before cleared)
6. Network tab: API calls go to `api.github.com` with `Authorization` header (added by SW)
7. Wait for token expiry → SW calls `/api/refresh-token` automatically
8. Revoke GitHub App installation → trigger column refresh → auth modal opens automatically
9. Sign out → `CLEAR_TOKENS` posted → reloading shows auth modal
