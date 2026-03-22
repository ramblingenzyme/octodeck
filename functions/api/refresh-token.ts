interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  ALLOWED_ORIGIN: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { refresh_token } = await (request.json() as Promise<{ refresh_token: string }>);

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();

  return Response.json(data, {
    headers: { 'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN },
  });
};

export const onRequestOptions: PagesFunction<Env> = async ({ env }) => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
