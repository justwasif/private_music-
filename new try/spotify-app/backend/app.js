import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config/env.js";
import spotifyRoutes from "./routes/spotify.routes.js";

const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

app.use(cookieParser(config.sessionSecret));
app.use(express.json());

app.use("/api/v1/spotify", spotifyRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Spotify backend running",
  });
});

export default app;