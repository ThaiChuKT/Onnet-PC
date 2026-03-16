import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, unwrapApi } from '../lib/api.ts'
import type { ApiEnvelope, MachineListItem, Paged } from '../types/api.ts'

const SORT_OPTIONS = [
  { label: 'Price low to high', value: 'price_asc' },
  { label: 'Price high to low', value: 'price_desc' },
  { label: 'Newest', value: 'newest' },
]

export function MachinesPage() {
  const [machines, setMachines] = useState<MachineListItem[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [sort, setSort] = useState('price_asc')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError('')
      try {
        const response = await api.get<ApiEnvelope<Paged<MachineListItem>>>('/pcs', {
          params: { page, size: 9, sort },
        })
        const data = unwrapApi(response.data)
        if (!cancelled) {
          setMachines(data.content)
          setTotalPages(data.totalPages)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load machines')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchData()
    return () => {
      cancelled = true
    }
  }, [page, sort])

  return (
    <section className="stack">
      <div className="row">
        <h2>Machine Catalog</h2>
        <label className="field" style={{ minWidth: 220 }}>
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? <div className="card">Loading machines...</div> : null}
      {error ? <div className="card error">{error}</div> : null}

      <div className="machine-grid">
        {machines.map((pc) => (
          <article key={pc.pcId} className="card stack">
            <h3>{pc.specName}</h3>
            <p className="meta">{pc.cpu} • {pc.gpu}</p>
            <p className="meta">RAM {pc.ram} GB • SSD {pc.storage} GB</p>
            <p className="price">${Number(pc.hourlyPrice).toFixed(2)} / hour</p>
            <p className="meta">{pc.location}</p>
            <Link to={`/machines/${pc.pcId}`} className="btn">
              View detail
            </Link>
          </article>
        ))}
      </div>

      <div className="row">
        <button className="btn ghost" onClick={() => setPage((prev) => Math.max(0, prev - 1))} disabled={page <= 0}>
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
