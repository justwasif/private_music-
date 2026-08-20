require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI,
  FRONTEND_URL = 'http://127.0.0.1:5173',
  PORT = 8000,
  SESSION_SECRET = 'dev-secret',
} = process.env;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REDIRECT_URI) {
  console.error(
    '\nMissing Spotify env vars. Copy backend/.env.example to backend/.env and fill in\n' +
      'SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI.\n'
  );
}

const app = express();
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(cookieParser(SESSION_SECRET));
app.use(express.json());

// ---------------------------------------------------------------------------
// Super-simple in-memory session store: sessionId -> { access_token, refresh_token, expires_at }
// Good enough for local/dev use. Swap for Redis/DB for production/multi-instance.
// ---------------------------------------------------------------------------
const sessions = new Map();

const SESSION_COOKIE = 'sid';
const SCOPES = ['user-top-read', 'user-read-recently-played'].join(' ');

function newSessionId() {
  return crypto.randomBytes(24).toString('hex');
}

function getSession(req) {
  const sid = req.signedCookies[SESSION_COOKIE];
  if (!sid) return null;
  return sessions.get(sid) || null;
}

async function refreshAccessToken(session) {
  const resp = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: session.refresh_token,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
      },
    }
  );

  session.access_token = resp.data.access_token;
  session.expires_at = Date.now() + resp.data.expires_in * 1000;
  // Spotify sometimes rotates the refresh token
  if (resp.data.refresh_token) session.refresh_token = resp.data.refresh_token;
}

// Middleware: ensures req.spotifyToken is a valid, fresh access token
async function requireAuth(req, res, next) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    if (Date.now() > session.expires_at - 30_000) {
      await refreshAccessToken(session);
    }
    req.spotifyToken = session.access_token;
    next();
  } catch (err) {
    console.error('Token refresh failed:', err.response?.data || err.message);
    res.status(401).json({ error: 'Session expired, please log in again' });
  }
}

// ---------------------------------------------------------------------------
// Auth routes
// ---------------------------------------------------------------------------

// Step 1: kick off login -> redirect to Spotify's consent screen
app.get('/api/v1/spotify/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('spotify_auth_state', state, {
    httpOnly: true,
    maxAge: 5 * 60 * 1000,
    sameSite: 'lax',
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

// Step 2: Spotify redirects back here with ?code=...&state=...
app.get('/api/v1/spotify/callback', async (req, res) => {
  const { code, state, error } = req.query;
  const storedState = req.cookies.spotify_auth_state;

  if (error) {
    return res.redirect(`${FRONTEND_URL}/?error=${encodeURIComponent(error)}`);
  }
  if (!state || state !== storedState) {
    return res.redirect(`${FRONTEND_URL}/?error=state_mismatch`);
  }

  try {
    const tokenResp = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResp.data;

    const sid = newSessionId();
    sessions.set(sid, {
      access_token,
      refresh_token,
      expires_at: Date.now() + expires_in * 1000,
    });

    res.clearCookie('spotify_auth_state');
    res.cookie(SESSION_COOKIE, sid, {
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.redirect(FRONTEND_URL);
  } catch (err) {
    console.error('Token exchange failed:', err.response?.data || err.message);
    res.redirect(`${FRONTEND_URL}/?error=token_exchange_failed`);
  }
});

app.post('/api/v1/spotify/logout', (req, res) => {
  const sid = req.signedCookies[SESSION_COOKIE];
  if (sid) sessions.delete(sid);
  res.clearCookie(SESSION_COOKIE);
  res.json({ ok: true });
});

app.get('/api/v1/spotify/status', (req, res) => {
  res.json({ authenticated: !!getSession(req) });
});

// ---------------------------------------------------------------------------
// Data routes
// ---------------------------------------------------------------------------

app.get('/api/v1/spotify/me', requireAuth, async (req, res) => {
  try {
    const { data } = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${req.spotifyToken}` },
    });
    res.json(data);
  } catch (err) {
    handleSpotifyError(err, res);
  }
});

// Top 5 most played tracks. time_range: short_term (~4wk) | medium_term (~6mo) | long_term (years)
app.get('/api/v1/spotify/top-tracks', requireAuth, async (req, res) => {
  const time_range = ['short_term', 'medium_term', 'long_term'].includes(req.query.time_range)
    ? req.query.time_range
    : 'medium_term';

  try {
    const { data } = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: { Authorization: `Bearer ${req.spotifyToken}` },
      params: { limit: 5, time_range },
    });
    res.json(data.items.map(mapTrack));
  } catch (err) {
    handleSpotifyError(err, res);
  }
});

// Recently played history (last 50 max, per Spotify API limit)
app.get('/api/v1/spotify/recently-played', requireAuth, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

  try {
    const { data } = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
      headers: { Authorization: `Bearer ${req.spotifyToken}` },
      params: { limit },
    });
    res.json(
      data.items.map((item) => ({
        played_at: item.played_at,
        track: mapTrack(item.track),
      }))
    );
  } catch (err) {
    handleSpotifyError(err, res);
  }
});

function mapTrack(track) {
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map((a) => a.name).join(', '),
    album: track.album.name,
    albumArt: track.album.images?.[0]?.url || null,
    url: track.external_urls?.spotify || null,
    durationMs: track.duration_ms,
  };
}

function handleSpotifyError(err, res) {
  const status = err.response?.status || 500;
  console.error('Spotify API error:', status, err.response?.data || err.message);
  res.status(status).json({ error: err.response?.data?.error?.message || 'Spotify API error' });
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Spotify backend running' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://127.0.0.1:${PORT}`);
  console.log(`Login at http://127.0.0.1:${PORT}/api/v1/spotify/login`);
});
