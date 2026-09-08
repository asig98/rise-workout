/* One fetch wrapper for all four APIs.

   Rise is an installed PWA — people open it in a garage or a hotel room with
   one bar of signal. So every request gets a hard timeout, and a failure is a
   value the caller handles, never an exception that blanks the screen. Each
   feature that uses an API has a bundled fallback. */

const DEFAULT_TIMEOUT = 8000;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetchJson(url, { timeout = DEFAULT_TIMEOUT, ...init } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) {
      throw new ApiError(`Request failed (${res.status})`, res.status);
    }
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") throw new ApiError("Request timed out", 408);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- a tiny day-scoped cache ----------
   Quotes and weather don't need re-fetching on every tab switch, and the
   calories endpoint is rate-limited on the free tier. sessionStorage keeps
   this per-tab and disposable. */

export function cached(key, ttlMs, loader) {
  try {
    const raw = sessionStorage.getItem("rise-cache:" + key);
    if (raw) {
      const { at, data } = JSON.parse(raw);
      if (Date.now() - at < ttlMs) return Promise.resolve(data);
    }
  } catch {
    /* no sessionStorage — just fetch */
  }
  return loader().then((data) => {
    try {
      sessionStorage.setItem(
        "rise-cache:" + key,
        JSON.stringify({ at: Date.now(), data })
      );
    } catch {
      /* ignore */
    }
    return data;
  });
}
