export const mapTrack = (track) => ({
  id: track.id,
  name: track.name,
  artists: track.artists.map((artist) => artist.name).join(", "),
  album: track.album.name,
  albumArt: track.album.images?.[0]?.url || null,
  url: track.external_urls?.spotify || null,
  durationMs: track.duration_ms,
});

export const handleSpotifyError = (error, res) => {
  const status = error.response?.status || 500;
  const message =
    error.response?.data?.error?.message ||
    "Spotify API error";

  console.error(
    "Spotify API error:",
    status,
    error.response?.data || error.message
  );

  return res.status(status).json({ error: message });
};