import express from "express";
import cors from "cors";
import session from "express-session";

import env from "./config/env.js";
import spotifyRoutes from "./routes/spotify.routes.js";

const app = express();

const allowedOrigins = [
  env.frontendUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

const isLocalDevOrigin = (origin) => {
  try {
    const { hostname, protocol } = new URL(origin);

    return (
      protocol === "http:" &&
      (hostname === "localhost" || hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        isLocalDevOrigin(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

app.use("/api/v1/spotify", spotifyRoutes);

app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

export default app;