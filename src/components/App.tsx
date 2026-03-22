import { lazy, Suspense } from "preact/compat";
import { useEffect } from "preact/hooks";
import { SWRConfig } from "swr";
import { useModal } from "@/hooks/useModal";
import type { ColumnType } from "@/types";
import { useLayoutStore } from "@/store/layoutStore";
import { useAuthStore } from "@/store/authStore";
import { UnauthorizedError } from "@/store/githubClient";
import { isDemoMode } from "@/env";
import { Topbar } from "./Topbar";
import { Board } from "./Board";
import { Callback } from "./Callback";

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

  // Register SW and check for existing session
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/sw.js", { type: "module" }).then((reg) => {
      const sw = reg.active ?? reg.installing ?? reg.waiting;
      if (!sw) return;

      const checkStatus = (worker: ServiceWorker) => {
        const onMessage = (e: MessageEvent<{ type: string; authed: boolean }>) => {
          if (e.data.type === "AUTH_STATUS" && e.data.authed) {
            authSuccess();
          }
        };
        navigator.serviceWorker.addEventListener("message", onMessage, { once: true });
        worker.postMessage({ type: "GET_STATUS" });
      };

      if (sw.state === "activated") {
        checkStatus(sw);
      } else {
        sw.addEventListener("statechange", function onStateChange() {
          if (sw.state === "activated") {
            sw.removeEventListener("statechange", onStateChange);
            checkStatus(sw);
          }
        });
      }
    });
  }, [authSuccess]);

  // Listen for AUTH_EXPIRED from SW
  useEffect(() => {
    const onMessage = (e: MessageEvent<{ type: string }>) => {
      if (e.data.type === "AUTH_EXPIRED") {
        logOut();
        authModal.open();
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [logOut, authModal]);

  const handleAddColumn = (type: ColumnType, title: string, query?: string) => {
    addColumn(type, title, query);
    addColumnModal.close();
  };

  const handleSignOut = () => {
    logOut();
    authModal.open();
  };

  // Handle OAuth callback
  if (window.location.pathname === "/callback") {
    return <Callback />;
  }

  return (
    <SWRConfig
      value={{
        onError: (err: unknown) => {
          if (err instanceof UnauthorizedError) logOut();
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
