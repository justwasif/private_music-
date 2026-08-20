import axios from "axios";
import config from "../config/env.js";
import { SPOTIFY_API_URL, SPOTIFY_TOKEN_URL } from "../config/spotify.js";

const basicAuth = () =>
  `Basic ${Buffer.from(
    `${config.spotify.clientId}:${config.spotify.clientSecret}`
  ).toString("base64")}`;

export const exchangeCode = async (code) => {
  const response = await axios.post(
    SPOTIFY_TOKEN_URL,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.spotify.redirectUri,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuth(),
      },
    }
  );

  return response.data;
};

export const refreshToken = async (refreshTokenValue) => {
  const response = await axios.post(
    SPOTIFY_TOKEN_URL,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshTokenValue,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuth(),
      },
    }
  );

  return response.data;
};

const request = async (accessToken, path, params) => {
  const response = await axios.get(`${SPOTIFY_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params,
  });

  return response.data;
};

export const getProfile = (accessToken) =>
  request(accessToken, "/me");

export const getTopTracks = (
  accessToken,
  timeRange = "medium_term"
) =>
  request(accessToken, "/me/top/tracks", {
    limit: 5,
    time_range: timeRange,
  });

export const getRecentlyPlayed = (
  accessToken,
  limit = 20
) =>
  request(accessToken, "/me/player/recently-played", {
    limit: Math.min(limit, 50),
  });