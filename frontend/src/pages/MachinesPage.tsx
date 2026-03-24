import { useEffect, useMemo, useState } from 'react'
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

  const GROUP_PAGE_SIZE = 9

  type MachineGroupItem = {
    specId: number
    representativePcId: number
    specName: string
    cpu: string
    gpu: string
    ram: number
    storage: number
    hourlyPrice: number
    availableCount: number
    statusLabel: string
  }

  const groupedMachines = useMemo<MachineGroupItem[]>(() => {
    const map = new Map<number, MachineGroupItem>()

    for (const machine of machines) {
      const found = map.get(machine.specId)
      if (found) {
        found.availableCount += 1
        continue
      }

      map.set(machine.specId, {
        specId: machine.specId,
        representativePcId: machine.pcId,
        specName: machine.specName,
        cpu: machine.cpu,
        gpu: machine.gpu,
        ram: machine.ram,
        storage: machine.storage,
        hourlyPrice: Number(machine.hourlyPrice),
        availableCount: 1,
        statusLabel: 'Available',
      })
    }

    return Array.from(map.values())
  }, [machines])

  const visibleGroups = useMemo(() => {
    const start = page * GROUP_PAGE_SIZE
    const end = start + GROUP_PAGE_SIZE
    return groupedMachines.slice(start, end)
  }, [groupedMachines, page])

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError('')
      try {
        const response = await api.get<ApiEnvelope<Paged<MachineListItem>>>('/pcs', {
          params: {
            page: 0,
            size: 200,
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
          setTotalPages(Math.max(1, Math.ceil(data.content.length / GROUP_PAGE_SIZE)))
          setPage(0)
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
  }, [sort, keyword, cpu, gpu, purpose, ramMin, storageMin, priceMin, priceMax])

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

      {loading ? <div className="card">Loading machine groups...</div> : null}
      {error ? <div className="card error">{error}</div> : null}

      <div className="machine-grid">
        {visibleGroups.map((group) => (
          <article key={group.specId} className="card stack">
            <h3>{group.specName}</h3>
            <p className="meta">{group.cpu} • {group.gpu}</p>
            <p className="meta">RAM {group.ram} GB • SSD {group.storage} GB</p>
            <p className="price">${Number(group.hourlyPrice).toFixed(2)} / hour</p>
            <p className="meta">Available machines: {group.availableCount}</p>
            <p className="meta">Status: {group.statusLabel}</p>
            <Link to={`/machines/${group.representativePcId}`} className="btn">
              View detail
            </Link>
          </article>
        ))}
      </div>

      {!loading && !error && visibleGroups.length === 0 ? (
        <div className="card">No machine groups found for current filters.</div>
      ) : null}

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
