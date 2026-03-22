export class UnauthorizedError extends Error {
  constructor() {
    super("GitHub token is invalid or has been revoked");
    this.name = "UnauthorizedError";
  }
}

export async function githubFetch(path: string, signal?: AbortSignal): Promise<Response> {
  return fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
    },
    signal,
  });
}
