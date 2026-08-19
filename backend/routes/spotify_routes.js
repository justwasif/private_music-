import express from "express";

import {
  login,
  callback,
  getMe,
  topTracks,
  recentHistory,
  logout,
} from "../controllers/spotify_controller.js";

import {
  requireSpotifyAuth,
} from "../middleware/auth_middleware.js";


const router = express.Router();


// OAuth
router.get("/login", login);

router.get("/callback", callback);


// Protected routes
router.get(
  "/me",
  requireSpotifyAuth,
  getMe
);

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


// Logout
router.post(
  "/logout",
  logout
);


export default router;