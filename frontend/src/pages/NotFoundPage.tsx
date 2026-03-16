import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="card stack">
      <h2>Page not found</h2>
      <p className="muted">This route does not exist in ONNET frontend.</p>
      <Link to="/" className="btn">
        Back home
      </Link>
    </section>
  )
}
