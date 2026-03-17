export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export async function requestDeviceCode(clientId: string): Promise<DeviceCodeResponse> {
  const res = await fetch('/github-oauth/login/device/code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      scope: 'repo notifications read:user',
    }),
  });
  if (!res.ok) throw new Error(`Device code request failed: ${res.status}`);
  return res.json() as Promise<DeviceCodeResponse>;
}

export async function pollForToken(
  clientId: string,
  deviceCode: string,
  intervalSecs: number,
  signal: AbortSignal,
): Promise<string> {
  let currentInterval = intervalSecs * 1000;

  while (!signal.aborted) {
    await new Promise<void>((resolve, reject) => {
      const id = setTimeout(resolve, currentInterval);
      signal.addEventListener('abort', () => {
        clearTimeout(id);
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    });

    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

    const res = await fetch('/github-oauth/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
      signal,
    });

    const data = await res.json() as Record<string, string>;

    if (data.access_token) return data.access_token;

    switch (data.error) {
      case 'authorization_pending':
        break;
      case 'slow_down':
        currentInterval += 5000;
        break;
      case 'expired_token':
        throw new Error('Device code expired. Please try again.');
      case 'access_denied':
        throw new Error('Access denied by user.');
      default:
        throw new Error(data.error_description ?? data.error ?? 'Unknown error');
    }
  }

  throw new DOMException('Aborted', 'AbortError');
}
