import axios from "axios";

import {
  SPOTIFY_BASE_URL,
} from "../config/spotify_config.js";


const spotifyRequest = async (
  accessToken,
  endpoint
) => {
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


// Get current Spotify user
export const getCurrentUser = async (
  accessToken
) => {
  return spotifyRequest(
    accessToken,
    "/me"
  );
};


// Get user's top tracks
export const getTopTracks = async (
  accessToken,
  {
    timeRange = "long_term",
    limit = 5,
  } = {}
) => {
  return spotifyRequest(
    accessToken,
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
  );
};


// Get recently played tracks
export const getRecentlyPlayed = async (
  accessToken,
  limit = 50
) => {
  return spotifyRequest(
    accessToken,
    `/me/player/recently-played?limit=${limit}`
  );
};