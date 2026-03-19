import { useEffect, useCallback } from "preact/hooks";
import { useAppDispatch, useAppSelector } from "@/store";
import { deviceCodeReceived, tokenReceived, setError } from "@/store/authSlice";
import { githubApi } from "@/store/githubApi";
import { GITHUB_CLIENT_ID } from "@/env";
import { requestDeviceCode, pollForToken } from "./deviceFlow";

export function useDeviceFlow() {
  const dispatch = useAppDispatch();
  const { status, userCode, verificationUri, expiresAt, deviceCode, interval, error } =
    useAppSelector((s) => s.auth);

  const start = useCallback(async () => {
    if (!GITHUB_CLIENT_ID) {
      dispatch(setError("VITE_GITHUB_CLIENT_ID is not set. Check your .env.local file."));
      return;
    }
    try {
      const data = await requestDeviceCode(GITHUB_CLIENT_ID);
      dispatch(
        deviceCodeReceived({
          deviceCode: data.device_code,
          userCode: data.user_code,
          verificationUri: data.verification_uri,
          expiresIn: data.expires_in,
          interval: data.interval,
        }),
      );
    } catch (e) {
      dispatch(setError(e instanceof Error ? e.message : "Failed to start auth flow"));
    }
  }, [dispatch]);

  useEffect(() => {
    if (status !== "polling" || !deviceCode || !GITHUB_CLIENT_ID) return;

    const controller = new AbortController();

    pollForToken(GITHUB_CLIENT_ID, deviceCode, interval, controller.signal)
      .then((token) => {
        dispatch(tokenReceived(token));
        dispatch(githubApi.endpoints.getUser.initiate());
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        dispatch(setError(e instanceof Error ? e.message : "Auth failed"));
      });

    return () => controller.abort();
  }, [status, deviceCode, interval, dispatch]);

  return { userCode, verificationUri, expiresAt, status, error, start };
}
