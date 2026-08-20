export default function Login({ loginUrl, error }) {
  return (
    <div className="login">
      <div className="login__mark">
        <div className="login__ring" />
        <div className="login__ring login__ring--inner" />
      </div>
      <p className="eyebrow">side a</p>
      <h1 className="login__title">Spin</h1>
      <p className="login__sub">
        Connect your Spotify account to pull up your five most-played tracks
        and a running tape of what you've actually been listening to.
      </p>
      {error && <p className="login__error">Couldn't sign in — {error}. Try again.</p>}
      <a className="btn btn--primary" href={loginUrl}>
        Connect Spotify
      </a>
      <p className="login__note">
        You'll be asked to approve read-only access to your top tracks and
        recent listening history. Nothing is posted or changed on your
        account.
      </p>
    </div>
  )
}
