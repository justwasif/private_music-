import env from "../config/env.js";
import {
  generateState,
  getAuthorizationUrl,
  exchangeCodeForToken,
} from "../services/spotify_auth.service.js";
import {
  getCurrentUser,
  getTopTracks,
  getRecentlyPlayed,
} from "../services/spotify_api.service.js";
import { setSpotifySession } from "../services/spotify_session.service.js";

const saveSession = (session) =>
  new Promise((resolve, reject) => {
    session.save((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

export const login = async (req, res) => {
  try {
    const state = generateState();
    req.session.spotifyState = state;

    await saveSession(req.session);

    res.redirect(getAuthorizationUrl(state));
  } catch (error) {
    console.error("Spotify login error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start Spotify authentication",
    });
  }
};

export const callback = async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    if (!state || state !== req.session.spotifyState) {
      return res.status(400).json({
        success: false,
        message: "Invalid OAuth state",
      });
    }

    delete req.session.spotifyState;

    const tokenData = await exchangeCodeForToken(code);
    setSpotifySession(req.session, tokenData);

    await saveSession(req.session);

    res.redirect(env.frontendUrl);
  } catch (error) {
    console.error(
      "Spotify callback error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Spotify authentication failed",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await getCurrentUser(
      req.session.spotify.accessToken
    );

    res.json({ success: true, data: user });
  } catch (error) {
    console.error(
      "Spotify profile error:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      success: false,
      message: "Failed to fetch Spotify user",
    });
  }
};

export const topTracks = async (req, res) => {
  try {
    const { timeRange = "long_term", limit = 5 } = req.query;

    const data = await getTopTracks(
      req.session.spotify.accessToken,
      { timeRange, limit }
    );

    res.json({
      success: true,
      data: data.items,
    });
  } catch (error) {
    console.error(
      "Spotify top tracks error:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      success: false,
      message: "Failed to fetch top tracks",
    });
  }
};

export const recentHistory = async (req, res) => {
  try {
    const data = await getRecentlyPlayed(
      req.session.spotify.accessToken
    );

    res.json({
      success: true,
      data: data.items,
    });
  } catch (error) {
    console.error(
      "Spotify history error:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      success: false,
      message: "Failed to fetch history",
    });
  }
};

export const logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to logout",
      });
    }

    res.clearCookie("connect.sid");

    res.json({
      success: true,
      message: "Logged out",
    });
  });
};