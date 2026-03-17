export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID as string | undefined;

export const isDemoMode: boolean =
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  new URLSearchParams(window.location.search).has('demo');
