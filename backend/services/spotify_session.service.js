import {
  refreshAccessToken,
} from "./spotify_auth.service.js";

const buildSpotifySession = (tokenData, previous = {}) => ({
  ...previous,
  accessToken: tokenData.access_token,
  refreshToken:
    tokenData.refresh_token || previous.refreshToken,
  expiresAt:
    Date.now() + tokenData.expires_in * 1000,
});

export const setSpotifySession = (session, tokenData) => {
  session.spotify = buildSpotifySession(tokenData);
};

export const refreshSpotifySession = async (session) => {
  const spotify = session.spotify;

  if (!spotify?.refreshToken) {
    return false;
  }

  const tokenData = await refreshAccessToken(
    spotify.refreshToken
  );

  session.spotify = buildSpotifySession(
    tokenData,
    spotify
  );

  await new Promise((resolve, reject) => {
    session.save((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  return true;
};