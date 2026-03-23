import { describe, it, expect } from 'vitest';
import { onRequestGet } from '../../functions/api/login';
import { decrypt } from '../../functions/api/_crypto';
import { makeKey, makeCtx, mockRequest } from './_helpers';

describe('/api/login', () => {
  it('redirects to GitHub OAuth with PKCE params', async () => {
    const key = await makeKey();
    const req = mockRequest('https://octodeck.pages.dev/api/login');
    const res = await onRequestGet(
      makeCtx(req, { GITHUB_CLIENT_ID: 'client_id_123', SESSION_CRYPTO_KEY: key, ALLOWED_ORIGIN: 'https://octodeck.pages.dev' }),
    );
    expect(res.status).toBe(302);
    const location = res.headers.get('Location') ?? '';
    expect(location).toMatch(/^https:\/\/github\.com\/login\/oauth\/authorize/);
    expect(location).toContain('code_challenge_method=S256');
    expect(location).toContain('code_challenge=');
    expect(location).toContain('client_id=client_id_123');
  });

  it('does not expose client_secret in the redirect URL', async () => {
    const key = await makeKey();
    const req = mockRequest('https://octodeck.pages.dev/api/login');
    const res = await onRequestGet(
      makeCtx(req, { GITHUB_CLIENT_ID: 'client_id_123', SESSION_CRYPTO_KEY: key, ALLOWED_ORIGIN: 'https://octodeck.pages.dev' }),
    );
    const location = res.headers.get('Location') ?? '';
    expect(location).not.toContain('client_secret');
  });

  it('state in redirect URL matches state in pkce cookie payload', async () => {
    const key = await makeKey();
    const req = mockRequest('https://octodeck.pages.dev/api/login');
    const res = await onRequestGet(
      makeCtx(req, { GITHUB_CLIENT_ID: 'client_id_123', SESSION_CRYPTO_KEY: key, ALLOWED_ORIGIN: 'https://octodeck.pages.dev' }),
    );
    // Extract state from Location
    const location = res.headers.get('Location') ?? '';
    const urlState = new URL(location).searchParams.get('state') ?? '';

    // Extract encrypted pkce payload from Set-Cookie (accessible in node env, may be null in happy-dom).
    // If Set-Cookie is readable, verify the decrypted payload matches the state.
    const setCookie = res.headers.get('Set-Cookie');
    if (setCookie) {
      const match = setCookie.match(/__Host-pkce=([^;]+)/);
      if (match?.[1]) {
        const payload = (await decrypt(match[1], key)) as { state: string; code_verifier: string };
        expect(payload.state).toBe(urlState);
        expect(payload.code_verifier.length).toBeGreaterThan(20);
        // Raw cookie value must not contain plaintext verifier
        expect(match[1]).not.toContain('code_verifier');
      }
    } else {
      // happy-dom blocks Set-Cookie access; just verify the redirect is well-formed
      expect(urlState.length).toBeGreaterThan(10);
    }
  });

  it('each login generates a unique state', async () => {
    const key = await makeKey();
    const makeReq = () => mockRequest('https://octodeck.pages.dev/api/login');
    const env = { GITHUB_CLIENT_ID: 'cid', SESSION_CRYPTO_KEY: key, ALLOWED_ORIGIN: 'https://octodeck.pages.dev' };
    const [r1, r2] = await Promise.all([
      onRequestGet(makeCtx(makeReq(), env)),
      onRequestGet(makeCtx(makeReq(), env)),
    ]);
    const s1 = new URL(r1.headers.get('Location') ?? '').searchParams.get('state');
    const s2 = new URL(r2.headers.get('Location') ?? '').searchParams.get('state');
    expect(s1).not.toBe(s2);
  });
});
