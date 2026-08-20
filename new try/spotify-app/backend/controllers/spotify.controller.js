import crypto from "crypto";
import config from "../config/env.js";
import {
  SPOTIFY_AUTH_URL,
  SPOTIFY_SCOPES,
} from "../config/spotify.js";
import {
  exchangeCode,
  getProfile,
  getTopTracks,
  getRecentlyPlayed,
} from "../services/spotify.service.js";
import {
  SESSION_COOKIE,
  createSession,
  deleteSession,
  getSession,
} from "../services/session.service.js";
import { mapTrack, handleSpotifyError } from "../utils/spotify.js";

export const login = (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");

  res.cookie("spotify_auth_state", state, {
    httpOnly: true,
    maxAge: 5 * 60 * 1000,
    sameSite: "lax",
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.spotify.clientId,
    scope: SPOTIFY_SCOPES,
    redirect_uri: config.spotify.redirectUri,
    state,
  });

  res.redirect(`${SPOTIFY_AUTH_URL}?${params.toString()}`);
};

export const callback = async (req, res) => {
  const { code, state, error } = req.query;
  const storedState = req.cookies.spotify_auth_state;

  if (error) {
    return res.redirect(
      `${config.frontendUrl}/?error=${encodeURIComponent(error)}`
    );
  }

  if (!state || state !== storedState) {
    return res.redirect(`${config.frontendUrl}/?error=state_mismatch`);
  }

  try {
    const tokenData = await exchangeCode(code);
    const sid = createSession({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + tokenData.expires_in * 1000,
    });

    res.clearCookie("spotify_auth_state");
    res.cookie(SESSION_COOKIE, sid, {
      httpOnly: true,
      signed: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.redirect(config.frontendUrl);
  } catch (err) {
    console.error(
      "Token exchange failed:",
      err.response?.data || err.message
    );
    res.redirect(`${config.frontendUrl}/?error=token_exchange_failed`);
  }
};

export const status = (req, res) => {
  const sid = req.signedCookies[SESSION_COOKIE];
  res.json({ authenticated: Boolean(getSession(sid)) });
};

export const logout = (req, res) => {
  deleteSession(req.signedCookies[SESSION_COOKIE]);
  res.clearCookie(SESSION_COOKIE);
  res.json({ ok: true });
};

export const me = async (req, res) => {
  try {
    const profile = await getProfile(req.spotifyToken);
    res.json(profile);
  } catch (error) {
    handleSpotifyError(error, res);
  }
};

export const topTracks = async (req, res) => {
  const allowed = ["short_term", "medium_term", "long_term"];
  const timeRange = allowed.includes(req.query.time_range)
    ? req.query.time_range
    : "medium_term";

  try {
    const data = await getTopTracks(
      req.spotifyToken,
      timeRange
    );

    res.json(data.items.map(mapTrack));
  } catch (error) {
    handleSpotifyError(error, res);
  }
};

export const recentlyPlayed = async (req, res) => {
  const limit = Math.min(
    Number.parseInt(req.query.limit, 10) || 20,
    50
  );

  try {
    const data = await getRecentlyPlayed(
      req.spotifyToken,
      limit
    );

    res.json(
      data.items.map((item) => ({
        played_at: item.played_at,
        track: mapTrack(item.track),
      }))
    );
  } catch (error) {
    handleSpotifyError(error, res);
  }
};