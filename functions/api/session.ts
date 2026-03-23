import { decrypt, parseCookie } from './_crypto';
import { checkCsrf } from './_csrf';

interface Env {
  SESSION_CRYPTO_KEY: string;
  ALLOWED_ORIGIN: string;
}

interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }): Promise<Response> => {
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

  return Response.json(
    { accessToken: session.accessToken, expiresAt: session.expiresAt },
    { headers: { 'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN } },
  );
};
