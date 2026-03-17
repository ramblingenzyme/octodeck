import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { configApi } from './configApi';
import { githubApi } from './githubApi';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    [configApi.reducerPath]: configApi.reducer,
    [githubApi.reducerPath]: githubApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(configApi.middleware, githubApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector<RootState, T>(selector);
