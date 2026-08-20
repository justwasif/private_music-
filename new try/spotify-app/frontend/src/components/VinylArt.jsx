export default function VinylArt({ src, alt, size = 88, spin = false }) {
  return (
    <div
      className={`vinyl${spin ? ' vinyl--spin' : ''}`}
      style={{ width: size, height: size }}
    >
      <div className="vinyl__grooves" />
      {src ? (
        <img className="vinyl__label" src={src} alt={alt} loading="lazy" />
      ) : (
        <div className="vinyl__label vinyl__label--empty" aria-hidden="true" />
      )}
      <div className="vinyl__hole" />
    </div>
  )
}
