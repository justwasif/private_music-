const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(
      body.error || `Request failed: ${response.status}`
    );
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export const spotifyApi = {
  status: () => request("/api/v1/spotify/status"),
  me: () => request("/api/v1/spotify/me"),
  topTracks: (timeRange = "medium_term") =>
    request(
      `/api/v1/spotify/top-tracks?time_range=${encodeURIComponent(timeRange)}`
    ),
  recentlyPlayed: (limit = 20) =>
    request(
      `/api/v1/spotify/recently-played?limit=${limit}`
    ),
  logout: () =>
    request("/api/v1/spotify/logout", { method: "POST" }),
  loginUrl: () => `${API_URL}/api/v1/spotify/login`,
};