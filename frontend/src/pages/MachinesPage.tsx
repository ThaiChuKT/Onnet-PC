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
  const [keyword, setKeyword] = useState('')
  const [cpu, setCpu] = useState('')
  const [gpu, setGpu] = useState('')
  const [purpose, setPurpose] = useState('')
  const [ramMin, setRamMin] = useState('')
  const [storageMin, setStorageMin] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError('')
      try {
        const response = await api.get<ApiEnvelope<Paged<MachineListItem>>>('/pcs', {
          params: {
            page,
            size: 9,
            sort,
            keyword: keyword.trim() || undefined,
            cpu: cpu.trim() || undefined,
            gpu: gpu.trim() || undefined,
            purpose: purpose.trim() || undefined,
            ramMin: ramMin.trim() ? Number(ramMin) : undefined,
            storageMin: storageMin.trim() ? Number(storageMin) : undefined,
            priceMin: priceMin.trim() ? Number(priceMin) : undefined,
            priceMax: priceMax.trim() ? Number(priceMax) : undefined,
          },
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
  }, [page, sort, keyword, cpu, gpu, purpose, ramMin, storageMin, priceMin, priceMax])

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

      <div className="card grid cols-2">
        <label className="field">
          Keyword
          <input value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(0) }} placeholder="spec name or description" />
        </label>
        <label className="field">
          Purpose
          <input value={purpose} onChange={(e) => { setPurpose(e.target.value); setPage(0) }} placeholder="gaming, editing, coding..." />
        </label>
        <label className="field">
          CPU contains
          <input value={cpu} onChange={(e) => { setCpu(e.target.value); setPage(0) }} placeholder="Ryzen, i7..." />
        </label>
        <label className="field">
          GPU contains
          <input value={gpu} onChange={(e) => { setGpu(e.target.value); setPage(0) }} placeholder="RTX, RX..." />
        </label>
        <label className="field">
          Min RAM (GB)
          <input value={ramMin} onChange={(e) => { setRamMin(e.target.value); setPage(0) }} type="number" min={0} />
        </label>
        <label className="field">
          Min Storage (GB)
          <input value={storageMin} onChange={(e) => { setStorageMin(e.target.value); setPage(0) }} type="number" min={0} />
        </label>
        <label className="field">
          Min Price ($/hour)
          <input value={priceMin} onChange={(e) => { setPriceMin(e.target.value); setPage(0) }} type="number" min={0} step="0.01" />
        </label>
        <label className="field">
          Max Price ($/hour)
          <input value={priceMax} onChange={(e) => { setPriceMax(e.target.value); setPage(0) }} type="number" min={0} step="0.01" />
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
