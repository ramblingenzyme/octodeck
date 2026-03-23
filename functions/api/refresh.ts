import { encrypt, decrypt, parseCookie } from './_crypto';
import { checkCsrf } from './_csrf';

interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  SESSION_CRYPTO_KEY: string;
  ALLOWED_ORIGIN: string;
}

interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }): Promise<Response> => {
  const csrfError = checkCsrf(request, env);
  if (csrfError) return csrfError;

  const token = parseCookie(request.headers.get('Cookie'), '__Host-session');
  if (!token) return new Response('No session', { status: 401 });

  let session: SessionPayload;
  try {
    session = (await decrypt(token, env.SESSION_CRYPTO_KEY)) as SessionPayload;
  } catch {
    return new Response('Invalid session', { status: 401 });
  }

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: session.refreshToken,
    }),
  });

  if (!res.ok) return new Response('GitHub refresh failed', { status: 502 });

  const data = (await res.json()) as Record<string, string | number>;

  if (data['error'] || !data['access_token']) {
    return new Response(String(data['error_description'] ?? data['error'] ?? 'Refresh failed'), {
      status: 401,
    });
  }

  const expiresAt = Date.now() + (data['expires_in'] as number) * 1000;
  const newSession = await encrypt(
    {
      accessToken: data['access_token'],
      refreshToken: (data['refresh_token'] as string) ?? session.refreshToken,
      expiresAt,
    },
    env.SESSION_CRYPTO_KEY,
  );

  return Response.json(
    { accessToken: data['access_token'], expiresAt },
    {
      headers: {
        'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
        'Set-Cookie': `__Host-session=${newSession}; HttpOnly; Secure; SameSite=Strict; Path=/`,
      },
    },
  );
};
