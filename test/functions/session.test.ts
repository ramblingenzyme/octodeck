import { describe, it, expect } from 'vitest';
import { onRequestGet } from '../../functions/api/session';
import { encrypt } from '../../functions/api/_crypto';
import { makeKey, makeCtx, mockRequest } from './_helpers';

const ALLOWED = 'https://octodeck.pages.dev';

async function makeSessionCookie(key: string): Promise<string> {
  return encrypt(
    { accessToken: 'tok_abc', refreshToken: 'ref_xyz', expiresAt: Date.now() + 3600_000 },
    key,
  );
}

describe('/api/session', () => {
  it('returns 403 without CSRF header', async () => {
    const key = await makeKey();
    const req = mockRequest('https://worker.example.com/api/session', { Origin: ALLOWED });
    const res = await onRequestGet(makeCtx(req, { SESSION_CRYPTO_KEY: key, ALLOWED_ORIGIN: ALLOWED }));
    expect(res.status).toBe(403);
  });

  it('returns 403 with wrong origin', async () => {
    const key = await makeKey();
    const req = mockRequest('https://worker.example.com/api/session', {
      Origin: 'https://evil.com',
      'X-GitHub-App-CSRF': '1',
    });
    const res = await onRequestGet(makeCtx(req, { SESSION_CRYPTO_KEY: key, ALLOWED_ORIGIN: ALLOWED }));
    expect(res.status).toBe(403);
  });

  it('returns 401 when no session cookie', async () => {
    const key = await makeKey();
    const req = mockRequest('https://worker.example.com/api/session', {
      Origin: ALLOWED,
      'X-GitHub-App-CSRF': '1',
    });
    const res = await onRequestGet(makeCtx(req, { SESSION_CRYPTO_KEY: key, ALLOWED_ORIGIN: ALLOWED }));
    expect(res.status).toBe(401);
  });

  it('returns accessToken and expiresAt for a valid session', async () => {
    const key = await makeKey();
    const cookie = await makeSessionCookie(key);
    const req = mockRequest('https://worker.example.com/api/session', {
      Origin: ALLOWED,
      'X-GitHub-App-CSRF': '1',
      Cookie: `__Host-session=${cookie}`,
    });
    const res = await onRequestGet(makeCtx(req, { SESSION_CRYPTO_KEY: key, ALLOWED_ORIGIN: ALLOWED }));
    expect(res.status).toBe(200);
    const body = await res.json() as { accessToken: string; expiresAt: number };
    expect(body.accessToken).toBe('tok_abc');
    expect(typeof body.expiresAt).toBe('number');
  });

  it('does not expose refreshToken in response', async () => {
    const key = await makeKey();
    const cookie = await makeSessionCookie(key);
    const req = mockRequest('https://worker.example.com/api/session', {
      Origin: ALLOWED,
      'X-GitHub-App-CSRF': '1',
      Cookie: `__Host-session=${cookie}`,
    });
    const res = await onRequestGet(makeCtx(req, { SESSION_CRYPTO_KEY: key, ALLOWED_ORIGIN: ALLOWED }));
    const text = await res.text();
    expect(text).not.toContain('ref_xyz');
    expect(text).not.toContain('refreshToken');
  });
});
