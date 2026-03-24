import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { api, unwrapApi } from '../lib/api.ts'
import type { ApiEnvelope, MachineDetail, RentMachineResponse } from '../types/api.ts'

const RENTAL_UNITS = [
  { label: 'Hour', value: 'hour', hoursPerUnit: 1 },
  { label: 'Week', value: 'week', hoursPerUnit: 24 * 7 },
  { label: 'Month (30 days)', value: 'month', hoursPerUnit: 24 * 30 },
  { label: 'Year (365 days)', value: 'year', hoursPerUnit: 24 * 365 },
] as const

type RentalUnitValue = (typeof RENTAL_UNITS)[number]['value']

export function MachineDetailPage() {
  const { pcId } = useParams()
  const { user } = useAuth()
  const [machine, setMachine] = useState<MachineDetail | null>(null)
  const [rentResult, setRentResult] = useState<RentMachineResponse | null>(null)
  const [rentalUnit, setRentalUnit] = useState<RentalUnitValue>('hour')
  const [quantity, setQuantity] = useState(1)
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
    if (!machine) {
      setError('Machine detail is not loaded yet')
      return
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      setError('Please enter a valid quantity (at least 1)')
      return
    }

    const unit = RENTAL_UNITS.find((item) => item.value === rentalUnit) ?? RENTAL_UNITS[0]

    setActionBusy(true)
    setError('')
    setActionMessage('')
    try {
      const response = await api.post<ApiEnvelope<RentMachineResponse>>('/bookings/rent', {
        specId: machine.specId,
        rentalUnit: unit.value,
        quantity,
      })

      const result = unwrapApi(response.data)
      setRentResult(result)
      if (result.queued) {
        setActionMessage(
          `Booking #${result.bookingId} has been added to queue at position #${result.queuePosition}.`,
        )
      } else if ((result.status ?? '').toLowerCase() === 'pending') {
        setActionMessage(
          `Booking #${result.bookingId} is pending. Please go to Rentals and pay with wallet.`,
        )
      } else {
        setActionMessage(
          `Session #${result.sessionId} started on machine #${result.pcId} (${result.pcLocation}).`,
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
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
          <p className="muted">Choose rental unit and confirm once. System will auto charge wallet and assign machine or enqueue you.</p>
          <div className="grid cols-2">
            <label className="field">
              Rental unit
              <select value={rentalUnit} onChange={(e) => setRentalUnit(e.target.value as RentalUnitValue)}>
                {RENTAL_UNITS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Quantity
              <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </label>
          </div>
          <div className="row">
            <button className="btn" onClick={createBooking} disabled={actionBusy}>
              Confirm rent
            </button>
          </div>
          {rentResult ? (
            <p className="muted">
              Booking #{rentResult.bookingId} • Status: {rentResult.status} • Total: ${Number(rentResult.totalPrice).toFixed(2)}
              {!rentResult.queued && rentResult.walletBalance !== null && Number.isFinite(rentResult.walletBalance)
                ? ` • Wallet: $${Number(rentResult.walletBalance).toFixed(2)}`
                : ''}
            </p>
          ) : null}
          {rentResult?.queued ? (
            <p className="meta">Queued booking is not charged yet. Wallet will be deducted when a machine is assigned.</p>
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
