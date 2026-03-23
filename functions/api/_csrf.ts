interface Env {
  ALLOWED_ORIGIN: string;
}

export function checkCsrf(request: Request, env: Env): Response | null {
  if (!request.headers.get('X-GitHub-App-CSRF')) {
    return new Response('Forbidden', { status: 403 });
  }
  // Only validate Origin when it is present. Same-origin requests omit it;
  // cross-origin requests always include it, so a wrong origin is still blocked.
  const origin = request.headers.get('Origin');
  if (origin !== null && origin !== env.ALLOWED_ORIGIN) {
    return new Response('Forbidden', { status: 403 });
  }
  return null;
}
