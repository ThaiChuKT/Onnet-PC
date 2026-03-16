import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, unwrapApi } from '../lib/api.ts'
import type { ApiEnvelope, PaypalCaptureResponse, TopUpResponse, WalletSummary, WalletTransaction } from '../types/api.ts'

export function WalletPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [summary, setSummary] = useState<WalletSummary | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [amount, setAmount] = useState('10')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadWallet() {
    const [summaryResponse, txResponse] = await Promise.all([
      api.get<ApiEnvelope<WalletSummary>>('/wallet'),
      api.get<ApiEnvelope<WalletTransaction[]>>('/wallet/transactions'),
    ])
    setSummary(unwrapApi(summaryResponse.data))
    setTransactions(unwrapApi(txResponse.data))
  }

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      setLoading(true)
      setError('')
      try {
        await loadWallet()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load wallet')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const paypalStatus = searchParams.get('paypalStatus')
    const orderId = searchParams.get('token')
    if (!paypalStatus) {
      return
    }

    let cancelled = false

    async function handlePaypalReturn() {
      setLoading(true)
      setError('')
      setSuccess('')
      try {
        if (paypalStatus === 'cancel') {
          setError('PayPal top-up was canceled.')
          return
        }

        if (paypalStatus === 'success' && orderId) {
          const response = await api.post<ApiEnvelope<PaypalCaptureResponse>>(`/paypal/orders/${encodeURIComponent(orderId)}/capture`)
          const captureResult = unwrapApi(response.data)
          setSuccess(captureResult.message)
          await loadWallet()
          return
        }

        setError('Missing PayPal order token in callback URL.')
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to finalize PayPal payment')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          navigate('/wallet', { replace: true })
        }
      }
    }

    void handlePaypalReturn()
    return () => {
      cancelled = true
    }
  }, [navigate, searchParams])

  async function onTopUp(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const response = await api.post<ApiEnvelope<TopUpResponse>>('/wallet/top-up', {
        amount: Number(amount),
      })
      const result = unwrapApi(response.data)
      setSuccess(result.message)
      if (result.approvalUrl) {
        window.location.assign(result.approvalUrl)
        return
      }
      setError('PayPal approval link was not returned by the server.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Top-up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="stack">
      <article className="card stack">
        <h2>Wallet</h2>
        {loading ? <p className="muted">Loading...</p> : null}
        <p className="price">Balance: ${Number(summary?.balance ?? 0).toFixed(2)}</p>
        <form className="row" onSubmit={onTopUp}>
          <label className="field" style={{ minWidth: 220 }}>
            Top-up amount
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min={1} step="0.01" required />
          </label>
          <button className="btn" type="submit" disabled={loading}>
            Top-up now
          </button>
        </form>
        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}
      </article>

      <article className="card stack">
        <h3>Transaction history</h3>
        {transactions.length === 0 ? (
          <p className="muted">No transactions yet.</p>
        ) : (
          transactions.map((tx) => (
            <div className="row" key={tx.id}>
              <div>
                <p><strong>{tx.type}</strong></p>
                <p className="meta">{tx.note ?? '-'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="price">${Number(tx.amount).toFixed(2)}</p>
                <p className="meta">{new Date(tx.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </article>
    </section>
  )
}
