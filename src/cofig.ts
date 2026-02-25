// Dual-mode: Use localhost FastAPI when running locally, Supabase edge functions in production
const LOCAL_API = "http://127.0.0.1:8000";

/**
 * Returns true if a local FastAPI backend is likely available.
 * Detection: we're on localhost/127.0.0.1 AND the VITE_API_BASE env var is set.
 */
export function isLocalBackend(): boolean {
  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";
  const hasApiBase = !!import.meta.env.VITE_API_BASE;
  return isLocal && hasApiBase;
}

export const API_BASE = import.meta.env.VITE_API_BASE || LOCAL_API;
