import { useEffect, useCallback } from "preact/hooks";
import { useAuthStore } from "@/store/authStore";
import { GITHUB_CLIENT_ID } from "@/env";
import { requestDeviceCode, pollForToken } from "./deviceFlow";

export function useDeviceFlow() {
  const {
    status,
    userCode,
    verificationUri,
    expiresAt,
    deviceCode,
    interval,
    error,
    deviceCodeReceived,
    tokenReceived,
    setError,
  } = useAuthStore();

  const start = useCallback(async () => {
    if (!GITHUB_CLIENT_ID) {
      setError("VITE_GITHUB_CLIENT_ID is not set. Check your .env.local file.");
      return;
    }
    try {
      const data = await requestDeviceCode(GITHUB_CLIENT_ID);
      deviceCodeReceived({
        deviceCode: data.device_code,
        userCode: data.user_code,
        verificationUri: data.verification_uri,
        expiresIn: data.expires_in,
        interval: data.interval,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start auth flow");
    }
  }, [deviceCodeReceived, setError]);

  useEffect(() => {
    if (status !== "polling" || !deviceCode || !GITHUB_CLIENT_ID) return;

    const controller = new AbortController();

    pollForToken(GITHUB_CLIENT_ID, deviceCode, interval, controller.signal)
      .then((token) => {
        tokenReceived(token);
        // getUser fires automatically via enabled: !!token in useGetUser hook
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Auth failed");
      });

    return () => controller.abort();
  }, [status, deviceCode, interval, tokenReceived, setError]);

  return { userCode, verificationUri, expiresAt, status, error, start };
}
