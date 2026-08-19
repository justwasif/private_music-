import dotenv from "dotenv";

dotenv.config();

const env = {
  port: process.env.PORT || 8000,

  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  },

  frontendUrl: process.env.FRONTEND_URL,

  sessionSecret: process.env.SESSION_SECRET,
};

export default env;