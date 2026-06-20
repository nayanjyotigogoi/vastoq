/**
 * Vastoq — typed API client
 *
 * Thin wrapper around fetch that:
 *   - Always sends credentials (session cookie)
 *   - Returns typed { data } | { error }
 *   - Handles non-JSON responses gracefully
 */

type ApiOk<T> = { data: T; error?: never };
type ApiErr = { error: string; code?: string; data?: never };
type ApiResult<T> = ApiOk<T> | ApiErr;

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || json.success === false) {
      return {
        error: json.error?.message ?? `Request failed (${res.status})`,
        code: json.error?.code,
      };
    }

    return { data: (json.data ?? json) as T };
  } catch (e) {
    return { error: (e as Error).message ?? "Network error" };
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
