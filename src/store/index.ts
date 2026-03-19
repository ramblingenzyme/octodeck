import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { configApi } from "./configApi";
import { githubApi } from "./githubApi";
import authReducer, { tokenReceived, logOut } from "./authSlice";
import { saveToken, clearToken } from "./tokenStorage";

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: tokenReceived,
  effect: (action) => {
    saveToken(action.payload);
  },
});

listenerMiddleware.startListening({
  actionCreator: logOut,
  effect: () => {
    clearToken();
  },
});

export const store = configureStore({
  reducer: {
    [configApi.reducerPath]: configApi.reducer,
    [githubApi.reducerPath]: githubApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefault) =>
    getDefault()
      .prepend(listenerMiddleware.middleware)
      .concat(configApi.middleware, githubApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector<RootState, T>(selector);
