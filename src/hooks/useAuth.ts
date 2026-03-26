import { useEffect } from "preact/hooks";
import { useModal } from "@/hooks/useModal";
import { useAuthStore } from "@/store/authStore";
import { UnauthorizedError, setToken } from "@/auth/token";
import { fetchSession, logoutSession } from "@/auth/oauthFlow";
import { isDemo } from "@/env";

export const useAuth = () => {
  const authStatus = useAuthStore((s) => s.status);
  const authSuccess = useAuthStore((s) => s.authSuccess);
  const authFailed = useAuthStore((s) => s.authFailed);
  const logOut = useAuthStore((s) => s.logOut);
  const modal = useModal(!isDemo && authStatus === "idle");

  // Bootstrap session from the HttpOnly session cookie on mount.
  // Also fires after the /api/callback redirect lands on /?authed=1.
  useEffect(() => {
    if (isDemo) {
      authFailed();
      return;
    }
    // Clean up the ?authed=1 query param without a navigation.
    if (new URLSearchParams(window.location.search).has("authed")) {
      window.history.replaceState({}, "", "/");
    }
    fetchSession()
      .then((t) => {
        setToken(t.accessToken, t.expiresAt);
        authSuccess();
      })
      .catch(() => {
        authFailed();
        modal.open();
      });
  }, [authSuccess, authFailed]);

  const handleSignOut = () => {
    void logoutSession();
    logOut();
    modal.open();
  };

  const onSWRError = (err: unknown) => {
    if (err instanceof UnauthorizedError) {
      logOut();
      modal.open();
    }
  };

  return {
    isLoading: authStatus === "loading",
    modalOpen: modal.isOpen && authStatus !== "authed",
    onSignIn: modal.open,
    onSignOut: handleSignOut,
    onDemoMode: () => {
      window.location.href = "/demo";
    },
    onModalClose: modal.close,
    onSWRError,
  };
};
