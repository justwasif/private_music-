import VinylArt from './VinylArt'

const RANGES = [
  { value: 'short_term', label: '4 weeks' },
  { value: 'medium_term', label: '6 months' },
  { value: 'long_term', label: 'all time' },
]

function formatDuration(ms) {
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export default function TopTracks({ tracks, loading, range, onRangeChange }) {
  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <p className="eyebrow">side a</p>
          <h2 className="panel__title">Top 5</h2>
        </div>
        <div className="range-picker" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r.value}
              className={`range-picker__btn${range === r.value ? ' is-active' : ''}`}
              onClick={() => onRangeChange(r.value)}
              type="button"
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="muted">Cueing up your top tracks…</p>
      ) : tracks.length === 0 ? (
        <p className="muted">
          No listening data for this range yet — Spotify needs a bit more
          history from you first.
        </p>
      ) : (
        <ol className="top-tracks">
          {tracks.map((track, i) => (
            <li className="top-tracks__item" key={track.id}>
              <span className="top-tracks__rank">{String(i + 1).padStart(2, '0')}</span>
              <VinylArt src={track.albumArt} alt="" size={64} />
              <div className="top-tracks__meta">
                <a
                  className="top-tracks__name"
                  href={track.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {track.name}
                </a>
                <span className="top-tracks__artist">{track.artists}</span>
              </div>
              <span className="top-tracks__duration">{formatDuration(track.durationMs)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
