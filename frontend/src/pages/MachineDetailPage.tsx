import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, unwrapApi } from '../lib/api.ts'
import type { ApiEnvelope, MachineDetail } from '../types/api.ts'

export function MachineDetailPage() {
  const { pcId } = useParams()
  const [machine, setMachine] = useState<MachineDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
            <div className="row" key={plan.planId}>
              <strong>{plan.planName}</strong>
              <span className="meta">{plan.durationMonth} month(s)</span>
              <span className="price">${Number(plan.finalPrice).toFixed(2)}</span>
            </div>
          ))
        )}
      </article>

      <article className="card stack">
        <h3>Approved reviews</h3>
        {machine.approvedReviews.length === 0 ? (
          <p className="muted">No reviews yet.</p>
        ) : (
          machine.approvedReviews.map((review) => (
            <div className="stack" key={review.reviewId}>
              <div className="row">
                <strong>{review.reviewerName}</strong>
                <span className="meta">Rating: {review.rating}/5</span>
              </div>
              <p>{review.comment}</p>
            </div>
          ))
        )}
      </article>
    </section>
  )
}
