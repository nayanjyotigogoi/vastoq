export async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
      cache: 'no-store',
    })

    // Not logged in — normal case
    if (response.status === 401) return null

    // Backend unreachable or other server error — treat as unauthenticated
    if (!response.ok) return null

    const json = await response.json()
    return json.data ?? null
  } catch {
    // Network failure (backend down, no connection) — treat as unauthenticated
    return null
  }
}