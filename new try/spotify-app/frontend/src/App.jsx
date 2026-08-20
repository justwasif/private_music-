import { useEffect, useState, useCallback } from "react";
import { spotifyApi } from "./services/spotifyApi";
import Login from "./components/Login";
import TopTracks from "./components/TopTracks";
import History from "./components/History";
import "./App.css";

function useQueryError() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryError = params.get("error");

    if (!queryError) return;

    setError(queryError.replaceAll("_", " "));
    params.delete("error");

    const cleanUrl =
      window.location.pathname +
      (params.toString() ? `?${params}` : "");

    window.history.replaceState({}, "", cleanUrl);
  }, []);

  return error;
}

export default function App() {
  const queryError = useQueryError();
  const [authState, setAuthState] = useState("checking");
  const [profile, setProfile] = useState(null);
  const [range, setRange] = useState("medium_term");
  const [tracks, setTracks] = useState([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    spotifyApi
      .status()
      .then((data) =>
        setAuthState(data.authenticated ? "in" : "out")
      )
      .catch(() => setAuthState("out"));
  }, []);

  const loadTopTracks = useCallback((timeRange) => {
    setTracksLoading(true);

    spotifyApi
      .topTracks(timeRange)
      .then(setTracks)
      .catch(() => setTracks([]))
      .finally(() => setTracksLoading(false));
  }, []);

  const loadHistory = useCallback(() => {
    setHistoryLoading(true);

    spotifyApi
      .recentlyPlayed(25)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    if (authState !== "in") return;

    spotifyApi.me().then(setProfile).catch(() => {});
    loadTopTracks(range);
    loadHistory();
  }, [authState, loadHistory, loadTopTracks, range]);

  const handleLogout = async () => {
    await spotifyApi.logout().catch(() => {});
    setAuthState("out");
    setProfile(null);
    setTracks([]);
    setHistory([]);
  };

  if (authState === "checking") {
    return (
      <div className="loading-screen">
        <span className="muted">Loading…</span>
      </div>
    );
  }

  if (authState === "out") {
    return (
      <div className="page page--center">
        <Login
          loginUrl={spotifyApi.loginUrl()}
          error={queryError}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">now playing back</p>
          <h1 className="topbar__title">Spin</h1>
        </div>

        <div className="topbar__user">
          {profile && (
            <span className="topbar__name">
              {profile.display_name || profile.id}
            </span>
          )}

          <button
            className="btn btn--ghost"
            onClick={handleLogout}
            type="button"
          >
            Disconnect
          </button>
        </div>
      </header>

      <main className="layout">
        <TopTracks
          tracks={tracks}
          loading={tracksLoading}
          range={range}
          onRangeChange={setRange}
        />

        <History
          items={history}
          loading={historyLoading}
          onRefresh={loadHistory}
        />
      </main>
    </div>
  );
}
