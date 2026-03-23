import { useEffect, useState } from 'react'
import { api, unwrapApi } from '../lib/api.ts'
import type {
  AdminBookingItem,
  AdminPcItem,
  AdminReviewItem,
  AdminUserItem,
  ApiEnvelope,
  Paged,
} from '../types/api.ts'

export function AdminPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [pcs, setPcs] = useState<AdminPcItem[]>([])
  const [bookings, setBookings] = useState<AdminBookingItem[]>([])
  const [reviews, setReviews] = useState<AdminReviewItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadAdminData() {
    setLoading(true)
    setError('')
    try {
      const [usersRes, pcsRes, bookingsRes, reviewsRes] = await Promise.all([
        api.get<ApiEnvelope<Paged<AdminUserItem>>>('/admin/users', { params: { page: 0, size: 8 } }),
        api.get<ApiEnvelope<Paged<AdminPcItem>>>('/admin/pcs', { params: { page: 0, size: 8 } }),
        api.get<ApiEnvelope<Paged<AdminBookingItem>>>('/admin/bookings', { params: { page: 0, size: 8 } }),
        api.get<ApiEnvelope<Paged<AdminReviewItem>>>('/admin/reviews/pending', { params: { page: 0, size: 8 } }),
      ])
      setUsers(unwrapApi(usersRes.data).content)
      setPcs(unwrapApi(pcsRes.data).content)
      setBookings(unwrapApi(bookingsRes.data).content)
      setReviews(unwrapApi(reviewsRes.data).content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAdminData()
  }, [])

  async function setUserActive(userId: number, active: boolean) {
    setError('')
    setMessage('')
    try {
      await api.patch(`/admin/users/${userId}/active`, { active })
      setMessage('User status updated')
      await loadAdminData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status')
    }
  }

  async function setBookingStatus(bookingId: number, status: string) {
    setError('')
    setMessage('')
    try {
      await api.patch(`/admin/bookings/${bookingId}/status`, { status })
      setMessage('Booking status updated')
      await loadAdminData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking status')
    }
  }

  async function setReviewStatus(reviewId: number, status: string) {
    setError('')
    setMessage('')
    try {
      await api.patch(`/admin/reviews/${reviewId}/status`, { status })
      setMessage('Review status updated')
      await loadAdminData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review status')
    }
  }

  return (
    <section className="stack">
      <h2>Admin Dashboard</h2>
      {loading ? <div className="card">Loading admin data...</div> : null}
      {error ? <div className="card error">{error}</div> : null}
      {message ? <div className="card success">{message}</div> : null}

      <article className="card stack">
        <h3>Users</h3>
        {users.map((user) => (
          <div key={user.id} className="row">
            <span>{user.fullName} ({user.email})</span>
            <div className="row">
              <span className="meta">{user.active ? 'active' : 'locked'}</span>
              <button className="btn ghost" onClick={() => setUserActive(user.id, !user.active)}>
                {user.active ? 'Lock' : 'Unlock'}
              </button>
            </div>
          </div>
        ))}
      </article>

      <article className="card stack">
        <h3>Machines</h3>
        {pcs.map((pc) => (
          <div key={pc.pcId} className="row">
            <span>{pc.specName} - {pc.location}</span>
            <span className="meta">{pc.status} • ${Number(pc.pricePerHour).toFixed(2)}/h</span>
          </div>
        ))}
      </article>

      <article className="card stack">
        <h3>Bookings</h3>
        {bookings.map((booking) => (
          <div key={booking.bookingId} className="row">
            <span>#{booking.bookingId} {booking.userEmail} - {booking.specName}</span>
            <div className="row">
              <span className="meta">{booking.status}</span>
              <button className="btn ghost" onClick={() => setBookingStatus(booking.bookingId, 'completed')}>
                Mark completed
              </button>
              <button className="btn ghost" onClick={() => setBookingStatus(booking.bookingId, 'cancelled')}>
                Cancel
              </button>
            </div>
          </div>
        ))}
      </article>

      <article className="card stack">
        <h3>Pending Reviews</h3>
        {reviews.length === 0 ? <p className="muted">No pending reviews.</p> : null}
        {reviews.map((review) => (
          <div key={review.reviewId} className="stack">
            <div className="row">
              <span>#{review.reviewId} by {review.userEmail} • {review.rating}/5</span>
              <div className="row">
                <button className="btn ghost" onClick={() => setReviewStatus(review.reviewId, 'approved')}>
                  Approve
                </button>
                <button className="btn ghost" onClick={() => setReviewStatus(review.reviewId, 'rejected')}>
                  Reject
                </button>
              </div>
            </div>
            <p className="muted">{review.comment}</p>
          </div>
        ))}
      </article>
    </section>
  )
}
