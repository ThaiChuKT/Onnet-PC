import { useEffect, useState } from 'react'
import { api, unwrapApi } from '../lib/api.ts'
import type {
  ApiEnvelope,
  BookingHistoryItem,
  Paged,
  ReviewSubmitResponse,
} from '../types/api.ts'

export function RentalHistoryPage() {
  const [items, setItems] = useState<BookingHistoryItem[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [ratings, setRatings] = useState<Record<number, number>>({})
  const [comments, setComments] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState<number | null>(null)

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

  useEffect(() => {
    void loadHistory()
  }, [page])

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
