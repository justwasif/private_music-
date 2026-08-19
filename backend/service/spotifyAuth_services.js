import axios from "axios";
import crypto from "crypto";

import env from "../config/env.js";
import {
  SPOTIFY_AUTH_URL,
  SPOTIFY_TOKEN_URL,
  SPOTIFY_SCOPES,
} from "../config/spotify_config.js";

export const generateState = () => {
  return crypto.randomBytes(16).toString("hex");
};


export const getAuthorizationUrl = (state) => {
  const params = new URLSearchParams({
    client_id: env.spotify.clientId,
    response_type: "code",
    redirect_uri: env.spotify.redirectUri,
    scope: SPOTIFY_SCOPES.join(" "),
    state,
  });

  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
};


export const exchangeCodeForToken = async (code) => {
  const credentials = Buffer.from(
    `${env.spotify.clientId}:${env.spotify.clientSecret}`
  ).toString("base64");

  const response = await axios.post(
    SPOTIFY_TOKEN_URL,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.spotify.redirectUri,
    }).toString(),
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};


export const refreshAccessToken = async (
  refreshToken
) => {
  const credentials = Buffer.from(
    `${env.spotify.clientId}:${env.spotify.clientSecret}`
  ).toString("base64");

  const response = await axios.post(
    SPOTIFY_TOKEN_URL,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};