import { create } from "zustand";

export type AuthStatus = "idle" | "authed" | "error";

export interface AuthState {
  status: AuthStatus;
  sessionId: string | null;
  error: string | null;
  authSuccess: () => void;
  logOut: () => void;
  setError: (msg: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "idle",
  sessionId: null,
  error: null,

  authSuccess() {
    set({ status: "authed", sessionId: crypto.randomUUID(), error: null });
  },

  logOut() {
    navigator.serviceWorker.controller?.postMessage({ type: "CLEAR_TOKENS" });
    set({ status: "idle", sessionId: null, error: null });
  },

  setError(msg) {
    set({ status: "error", error: msg });
  },

  clearError() {
    set({ status: "idle", error: null });
  },
}));
