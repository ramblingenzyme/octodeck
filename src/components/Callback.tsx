import { useEffect } from "preact/hooks";
import { useAuthStore } from "@/store/authStore";
import { exchangeCode, consumeOAuthState } from "@/auth/oauthFlow";

export const Callback = () => {
  const authSuccess = useAuthStore((s) => s.authSuccess);
  const setError = useAuthStore((s) => s.setError);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const returnedState = params.get("state");
    const expectedState = consumeOAuthState();

    const fail = (msg: string) => {
      window.history.replaceState({}, "", "/");
      setError(msg);
    };

    if (!code) {
      fail("No authorization code received from GitHub.");
      return;
    }

    if (!returnedState || returnedState !== expectedState) {
      fail("OAuth state mismatch — possible CSRF. Please try signing in again.");
      return;
    }

    const redirectUri = `${window.location.origin}/callback`;

    exchangeCode(code, redirectUri)
      .then(async (tokens) => {
        // Use navigator.serviceWorker.ready so we get the active SW even if it
        // hasn't yet claimed this page (controller is null on first page load).
        const reg = await navigator.serviceWorker.ready;
        const sw = navigator.serviceWorker.controller ?? reg.active;
        sw?.postMessage({
          type: "SET_TOKENS",
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
        });
        window.history.replaceState({}, "", "/");
        authSuccess();
      })
      .catch((e: unknown) => {
        fail(e instanceof Error ? e.message : "Failed to complete sign-in.");
      });
  }, [authSuccess, setError]);

  return (
    <main
      style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh" }}
    >
      <p>Completing sign-in…</p>
    </main>
  );
};
