import env from "../config/env.js";

import {
  generateState,
  getAuthorizationUrl,
  exchangeCodeForToken,
} from "../service/spotifyAuth_services.js";

import {
  getCurrentUser,
  getTopTracks,
  getRecentlyPlayed,
} from "../service/spotify_services.js";


// --------------------------------------------------
// LOGIN
// --------------------------------------------------

export const login = (req, res) => {
  const state = generateState();

  req.session.spotifyState = state;

  const authUrl =
    getAuthorizationUrl(state);

  res.redirect(authUrl);
};


// --------------------------------------------------
// CALLBACK
// --------------------------------------------------

export const callback = async (
  req,
  res
) => {
  try {
    const { code, state, error } =
      req.query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    if (
      !state ||
      state !== req.session.spotifyState
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OAuth state",
      });
    }

    delete req.session.spotifyState;

    const tokenData =
      await exchangeCodeForToken(code);

    req.session.spotify = {
      accessToken: tokenData.access_token,

      refreshToken:
        tokenData.refresh_token,

      expiresAt:
        Date.now() +
        tokenData.expires_in * 1000,
    };

    res.redirect(env.frontendUrl);

  } catch (error) {

    console.error(
      error.response?.data ||
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Spotify authentication failed",
    });
  }
};


// --------------------------------------------------
// CURRENT USER
// --------------------------------------------------

export const getMe = async (
  req,
  res
) => {
  try {

    const spotify =
      req.session.spotify;

    const user =
      await getCurrentUser(
        spotify.accessToken
      );

    res.json({
      success: true,
      data: user,
    });

  } catch (error) {

    console.error(
      error.response?.data ||
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch Spotify user",
    });
  }
};


// --------------------------------------------------
// TOP TRACKS
// --------------------------------------------------

export const topTracks = async (
  req,
  res
) => {
  try {

    const spotify =
      req.session.spotify;

    const {
      timeRange = "long_term",
      limit = 5,
    } = req.query;

    const data =
      await getTopTracks(
        spotify.accessToken,
        {
          timeRange,
          limit,
        }
      );

    res.json({
      success: true,

      data: data.items,
    });

  } catch (error) {

    console.error(
      error.response?.data ||
      error.message
    );

    res.status(
      error.response?.status || 500
    ).json({
      success: false,
      message:
        "Failed to fetch top tracks",
    });
  }
};


// --------------------------------------------------
// RECENT HISTORY
// --------------------------------------------------

export const recentHistory = async (
  req,
  res
) => {
  try {

    const spotify =
      req.session.spotify;

    const data =
      await getRecentlyPlayed(
        spotify.accessToken
      );

    res.json({
      success: true,

      data: data.items,
    });

  } catch (error) {

    console.error(
      error.response?.data ||
      error.message
    );

    res.status(
      error.response?.status || 500
    ).json({
      success: false,
      message:
        "Failed to fetch history",
    });
  }
};


// --------------------------------------------------
// LOGOUT
// --------------------------------------------------

export const logout = (
  req,
  res
) => {

  req.session.destroy(() => {

    res.json({
      success: true,
      message: "Logged out",
    });

  });
};                      
