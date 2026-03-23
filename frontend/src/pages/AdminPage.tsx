import { useEffect, useState } from 'react'
import { api, unwrapApi } from '../lib/api.ts'
import type {
  AdminPcItem,
  AdminUserPaymentItem,
  AdminUserItem,
  ApiEnvelope,
  Paged,
} from '../types/api.ts'

type AdminTab = 'users' | 'machines' | 'payments'

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users')
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [pcs, setPcs] = useState<AdminPcItem[]>([])
  const [payments, setPayments] = useState<AdminUserPaymentItem[]>([])
  const [selectedPaymentUserId, setSelectedPaymentUserId] = useState<string>('')
  const [selectedPaymentUserName, setSelectedPaymentUserName] = useState<string>('')
  const [usersLoading, setUsersLoading] = useState(false)
  const [pcsLoading, setPcsLoading] = useState(false)
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [userKeyword, setUserKeyword] = useState('')
  const [pcStatusFilter, setPcStatusFilter] = useState('')
  const [createPcForm, setCreatePcForm] = useState({
    specName: '',
    cpu: '',
    gpu: '',
    ram: '',
    storage: '',
    operatingSystem: '',
    description: '',
    pricePerHour: '',
    location: '',
    status: 'available',
  })
  const [editPcState, setEditPcState] = useState<Record<number, { location: string; status: string; pricePerHour: string }>>({})

  async function loadUsers() {
    setUsersLoading(true)
    setError('')
    try {
      const usersRes = await api.get<ApiEnvelope<Paged<AdminUserItem>>>('/admin/users', {
        params: { page: 0, size: 20, keyword: userKeyword.trim() || undefined },
      })
      setUsers(unwrapApi(usersRes.data).content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setUsersLoading(false)
    }
  }

  async function loadUserPayments(userId: number) {
    setPaymentsLoading(true)
    setError('')
    try {
      const paymentRes = await api.get<ApiEnvelope<AdminUserPaymentItem[]>>(`/admin/users/${userId}/payments`)
      setPayments(unwrapApi(paymentRes.data))
      const selectedUser = users.find((item) => item.id === userId)
      setSelectedPaymentUserName(selectedUser?.fullName ?? selectedUser?.email ?? `User #${userId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment history')
    } finally {
      setPaymentsLoading(false)
    }
  }

  async function loadPcs() {
    setPcsLoading(true)
    setError('')
    try {
      const pcsRes = await api.get<ApiEnvelope<Paged<AdminPcItem>>>('/admin/pcs', {
        params: { page: 0, size: 20, status: pcStatusFilter || undefined },
      })
      setPcs(unwrapApi(pcsRes.data).content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load machines')
    } finally {
      setPcsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  useEffect(() => {
    void loadPcs()
  }, [pcStatusFilter])

  async function setUserActive(userId: number, active: boolean) {
    setError('')
    setMessage('')
    try {
      await api.patch(`/admin/users/${userId}/active`, { active })
      setMessage('User status updated')
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status')
    }
  }

  async function deleteUser(user: AdminUserItem) {
    const confirmed = window.confirm(`Delete user ${user.email}? This action cannot be undone.`)
    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')
    try {
      await api.delete(`/admin/users/${user.id}`)
      setMessage('User deleted')
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  async function viewPayments(user: AdminUserItem) {
    setActiveTab('payments')
    setSelectedPaymentUserId(String(user.id))
    await loadUserPayments(user.id)
  }

  async function handlePaymentSearch() {
    const parsed = Number(selectedPaymentUserId)
    if (!selectedPaymentUserId.trim() || Number.isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid User ID to view payment history')
      return
    }
    await loadUserPayments(parsed)
  }

  async function createMachine() {
    setError('')
    setMessage('')
    if (!createPcForm.specName.trim() || !createPcForm.location.trim() || !createPcForm.pricePerHour.trim()) {
      setError('specName, location and pricePerHour are required')
      return
    }

    try {
      await api.post('/admin/pcs', {
        specName: createPcForm.specName,
        cpu: createPcForm.cpu || null,
        gpu: createPcForm.gpu || null,
        ram: createPcForm.ram ? Number(createPcForm.ram) : null,
        storage: createPcForm.storage ? Number(createPcForm.storage) : null,
        operatingSystem: createPcForm.operatingSystem || null,
        description: createPcForm.description || null,
        pricePerHour: Number(createPcForm.pricePerHour),
        location: createPcForm.location,
        status: createPcForm.status,
      })
      setMessage('Machine created')
      setCreatePcForm({
        specName: '',
        cpu: '',
        gpu: '',
        ram: '',
        storage: '',
        operatingSystem: '',
        description: '',
        pricePerHour: '',
        location: '',
        status: 'available',
      })
      await loadPcs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create machine')
    }
  }

  async function updateMachine(pc: AdminPcItem) {
    setError('')
    setMessage('')
    const local = editPcState[pc.pcId]
    const payload = {
      location: local?.location ?? pc.location,
      status: local?.status ?? pc.status,
      pricePerHour: Number(local?.pricePerHour ?? pc.pricePerHour),
    }

    try {
      await api.patch(`/admin/pcs/${pc.pcId}`, payload)
      setMessage(`Machine #${pc.pcId} updated`)
      await loadPcs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update machine')
    }
  }

  async function deleteMachine(pcId: number) {
    setError('')
    setMessage('')
    try {
      await api.delete(`/admin/pcs/${pcId}`)
      setMessage(`Machine #${pcId} deleted`)
      await loadPcs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete machine')
    }
  }

  function renderUsersSection() {
    return (
      <article className="card stack">
        <div className="row">
          <h3>Users</h3>
          <div className="row">
            <input
              value={userKeyword}
              onChange={(e) => setUserKeyword(e.target.value)}
              placeholder="Search by name or email"
            />
            <button className="btn ghost" onClick={() => void loadUsers()}>
              Search
            </button>
          </div>
        </div>
        {usersLoading ? <p className="muted">Loading users...</p> : null}
        {!usersLoading && users.length === 0 ? <p className="muted">No users found.</p> : null}
        {users.map((user) => (
          <div key={user.id} className="row">
            <span>
              {user.fullName} ({user.email})
            </span>
            <div className="row">
              <span className="meta">{user.role ?? 'user'} • {user.active ? 'active' : 'locked'}</span>
              <button className="btn ghost" onClick={() => setUserActive(user.id, !user.active)}>
                {user.active ? 'Lock' : 'Unlock'}
              </button>
              <button className="btn ghost" onClick={() => void viewPayments(user)}>
                Payments
              </button>
              <button className="btn warn" onClick={() => void deleteUser(user)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </article>
    )
  }

  function renderMachinesSection() {
    return (
      <article className="card stack">
        <div className="row">
          <h3>Machines</h3>
          <label className="field" style={{ minWidth: 220 }}>
            Status filter
            <select value={pcStatusFilter} onChange={(e) => setPcStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="available">available</option>
              <option value="in_use">in_use</option>
              <option value="maintenance">maintenance</option>
            </select>
          </label>
        </div>

        <div className="card grid cols-2" style={{ background: 'var(--surface-soft)' }}>
          <h4 style={{ margin: 0 }}>Create New Machine</h4>
          <div />
          <label className="field">
            Spec name
            <input
              value={createPcForm.specName}
              onChange={(e) => setCreatePcForm((prev) => ({ ...prev, specName: e.target.value }))}
            />
          </label>
          <label className="field">
            Location
            <input
              value={createPcForm.location}
              onChange={(e) => setCreatePcForm((prev) => ({ ...prev, location: e.target.value }))}
            />
          </label>
          <label className="field">
            CPU
            <input value={createPcForm.cpu} onChange={(e) => setCreatePcForm((prev) => ({ ...prev, cpu: e.target.value }))} />
          </label>
          <label className="field">
            GPU
            <input value={createPcForm.gpu} onChange={(e) => setCreatePcForm((prev) => ({ ...prev, gpu: e.target.value }))} />
          </label>
          <label className="field">
            RAM (GB)
            <input value={createPcForm.ram} onChange={(e) => setCreatePcForm((prev) => ({ ...prev, ram: e.target.value }))} />
          </label>
          <label className="field">
            Storage (GB)
            <input value={createPcForm.storage} onChange={(e) => setCreatePcForm((prev) => ({ ...prev, storage: e.target.value }))} />
          </label>
          <label className="field">
            OS
            <input
              value={createPcForm.operatingSystem}
              onChange={(e) => setCreatePcForm((prev) => ({ ...prev, operatingSystem: e.target.value }))}
            />
          </label>
          <label className="field">
            Price per hour
            <input
              value={createPcForm.pricePerHour}
              onChange={(e) => setCreatePcForm((prev) => ({ ...prev, pricePerHour: e.target.value }))}
            />
          </label>
          <label className="field" style={{ gridColumn: '1 / -1' }}>
            Description
            <textarea
              value={createPcForm.description}
              onChange={(e) => setCreatePcForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </label>
          <label className="field">
            Status
            <select
              value={createPcForm.status}
              onChange={(e) => setCreatePcForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="available">available</option>
              <option value="in_use">in_use</option>
              <option value="maintenance">maintenance</option>
            </select>
          </label>
          <div className="row" style={{ alignItems: 'end' }}>
            <button className="btn" onClick={() => void createMachine()}>
              Create machine
            </button>
          </div>
        </div>

        {pcsLoading ? <p className="muted">Loading machines...</p> : null}
        {!pcsLoading && pcs.length === 0 ? <p className="muted">No machines found.</p> : null}
        {pcs.map((pc) => (
          <div key={pc.pcId} className="card stack" style={{ padding: 12 }}>
            <div className="row">
              <strong>
                #{pc.pcId} {pc.specName}
              </strong>
              <span className="meta">{pc.cpu} • {pc.gpu}</span>
            </div>
            <div className="row">
              <span className="meta">{pc.ram} GB RAM • {pc.storage} GB • {pc.operatingSystem}</span>
              <span className="price">${Number(pc.pricePerHour).toFixed(2)}/h</span>
            </div>
            <div className="grid cols-2">
              <label className="field">
                Location
                <input
                  value={editPcState[pc.pcId]?.location ?? pc.location}
                  onChange={(e) =>
                    setEditPcState((prev) => ({
                      ...prev,
                      [pc.pcId]: {
                        location: e.target.value,
                        status: prev[pc.pcId]?.status ?? pc.status,
                        pricePerHour: prev[pc.pcId]?.pricePerHour ?? String(pc.pricePerHour),
                      },
                    }))
                  }
                />
              </label>
              <label className="field">
                Status
                <select
                  value={editPcState[pc.pcId]?.status ?? pc.status}
                  onChange={(e) =>
                    setEditPcState((prev) => ({
                      ...prev,
                      [pc.pcId]: {
                        location: prev[pc.pcId]?.location ?? pc.location,
                        status: e.target.value,
                        pricePerHour: prev[pc.pcId]?.pricePerHour ?? String(pc.pricePerHour),
                      },
                    }))
                  }
                >
                  <option value="available">available</option>
                  <option value="in_use">in_use</option>
                  <option value="maintenance">maintenance</option>
                </select>
              </label>
              <label className="field">
                Price per hour
                <input
                  value={editPcState[pc.pcId]?.pricePerHour ?? String(pc.pricePerHour)}
                  onChange={(e) =>
                    setEditPcState((prev) => ({
                      ...prev,
                      [pc.pcId]: {
                        location: prev[pc.pcId]?.location ?? pc.location,
                        status: prev[pc.pcId]?.status ?? pc.status,
                        pricePerHour: e.target.value,
                      },
                    }))
                  }
                />
              </label>
              <div className="row" style={{ alignItems: 'end' }}>
                <button className="btn ghost" onClick={() => void updateMachine(pc)}>
                  Save changes
                </button>
                <button className="btn warn" onClick={() => void deleteMachine(pc.pcId)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </article>
    )
  }

  function renderPaymentsSection() {
    return (
      <article className="card stack">
        <div className="row">
          <h3>User Payments</h3>
          <div className="row">
            <input
              value={selectedPaymentUserId}
              onChange={(e) => setSelectedPaymentUserId(e.target.value)}
              placeholder="Enter user ID"
            />
            <button className="btn ghost" onClick={() => void handlePaymentSearch()}>
              View history
            </button>
          </div>
        </div>

        {selectedPaymentUserName ? <p className="muted">Showing payment history for {selectedPaymentUserName}</p> : null}
        {paymentsLoading ? <p className="muted">Loading payment history...</p> : null}
        {!paymentsLoading && payments.length === 0 ? <p className="muted">No payment transactions found.</p> : null}

        {payments.map((tx) => (
          <div key={tx.transactionId} className="row card" style={{ padding: 12 }}>
            <div className="stack" style={{ gap: 4 }}>
              <strong>Transaction #{tx.transactionId}</strong>
              <span className="meta">
                {tx.type ?? 'unknown'} • Ref: {tx.referenceId ?? '-'} • Wallet: {tx.walletId ?? '-'}
              </span>
              <span className="meta">{tx.note ?? 'No note'}</span>
            </div>
            <div className="stack" style={{ alignItems: 'flex-end', gap: 4 }}>
              <span className="price">${Number(tx.amount).toFixed(2)}</span>
              <span className="meta">{new Date(tx.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </article>
    )
  }

  return (
    <section className="stack admin-page">
      <h2>Admin Dashboard</h2>
      {error ? <div className="card error">{error}</div> : null}
      {message ? <div className="card success">{message}</div> : null}

      <div className="admin-layout">
        <aside className="card admin-sidebar">
          <button className={`tab-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            Users
          </button>
          <button className={`tab-link ${activeTab === 'machines' ? 'active' : ''}`} onClick={() => setActiveTab('machines')}>
            Machines
          </button>
          <button className={`tab-link ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
            Payments
          </button>
        </aside>

        <div className="admin-main">
          {activeTab === 'users' ? renderUsersSection() : null}
          {activeTab === 'machines' ? renderMachinesSection() : null}
          {activeTab === 'payments' ? renderPaymentsSection() : null}
        </div>

      </div>
    </section>
  )
}
