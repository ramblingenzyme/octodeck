import { checkCsrf } from "./_csrf";

interface Env {
  ALLOWED_ORIGIN: string;
}

export const onRequestPost = async ({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const forbidden = checkCsrf(request, env);
  if (forbidden) return forbidden;

  return new Response(null, {
    status: 204,
    headers: new Headers([
      ["Set-Cookie", `__Host-session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`],
      ["Set-Cookie", `__Host-csrf=; Secure; SameSite=Strict; Path=/; Max-Age=0`],
    ]),
  });
};
