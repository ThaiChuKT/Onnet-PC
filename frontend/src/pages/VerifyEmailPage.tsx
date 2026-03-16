import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'

export function VerifyEmailPage() {
  const { token } = useParams()
  const { verifyEmail } = useAuth()
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Missing verification token')
      return
    }

    const safeToken = token

    let cancelled = false

    async function run() {
      setStatus('loading')
      try {
        const result = await verifyEmail(safeToken)
        if (!cancelled) {
          setStatus('ok')
          setMessage(result)
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setMessage(err instanceof Error ? err.message : 'Verification failed')
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [token, verifyEmail])

  return (
    <section className="card stack">
      <h2>Email verification</h2>
      {status === 'loading' ? <p className="muted">Verifying token...</p> : null}
      {status === 'ok' ? <p className="success">{message}</p> : null}
      {status === 'error' ? <p className="error">{message}</p> : null}
      <div className="row">
        <Link className="btn" to="/login">
          Go to login
        </Link>
        <Link className="btn ghost" to="/register">
          Register again
        </Link>
      </div>
    </section>
  )
}
