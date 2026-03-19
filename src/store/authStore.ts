import { create } from "zustand";
import { loadToken, saveToken, clearToken } from "./tokenStorage";

export type AuthStatus = "idle" | "polling" | "authed" | "error";

export interface AuthState {
  status: AuthStatus;
  token: string | null;
  deviceCode: string | null;
  userCode: string | null;
  verificationUri: string | null;
  expiresAt: number | null;
  interval: number;
  error: string | null;
  deviceCodeReceived: (payload: {
    deviceCode: string;
    userCode: string;
    verificationUri: string;
    expiresIn: number;
    interval: number;
  }) => void;
  tokenReceived: (token: string) => void;
  logOut: () => void;
  setError: (msg: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: loadToken() ? "authed" : "idle",
  token: loadToken(),
  deviceCode: null,
  userCode: null,
  verificationUri: null,
  expiresAt: null,
  interval: 5,
  error: null,

  deviceCodeReceived({ deviceCode, userCode, verificationUri, expiresIn, interval }) {
    set({
      status: "polling",
      deviceCode,
      userCode,
      verificationUri,
      expiresAt: Date.now() + expiresIn * 1000,
      interval,
      error: null,
    });
  },

  tokenReceived(token) {
    saveToken(token);
    set({
      status: "authed",
      token,
      deviceCode: null,
      userCode: null,
      verificationUri: null,
      expiresAt: null,
    });
  },

  logOut() {
    clearToken();
    set({
      status: "idle",
      token: null,
      deviceCode: null,
      userCode: null,
      verificationUri: null,
      expiresAt: null,
      error: null,
    });
  },

  setError(msg) {
    set({ status: "error", error: msg });
  },

  clearError() {
    set({ status: "idle", error: null });
  },
}));
