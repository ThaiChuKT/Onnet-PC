import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'

export function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  })
  const [verificationToken, setVerificationToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await register(form)
      setVerificationToken(response.verificationToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid cols-2">
      <article className="card stack">
        <h2>Create account</h2>
        <form className="stack" onSubmit={onSubmit}>
          <label className="field">
            Full name
            <input
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </label>
          <label className="field">
            Email
            <input
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              type="email"
              required
            />
          </label>
          <label className="field">
            Phone
            <input
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              required
            />
          </label>
          <label className="field">
            Password
            <input
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              type="password"
              minLength={8}
              required
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
      </article>

      <article className="card stack">
        <h3>Email verification</h3>
        <p className="muted">Use this token to finish verification.</p>
        {verificationToken ? (
          <>
            <p><strong>Token:</strong> {verificationToken}</p>
            <Link className="btn" to={`/verify-email/${verificationToken}`}>
              Verify now
            </Link>
          </>
        ) : (
          <p className="muted">Token appears after successful registration.</p>
        )}
      </article>
    </section>
  )
}
