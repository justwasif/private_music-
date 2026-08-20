const config = {
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  },
  frontendUrl: process.env.FRONTEND_URL || "http://127.0.0.1:5173",
  port: Number(process.env.PORT) || 8000,
  sessionSecret: process.env.SESSION_SECRET || "dev-secret",
};

export default config;