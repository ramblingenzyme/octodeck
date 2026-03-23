import { lazy, Suspense } from "preact/compat";
import { useEffect } from "preact/hooks";
import { SWRConfig } from "swr";
import { useModal } from "@/hooks/useModal";
import type { ColumnType } from "@/types";
import { useLayoutStore } from "@/store/layoutStore";
import { useAuthStore } from "@/store/authStore";
import { UnauthorizedError, setToken } from "@/auth/token";
import { fetchSession } from "@/auth/oauthFlow";
import { isDemoMode } from "@/env";
import { Topbar } from "./Topbar";
import { Board } from "./Board";

const AddColumnModal = lazy(() =>
  import("./AddColumnModal").then((m) => ({ default: m.AddColumnModal })),
);
const AuthModal = lazy(() => import("./AuthModal").then((m) => ({ default: m.AuthModal })));

export const App = () => {
  const columns = useLayoutStore((s) => s.columns);
  const addColumn = useLayoutStore((s) => s.addColumn);
  const removeColumn = useLayoutStore((s) => s.removeColumn);
  const addColumnModal = useModal();

  const authStatus = useAuthStore((s) => s.status);
  const authSuccess = useAuthStore((s) => s.authSuccess);
  const logOut = useAuthStore((s) => s.logOut);
  const authModal = useModal(!isDemoMode && authStatus === "idle");

  // Bootstrap session from the HttpOnly session cookie on mount.
  // Also fires after the /api/callback redirect lands on /?authed=1.
  useEffect(() => {
    if (isDemoMode) return;
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
        // No active session — auth modal will show.
      });
  }, [authSuccess]);

  const handleAddColumn = (type: ColumnType, title: string, query?: string) => {
    addColumn(type, title, query);
    addColumnModal.close();
  };

  const handleSignOut = () => {
    logOut();
    authModal.open();
  };

  return (
    <SWRConfig
      value={{
        onError: (err: unknown) => {
          if (err instanceof UnauthorizedError) {
            logOut();
            authModal.open();
          }
        },
      }}
    >
      <Topbar
        onAddColumn={() => addColumnModal.open()}
        onSignIn={() => authModal.open()}
        onSignOut={handleSignOut}
      />
      <Board
        columns={columns}
        onAddColumn={() => addColumnModal.open()}
        onRemove={(id) => removeColumn(id)}
      />
      <Suspense fallback={null}>
        <AddColumnModal
          open={addColumnModal.isOpen}
          onAdd={handleAddColumn}
          onClose={() => addColumnModal.close()}
        />
      </Suspense>
      <Suspense fallback={null}>
        <AuthModal
          open={authModal.isOpen && authStatus !== "authed"}
          onDemoMode={() => authModal.close()}
          onClose={() => authModal.close()}
        />
      </Suspense>
    </SWRConfig>
  );
};
