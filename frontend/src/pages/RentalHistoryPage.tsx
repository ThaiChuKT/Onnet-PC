import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, unwrapApi } from '../lib/api.ts'
import type {
  ActiveSessionResponse,
  ApiEnvelope,
  BookingPaymentResponse,
  BookingHistoryItem,
  EndSessionResponse,
  Paged,
  ReviewSubmitResponse,
  StartSessionResponse,
} from '../types/api.ts'

export function RentalHistoryPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<BookingHistoryItem[]>([])
  const [currentSession, setCurrentSession] = useState<ActiveSessionResponse | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [ratings, setRatings] = useState<Record<number, number>>({})
  const [comments, setComments] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState<number | null>(null)
  const [startingBookingId, setStartingBookingId] = useState<number | null>(null)
  const [payingBookingId, setPayingBookingId] = useState<number | null>(null)
  const [endingSession, setEndingSession] = useState(false)

  async function loadHistory() {
    setLoading(true)
    setError('')
    try {
      const response = await api.get<ApiEnvelope<Paged<BookingHistoryItem>>>('/bookings/my', {
        params: { page, size: 10 },
      })
      const data = unwrapApi(response.data)
      setItems(data.content)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking history')
    } finally {
      setLoading(false)
    }
  }

  async function loadCurrentSession() {
    setSessionLoading(true)
    try {
      const response = await api.get<ApiEnvelope<ActiveSessionResponse>>('/sessions/current')
      const data = unwrapApi(response.data)
      setCurrentSession(data)
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : ''
      if (message.includes('no active session') || message.includes('not found')) {
        setCurrentSession(null)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load current session')
      }
    } finally {
      setSessionLoading(false)
    }
  }

  useEffect(() => {
    void loadHistory()
  }, [page])

  useEffect(() => {
    void loadCurrentSession()
  }, [])

  async function startSession(bookingId: number) {
    setStartingBookingId(bookingId)
    setError('')
    setSuccess('')
    try {
      const response = await api.post<ApiEnvelope<StartSessionResponse>>(`/bookings/${bookingId}/start-session`)
      const data = unwrapApi(response.data)
      setSuccess(data.message)
      await Promise.all([loadHistory(), loadCurrentSession()])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session')
    } finally {
      setStartingBookingId(null)
    }
  }

  async function endCurrentSession() {
    setEndingSession(true)
    setError('')
    setSuccess('')
    try {
      const response = await api.post<ApiEnvelope<EndSessionResponse>>('/sessions/current/end')
      const data = unwrapApi(response.data)
      setSuccess(data.message)
      await Promise.all([loadHistory(), loadCurrentSession()])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end current session')
    } finally {
      setEndingSession(false)
    }
  }

  async function payBooking(bookingId: number) {
    setPayingBookingId(bookingId)
    setError('')
    setSuccess('')
    try {
      const response = await api.post<ApiEnvelope<BookingPaymentResponse>>(`/bookings/${bookingId}/pay-wallet`)
      const data = unwrapApi(response.data)
      setSuccess(`Booking #${data.bookingId} is paid. Wallet balance: $${Number(data.walletBalance).toFixed(2)}`)
      await Promise.all([loadHistory(), loadCurrentSession()])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to pay booking'
      setError(message)
      if (message.toLowerCase().includes('insufficient wallet balance')) {
        setSuccess('Your wallet is not enough. Please top up and pay again.')
      }
    } finally {
      setPayingBookingId(null)
    }
  }

  async function submitReview(bookingId: number) {
    const rating = ratings[bookingId] ?? 5
    const comment = comments[bookingId] ?? ''
    setSubmitting(bookingId)
    setError('')
    setSuccess('')
    try {
      const response = await api.post<ApiEnvelope<ReviewSubmitResponse>>(`/bookings/${bookingId}/reviews`, {
        rating,
        comment,
      })
      const result = unwrapApi(response.data)
      setSuccess(`Review #${result.reviewId} submitted and waiting for approval.`)
      void loadHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <section className="stack">
      <h2>Rental History</h2>
      {loading ? <div className="card">Loading history...</div> : null}
      {error ? <div className="card error">{error}</div> : null}
      {success ? <div className="card success">{success}</div> : null}

      <article className="card stack">
        <div className="row">
          <strong>Current Session</strong>
          <button className="btn ghost" onClick={() => void loadCurrentSession()} disabled={sessionLoading}>
            Refresh
          </button>
        </div>
        {sessionLoading ? <p className="muted">Loading session...</p> : null}
        {!sessionLoading && !currentSession ? <p className="muted">No active session.</p> : null}
        {currentSession ? (
          <>
            <p>
              PC #{currentSession.pcId} • {currentSession.pcLocation}
            </p>
            <p className="meta">
              Started: {new Date(currentSession.startedAt).toLocaleString()} • Expected end:{' '}
              {currentSession.expectedEndTime ? new Date(currentSession.expectedEndTime).toLocaleString() : '-'}
            </p>
            <p className="muted">Remaining: {Math.max(0, Math.floor(currentSession.remainingSeconds / 60))} minute(s)</p>
            {currentSession.warning15Minutes ? (
              <p className="error">Warning: session will expire in 15 minutes.</p>
            ) : null}
            <button className="btn warn" onClick={() => void endCurrentSession()} disabled={endingSession}>
              {endingSession ? 'Ending...' : 'End Session'}
            </button>
          </>
        ) : null}
      </article>

      {items.map((item) => (
        <article key={item.bookingId} className="card stack">
          <div className="row">
            <strong>Booking #{item.bookingId}</strong>
            <span className="chip">{item.status}</span>
          </div>
          <p>
            {item.specName ?? 'Machine'} • {item.totalHours ?? '-'} hour(s)
          </p>
          <p className="meta">
            Start: {new Date(item.startTime).toLocaleString()} • End: {new Date(item.endTime).toLocaleString()}
          </p>
          <p className="price">Total: ${Number(item.totalPrice).toFixed(2)}</p>
          {item.status === 'paid' && item.remainingMinutes !== null ? (
            <p className="muted">Remaining time: {item.remainingMinutes} minute(s)</p>
          ) : null}

          {item.status === 'paid' ? (
            <button
              className="btn"
              onClick={() => void startSession(item.bookingId)}
              disabled={startingBookingId === item.bookingId || Boolean(currentSession)}
            >
              {startingBookingId === item.bookingId ? 'Starting...' : 'Start session'}
            </button>
          ) : null}

          {item.status === 'pending' ? (
            <div className="row">
              <button
                className="btn"
                onClick={() => void payBooking(item.bookingId)}
                disabled={payingBookingId === item.bookingId}
              >
                {payingBookingId === item.bookingId ? 'Paying...' : 'Pay with wallet'}
              </button>
              <button className="btn ghost" onClick={() => navigate('/wallet')}>
                Top up wallet
              </button>
            </div>
          ) : null}

          {item.status === 'completed' ? (
            <div className="stack">
              <h4>Leave a review</h4>
              <div className="grid cols-2">
                <label className="field">
                  Rating (1-5)
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={ratings[item.bookingId] ?? 5}
                    onChange={(e) => setRatings((prev) => ({ ...prev, [item.bookingId]: Number(e.target.value) }))}
                  />
                </label>
                <label className="field">
                  Comment
                  <input
                    value={comments[item.bookingId] ?? ''}
                    onChange={(e) => setComments((prev) => ({ ...prev, [item.bookingId]: e.target.value }))}
                  />
                </label>
              </div>
              <button
                className="btn"
                onClick={() => submitReview(item.bookingId)}
                disabled={submitting === item.bookingId}
              >
                Submit review
              </button>
            </div>
          ) : null}
        </article>
      ))}

      <div className="row">
        <button className="btn ghost" onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page <= 0}>
          Previous
        </button>
        <p className="meta">Page {page + 1} / {Math.max(totalPages, 1)}</p>
        <button
          className="btn ghost"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={totalPages > 0 && page + 1 >= totalPages}
        >
          Next
        </button>
      </div>
    </section>
  )
}
