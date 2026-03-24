export const isDemoMode: boolean =
  import.meta.env.VITE_DEMO_MODE === "true" ||
  new URLSearchParams(window.location.search).has("demo");
