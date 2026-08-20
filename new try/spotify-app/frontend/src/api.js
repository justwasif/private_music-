const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
  })

  if (!res.ok) {
    if (res.status === 401) {
      const err = new Error('unauthenticated')
      err.status = 401
      throw err
    }
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }

  return res.json()
}

export const api = {
  status: () => request('/api/v1/spotify/status'),
  me: () => request('/api/v1/spotify/me'),
  topTracks: (timeRange = 'medium_term') =>
    request(`/api/v1/spotify/top-tracks?time_range=${timeRange}`),
  recentlyPlayed: (limit = 20) =>
    request(`/api/v1/spotify/recently-played?limit=${limit}`),
  logout: () => request('/api/v1/spotify/logout', { method: 'POST' }),
  loginUrl: () => `${API_URL}/api/v1/spotify/login`,
}
