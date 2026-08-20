import express from "express";
import {
  login,
  callback,
  status,
  logout,
  me,
  topTracks,
  recentlyPlayed,
} from "../controllers/spotify.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/login", login);
router.get("/callback", callback);
router.get("/status", status);
router.post("/logout", logout);

router.get("/me", requireAuth, me);
router.get("/top-tracks", requireAuth, topTracks);
router.get("/recently-played", requireAuth, recentlyPlayed);

export default router;