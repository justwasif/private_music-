import { getSession } from "../services/session.service.js";
import { refreshToken } from "../services/spotify.service.js";
import { SESSION_COOKIE } from "../services/session.service.js";

export const requireAuth = async (req, res, next) => {
  const sid = req.signedCookies[SESSION_COOKIE];
  const session = getSession(sid);

  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    if (Date.now() > session.expires_at - 30_000) {
      const tokenData = await refreshToken(session.refresh_token);

      session.access_token = tokenData.access_token;
      session.expires_at = Date.now() + tokenData.expires_in * 1000;

      if (tokenData.refresh_token) {
        session.refresh_token = tokenData.refresh_token;
      }
    }

    req.spotifyToken = session.access_token;
    req.spotifySession = session;
    next();
  } catch (error) {
    console.error(
      "Token refresh failed:",
      error.response?.data || error.message
    );

    return res.status(401).json({
      error: "Session expired, please log in again",
    });
  }
};