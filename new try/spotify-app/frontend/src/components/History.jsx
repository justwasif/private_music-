function formatTimestamp(iso) {
  const date = new Date(iso)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  const datePart = sameDay
    ? 'today'
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const timePart = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${datePart} · ${timePart}`
}

export default function History({ items, loading, onRefresh }) {
  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <p className="eyebrow">side b</p>
          <h2 className="panel__title">Recent tape</h2>
        </div>
        <button className="btn btn--ghost" type="button" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="muted">Rewinding the tape…</p>
      ) : items.length === 0 ? (
        <p className="muted">Nothing played recently.</p>
      ) : (
        <div className="tape">
          {items.map((item, i) => (
            <div className="tape__row" key={`${item.track.id}-${item.played_at}-${i}`}>
              <span className="tape__time">{formatTimestamp(item.played_at)}</span>
              <span className="tape__track">{item.track.name}</span>
              <span className="tape__artist">{item.track.artists}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
