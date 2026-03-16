import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'

export function HomePage() {
  const { user } = useAuth()

  return (
    <section className="stack">
      <div className="hero">
        <h1>Cloud gaming PCs, ready in seconds.</h1>
        <p>
          Browse specs, compare hourly pricing, and manage your wallet from one dashboard.
          The current MVP already supports auth, machine discovery, profile, and top-up testing.
        </p>
        <div className="row">
          <Link to="/machines" className="btn">
            Browse machines
          </Link>
          {user ? (
            <Link to="/wallet" className="btn ghost">
              Open wallet
            </Link>
          ) : (
            <Link to="/register" className="btn ghost">
              Create account
            </Link>
          )}
        </div>
      </div>

      <div className="grid cols-2">
        <article className="card stack">
          <h3>Quick Start</h3>
          <p className="muted">1. Register an account.</p>
          <p className="muted">2. Verify with the token from register response.</p>
          <p className="muted">3. Login and browse machine details.</p>
        </article>
        <article className="card stack">
          <h3>Current MVP APIs</h3>
          <p className="muted">Auth</p>
          <p className="muted">Machine list + detail</p>
          <p className="muted">Profile + wallet + transactions</p>
        </article>
      </div>
    </section>
  )
}
