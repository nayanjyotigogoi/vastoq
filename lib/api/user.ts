export async function getCurrentUser() {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
    cache: 'no-store',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch user (${response.status})`
    )
  }

  const json = await response.json()

  return json.data
}