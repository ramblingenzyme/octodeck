/** Minimal EventContext stub for PagesFunction handlers. */
export function makeCtx(
  request: Request,
  env: Record<string, string>,
): never {
  return {
    request,
    env,
    params: {},
    data: {},
    waitUntil: () => {},
    passThroughOnException: () => {},
    next: () => Promise.resolve(new Response()),
    functionPath: '',
    pluginArgs: {},
  } as never;
}

/** Generate a 32-byte AES-GCM key as base64url for tests. */
export async function makeKey(): Promise<string> {
  const raw = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...raw))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Create a plain object stub that satisfies the minimal Request interface used by handlers.
 * Avoids browser forbidden-header restrictions (Origin, Cookie) that happy-dom enforces.
 */
export function mockRequest(url: string, headers: Record<string, string> = {}): Request {
  const lc: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) lc[k.toLowerCase()] = v;
  return {
    url,
    headers: {
      get(name: string) {
        return lc[name.toLowerCase()] ?? null;
      },
      has(name: string) {
        return name.toLowerCase() in lc;
      },
    },
  } as unknown as Request;
}
