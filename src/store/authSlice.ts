import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { loadToken, saveToken, clearToken } from './tokenStorage';

export type AuthStatus = 'idle' | 'polling' | 'authed' | 'error';

export interface AuthUser {
  login: string;
  avatarUrl: string;
  name: string | null;
}

export interface AuthState {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
  deviceCode: string | null;
  userCode: string | null;
  verificationUri: string | null;
  expiresAt: number | null;
  interval: number;
  error: string | null;
}

const initialState: AuthState = {
  status: loadToken() ? 'authed' : 'idle',
  token: loadToken(),
  user: null,
  deviceCode: null,
  userCode: null,
  verificationUri: null,
  expiresAt: null,
  interval: 5,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    deviceCodeReceived(
      state,
      action: PayloadAction<{
        deviceCode: string;
        userCode: string;
        verificationUri: string;
        expiresIn: number;
        interval: number;
      }>,
    ) {
      state.status = 'polling';
      state.deviceCode = action.payload.deviceCode;
      state.userCode = action.payload.userCode;
      state.verificationUri = action.payload.verificationUri;
      state.expiresAt = Date.now() + action.payload.expiresIn * 1000;
      state.interval = action.payload.interval;
      state.error = null;
    },
    tokenReceived(state, action: PayloadAction<string>) {
      state.status = 'authed';
      state.token = action.payload;
      state.deviceCode = null;
      state.userCode = null;
      state.verificationUri = null;
      state.expiresAt = null;
      saveToken(action.payload);
    },
    userLoaded(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    logOut(state) {
      state.status = 'idle';
      state.token = null;
      state.user = null;
      state.deviceCode = null;
      state.userCode = null;
      state.verificationUri = null;
      state.expiresAt = null;
      state.error = null;
      clearToken();
    },
    setError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
      state.status = 'idle';
    },
  },
});

export const { deviceCodeReceived, tokenReceived, userLoaded, logOut, setError, clearError } =
  authSlice.actions;
export default authSlice.reducer;
