import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      const to = (location.state as { from?: string } | null)?.from ?? '/machines'
      navigate(to)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid cols-2">
      <article className="card stack">
        <h2>Login</h2>
        <p className="muted">Use your verified account to continue.</p>
        <form className="stack" onSubmit={onSubmit}>
          <label className="field">
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label className="field">
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="muted">
          No account? <Link to="/register">Register here</Link>
        </p>
      </article>
      <article className="card stack">
        <h3>Verification note</h3>
        <p className="muted">
          If login fails with email verification errors, complete verification from the register page using the code sent to your email.
        </p>
      </article>
    </section>
  )
}
