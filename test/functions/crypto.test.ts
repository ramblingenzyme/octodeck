import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, parseCookie } from '../../functions/api/_crypto';
import { makeKey } from './_helpers';

describe('encrypt / decrypt', () => {
  it('round-trips a payload', async () => {
    const key = await makeKey();
    const payload = { accessToken: 'tok', refreshToken: 'ref', expiresAt: 9999 };
    const token = await encrypt(payload, key);
    const result = await decrypt(token, key);
    expect(result).toEqual(payload);
  });

  it('produces iv:ciphertext format', async () => {
    const key = await makeKey();
    const token = await encrypt({ x: 1 }, key);
    expect(token).toMatch(/^[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/);
  });

  it('ciphertext is not plaintext JSON', async () => {
    const key = await makeKey();
    const token = await encrypt({ accessToken: 'secret' }, key);
    expect(token).not.toContain('accessToken');
    expect(token).not.toContain('secret');
    expect(() => JSON.parse(token)).toThrow();
  });

  it('throws on tampered ciphertext', async () => {
    const key = await makeKey();
    const token = await encrypt({ x: 1 }, key);
    const tampered = token.slice(0, -4) + 'AAAA';
    await expect(decrypt(tampered, key)).rejects.toThrow();
  });

  it('throws on wrong key', async () => {
    const key1 = await makeKey();
    const key2 = await makeKey();
    const token = await encrypt({ x: 1 }, key1);
    await expect(decrypt(token, key2)).rejects.toThrow();
  });
});

describe('parseCookie', () => {
  it('returns the named cookie value', () => {
    expect(parseCookie('__Host-session=abc123; Path=/', '__Host-session')).toBe('abc123');
  });

  it('returns null when cookie is absent', () => {
    expect(parseCookie('other=val', '__Host-session')).toBeNull();
  });

  it('returns null for null header', () => {
    expect(parseCookie(null, '__Host-session')).toBeNull();
  });

  it('handles values with = signs', () => {
    expect(parseCookie('__Host-session=a=b=c', '__Host-session')).toBe('a=b=c');
  });
});
