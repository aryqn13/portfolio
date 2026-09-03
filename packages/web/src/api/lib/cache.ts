/** Tiny in-process TTL cache so external APIs aren't hit once per visitor. */

interface Entry<T> {
  value: T;
  expires: number;
}

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export async function cached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expires > Date.now()) return hit.value;

  const running = inflight.get(key) as Promise<T> | undefined;
  if (running) return running;

  const task = (async () => {
    try {
      const value = await fetcher();
      store.set(key, { value, expires: Date.now() + ttlMs });
      return value;
    } catch (error) {
      // Serve stale data rather than an error page when the upstream is down.
      if (hit) return hit.value;
      throw error;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, task);
  return task;
}

export async function fetchText(url: string, init?: RequestInit): Promise<string> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      accept: "*/*",
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res.text();
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  return JSON.parse(await fetchText(url, init)) as T;
}
