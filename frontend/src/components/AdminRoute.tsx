import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { loading, token, user } = useAuth()

  if (loading) {
    return <div className="card">Loading session...</div>
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if ((user?.role ?? '').toLowerCase() !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
