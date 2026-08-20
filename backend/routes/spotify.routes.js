import express from "express";

import {
  login,
  callback,
  getMe,
  topTracks,
  recentHistory,
  logout,
} from "../controllers/spotify.controller.js";
import {
  requireSpotifyAuth,
} from "../middleware/spotify_auth.middleware.js";

const router = express.Router();

router.get("/login", login);
router.get("/callback", callback);

router.get("/me", requireSpotifyAuth, getMe);
router.get(
  "/top-tracks",
  requireSpotifyAuth,
  topTracks
);
router.get(
  "/history",
  requireSpotifyAuth,
  recentHistory
);

router.post("/logout", logout);

export default router;