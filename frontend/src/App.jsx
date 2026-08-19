import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [user, setUser] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await fetch(
          `${API_URL}/api/v1/spotify/me`,
          {
            credentials: "include",
          }
        );

        if (!userRes.ok) {
          setUser(null);
          setTracks([]);
          return;
        }

        const userData = await userRes.json();
        setUser(userData.data);

        const tracksRes = await fetch(
          `${API_URL}/api/v1/spotify/top-tracks?timeRange=long_term&limit=5`,
          {
            credentials: "include",
          }
        );

        if (!tracksRes.ok) {
          const data = await tracksRes.json().catch(() => null);
          setError(
            data?.message || "Unable to fetch Spotify tracks."
          );
          return;
        }

        const tracksData = await tracksRes.json();
        setTracks(tracksData.data || []);
        setError("");
      } catch (error) {
        console.error(error);
        setError("Unable to connect to the API server.");
        setUser(null);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const login = () => {
    window.location.href =
      `${API_URL}/api/v1/spotify/login`;
  };

  const logout = async () => {
    await fetch(
      `${API_URL}/api/v1/spotify/logout`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    setUser(null);
    setTracks([]);
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!user) {
    return (
      <div className="container">
        <h1>Music City</h1>

        {error && <p className="error">{error}</p>}

        <p>
          Connect your Spotify account to see
          your top tracks.
        </p>

        <button onClick={login}>
          Login with Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="container">

      {/* USER */}

      <section className="user">
        {user.images?.[0]?.url && (
          <img
            src={user.images[0].url}
            alt={user.display_name}
          />
        )}

        <div>
          <h1>{user.display_name}</h1>

          <p>
            Spotify ID: {user.id}
          </p>
        </div>

        <button onClick={logout}>
          Logout
        </button>
      </section>


      {/* TOP TRACKS */}

      <section>
        <h2>Your Top 5 Tracks</h2>

        {error && <p className="error">{error}</p>}

        <div className="tracks">

          {tracks.map((track, index) => (
            <div
              className="track"
              key={track.id}
            >

              <span className="rank">
                #{index + 1}
              </span>

              <img
                src={
                  track.album?.images?.[2]?.url ||
                  track.album?.images?.[0]?.url
                }
                alt={track.name}
              />

              <div>
                <h3>{track.name}</h3>

                <p>
                  {track.artists
                    ?.map(
                      (artist) => artist.name
                    )
                    .join(", ")}
                </p>

                <small>
                  {track.album?.name}
                </small>
              </div>

            </div>
          ))}

        </div>
      </section>

    </div>
  );
}

export default App;
