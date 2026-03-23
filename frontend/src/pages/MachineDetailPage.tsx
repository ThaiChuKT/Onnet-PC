import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { api, unwrapApi } from '../lib/api.ts'
import type { ApiEnvelope, BookingPaymentResponse, BookingResponse, MachineDetail } from '../types/api.ts'

export function MachineDetailPage() {
  const { pcId } = useParams()
  const { user } = useAuth()
  const [machine, setMachine] = useState<MachineDetail | null>(null)
  const [currentBooking, setCurrentBooking] = useState<BookingResponse | null>(null)
  const [startTime, setStartTime] = useState('')
  const [totalHours, setTotalHours] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionBusy, setActionBusy] = useState(false)

  useEffect(() => {
    if (!pcId) {
      setError('Missing machine id')
      return
    }

    let cancelled = false

    async function fetchDetail() {
      setLoading(true)
      setError('')
      try {
        const response = await api.get<ApiEnvelope<MachineDetail>>(`/pcs/${pcId}`)
        if (!cancelled) {
          setMachine(unwrapApi(response.data))
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load machine detail')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchDetail()
    return () => {
      cancelled = true
    }
  }, [pcId])

  if (loading) {
    return <div className="card">Loading detail...</div>
  }

  if (error) {
    return <div className="card error">{error}</div>
  }

  if (!machine) {
    return <div className="card">No machine found.</div>
  }

  async function createBooking() {
    if (!pcId) {
      return
    }
    if (!startTime) {
      setError('Please select start time')
      return
    }

    setActionBusy(true)
    setError('')
    setActionMessage('')
    try {
      const response = await api.post<ApiEnvelope<BookingResponse>>('/bookings/hourly', {
        pcId: Number(pcId),
        startTime: new Date(startTime).toISOString(),
        totalHours,
      })
      const booking = unwrapApi(response.data)
      setCurrentBooking(booking)
      setActionMessage(`Booking #${booking.bookingId} created. Pay with wallet to confirm.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setActionBusy(false)
    }
  }

  async function payBookingWithWallet() {
    if (!currentBooking) {
      return
    }

    setActionBusy(true)
    setError('')
    setActionMessage('')
    try {
      const response = await api.post<ApiEnvelope<BookingPaymentResponse>>(`/bookings/${currentBooking.bookingId}/pay-wallet`)
      const payment = unwrapApi(response.data)
      setCurrentBooking((prev) => (prev ? { ...prev, status: payment.status } : prev))
      setActionMessage(`Booking paid successfully. Wallet balance: $${Number(payment.walletBalance).toFixed(2)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setActionBusy(false)
    }
  }

  return (
    <section className="stack">
      <article className="card stack">
        <h2>{machine.specName}</h2>
        <p className="muted">{machine.description}</p>
        <p>{machine.cpu} • {machine.gpu} • RAM {machine.ram} GB • SSD {machine.storage} GB</p>
        <p>OS: {machine.operatingSystem}</p>
        <p className="price">${Number(machine.hourlyPrice).toFixed(2)} / hour</p>
        <p className="meta">Location: {machine.location}</p>
      </article>

      <article className="card stack">
        <h3>Plans</h3>
        {machine.plans.length === 0 ? (
          <p className="muted">No plans available.</p>
        ) : (
          machine.plans.map((plan) => (
            <div className="row" key={plan.id}>
              <strong>{plan.planName}</strong>
              <span className="meta">{plan.durationDays} day(s)</span>
              <span className="price">${Number(plan.price).toFixed(2)}</span>
            </div>
          ))
        )}
      </article>

      {user ? (
        <article className="card stack">
          <h3>Rent This Machine</h3>
          <p className="muted">Hourly booking (non-refundable after payment).</p>
          <div className="grid cols-2">
            <label className="field">
              Start time
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </label>
            <label className="field">
              Number of hours
              <input type="number" min={1} value={totalHours} onChange={(e) => setTotalHours(Number(e.target.value))} />
            </label>
          </div>
          <div className="row">
            <button className="btn" onClick={createBooking} disabled={actionBusy}>
              Create booking
            </button>
            <button
              className="btn ghost"
              onClick={payBookingWithWallet}
              disabled={actionBusy || !currentBooking || currentBooking.status !== 'pending'}
            >
              Pay with wallet
            </button>
          </div>
          {currentBooking ? (
            <p className="muted">
              Booking #{currentBooking.bookingId} • Status: {currentBooking.status} • Total: ${Number(currentBooking.totalPrice).toFixed(2)}
            </p>
          ) : null}
          {actionMessage ? <p className="success">{actionMessage}</p> : null}
        </article>
      ) : null}

      <article className="card stack">
        <h3>Approved reviews</h3>
        {machine.approvedReviews.length === 0 ? (
          <p className="muted">No reviews yet.</p>
        ) : (
          machine.approvedReviews.map((review, index) => (
            <div className="stack" key={`${review.createdAt}-${index}`}>
              <span className="meta">Rating: {review.rating}/5</span>
              <p>{review.comment}</p>
            </div>
          ))
        )}
      </article>
    </section>
  )
}
