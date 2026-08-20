# Spin — Spotify Top Tracks & History

A small full-stack app that shows your top 5 most-played Spotify tracks and
your recent listening history.

- **Backend**: Node.js + Express (OAuth Authorization Code flow, token
  refresh, thin wrapper around the Spotify Web API)
- **Frontend**: Vite + React

## 1. Configure your Spotify app

You said you've already created an app in the
[Spotify Developer Dashboard](https://developer.spotify.com/dashboard). Open
it and:

1. Under **Redirect URIs**, make sure this exact URI is added:
   ```
   http://127.0.0.1:8000/api/v1/spotify/callback
   ```
   (Spotify no longer allows plain `localhost` — you must use `127.0.0.1`.)
2. Copy your **Client ID** and **Client Secret** — you'll need them next.

## 2. Backend setup

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in:

```
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/api/v1/spotify/callback
FRONTEND_URL=http://127.0.0.1:5173
PORT=8000
SESSION_SECRET=any_long_random_string
```

Then install and run:

```bash
npm install
npm start
```

The backend runs at `http://127.0.0.1:8000`.

## 3. Frontend setup

In a second terminal:

```bash
cd frontend
cp .env.example .env   # only needed if you change the backend port
npm install
npm run dev
```

The frontend runs at `http://127.0.0.1:5173` (open this in your browser —
not the backend URL).

## 4. Use it

1. Go to `http://127.0.0.1:5173`.
2. Click **Connect Spotify** and approve access.
3. You'll be redirected back and see your top 5 tracks (switchable between
   last 4 weeks / 6 months / all time) and your recent play history.

## How auth works

- `GET /api/v1/spotify/login` redirects you to Spotify's consent screen.
- Spotify redirects back to `/api/v1/spotify/callback` with an auth code.
- The backend exchanges that code for an access + refresh token, stores them
  server-side (in memory, keyed by a random session id), and sets an
  `httpOnly` session cookie in your browser — the frontend never sees the
  actual Spotify tokens.
- The backend auto-refreshes the access token when it's close to expiring.
- Sessions live in memory, so restarting the backend logs everyone out —
  fine for local/personal use. Swap the `sessions` Map in `server.js` for
  Redis/a database if you deploy this somewhere persistent.

## Scopes requested

- `user-top-read` — for your top tracks
- `user-read-recently-played` — for your listening history

## Project structure

```
backend/
  server.js        # Express app: OAuth routes + Spotify API proxy routes
  package.json
  .env.example
frontend/
  src/
    App.jsx         # top-level auth/data orchestration
    api.js           # fetch helpers hitting the backend
    components/
      Login.jsx
      TopTracks.jsx
      History.jsx
      VinylArt.jsx
  package.json
  .env.example
```
