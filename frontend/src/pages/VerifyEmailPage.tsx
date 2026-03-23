import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'

type VerifyLocationState = {
  email?: string
}

export function VerifyEmailPage() {
  const { verifyEmail } = useAuth()
  const location = useLocation()
  const state = location.state as VerifyLocationState | null
  const email = state?.email?.trim() ?? ''

  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!email) {
    return <Navigate to="/register" replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const result = await verifyEmail({ email, code: code.trim() })
      setMessage(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <article className="card stack">
        <h2>Email verification</h2>
        <p className="muted">We sent a 6-digit code to {email}.</p>
        <form className="stack" onSubmit={onSubmit}>
          <label className="field">
            Verification code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          {message ? <p className="success">{message}</p> : null}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Complete registration'}
          </button>
        </form>
        <p className="muted">
          Already verified? <Link to="/login">Login here</Link>
        </p>
      </article>
    </section>
  )
}
