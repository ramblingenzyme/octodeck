import { encrypt } from './_crypto';

interface Env {
  GITHUB_CLIENT_ID: string;
  SESSION_CRYPTO_KEY: string;
  ALLOWED_ORIGIN: string;
}

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }): Promise<Response> => {
  const code_verifier = b64url(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const state = b64url(crypto.getRandomValues(new Uint8Array(16)).buffer);

  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(code_verifier),
  );
  const code_challenge = b64url(digest);

  const encrypted = await encrypt({ code_verifier, state }, env.SESSION_CRYPTO_KEY);

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${env.ALLOWED_ORIGIN}/api/callback`,
    scope: 'repo notifications read:user security_events',
    state,
    code_challenge,
    code_challenge_method: 'S256',
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params}`,
      'Set-Cookie': `__Host-pkce=${encrypted}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    },
  });
};
