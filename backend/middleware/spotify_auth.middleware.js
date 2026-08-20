import { refreshSpotifySession } from "../services/spotify_session.service.js";

export const requireSpotifyAuth = async (req, res, next) => {
  const spotify = req.session.spotify;

  if (!spotify) {
    return res.status(401).json({
      success: false,
      message: "Spotify authentication required",
    });
  }

  if (
    spotify.expiresAt &&
    Date.now() < spotify.expiresAt - 60 * 1000
  ) {
    return next();
  }

  if (!spotify.refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Spotify session expired. Please login again.",
    });
  }

  try {
    await refreshSpotifySession(req.session);
    next();
  } catch (error) {
    console.error(
      "Spotify token refresh error:",
      error.response?.data || error.message
    );

    return res.status(401).json({
      success: false,
      message: "Spotify session expired. Please login again.",
    });
  }
};