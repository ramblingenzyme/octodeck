# Fix Auth: Login Modal Not Showing + Logout Not Persisting

## Context

Two auth bugs:

1. **Login modal never shows on first load (private window / deployed site)**: `useAuth`'s `useEffect` calls `fetchSession()` on mount. On failure it calls `authFailed()` (sets status to `"idle"`) but never calls `modal.open()`. Since `modal` was initialized with `useModal(false)` (status was `"loading"` at init, not `"idle"`), the modal stays closed indefinitely.

2. **Logout doesn't persist across reload**: `handleSignOut` only clears the in-memory token via `logOut()` and opens the modal. The `__Host-session` and `__Host-csrf` HttpOnly cookies are never cleared. On page refresh, `fetchSession()` succeeds (cookie still valid) and the user is silently re-authenticated.

## Files to Modify

- `src/hooks/useAuth.ts` — fix login modal not showing; add server-side logout call
- `src/auth/oauthFlow.ts` — add `logoutSession()` fetch helper
- `functions/api/logout.ts` — new endpoint to clear session cookies

## Implementation

### 1. `functions/api/logout.ts` (new)

`POST /api/logout` — validates CSRF, then clears `__Host-session` and `__Host-csrf` cookies:

```ts
import { checkCsrf } from "./_csrf";

export const onRequestPost = async ({ request, env }) => {
  const forbidden = checkCsrf(request, env);
  if (forbidden) return forbidden;

  return new Response(null, {
    status: 204,
    headers: new Headers([
      ["Set-Cookie", `__Host-session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`],
      ["Set-Cookie", `__Host-csrf=; Secure; SameSite=Strict; Path=/; Max-Age=0`],
    ]),
  });
};
```

### 2. `src/auth/oauthFlow.ts`

Add `logoutSession()`:

```ts
export async function logoutSession(): Promise<void> {
  await fetch("/api/logout", {
    method: "POST",
    headers: { "X-GitHub-App-CSRF": getCSRFHeaderValue() },
  });
}
```

(No error thrown on failure — best-effort cookie clearing.)

### 3. `src/hooks/useAuth.ts`

- In the `.catch()` block of the mount effect, add `modal.open()` after `authFailed()`.
- In `handleSignOut`, call `logoutSession()` before `logOut()` (fire-and-forget is fine).

```ts
// in useEffect catch:
.catch(() => {
  authFailed();
  modal.open();
});

// handleSignOut:
const handleSignOut = () => {
  void logoutSession();
  logOut();
  modal.open();
};
```

## Verification

1. Open the app in a private window (no cookies) → login modal should appear immediately.
2. Sign in → verify authenticated state.
3. Click "Sign out" → modal appears.
4. Refresh the page → login modal appears again (session cookie cleared).
