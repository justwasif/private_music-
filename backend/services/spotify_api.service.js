import axios from "axios";
import { SPOTIFY_BASE_URL } from "../config/spotify_config.js";

const spotifyRequest = async (accessToken, endpoint) => {
  const response = await axios.get(
    `${SPOTIFY_BASE_URL}${endpoint}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const getCurrentUser = (accessToken) =>
  spotifyRequest(accessToken, "/me");

export const getTopTracks = (
  accessToken,
  { timeRange = "long_term", limit = 5 } = {}
) =>
  spotifyRequest(
    accessToken,
    `/me/top/tracks?time_range=${encodeURIComponent(timeRange)}&limit=${limit}`
  );

export const getRecentlyPlayed = (
  accessToken,
  limit = 50
) =>
  spotifyRequest(
    accessToken,
    `/me/player/recently-played?limit=${limit}`
  );