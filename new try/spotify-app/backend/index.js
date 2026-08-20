import "dotenv/config";
import app from "./app.js";
import config from "./config/env.js";

const required = [
  ["SPOTIFY_CLIENT_ID", config.spotify.clientId],
  ["SPOTIFY_CLIENT_SECRET", config.spotify.clientSecret],
  ["SPOTIFY_REDIRECT_URI", config.spotify.redirectUri],
];

const missing = required
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length) {
  console.error(
    `Missing environment variables: ${missing.join(", ")}`
  );
}

app.listen(config.port, () => {
  console.log(
    `Backend listening on http://127.0.0.1:${config.port}`
  );
  console.log(
    `Login at http://127.0.0.1:${config.port}/api/v1/spotify/login`
  );
});