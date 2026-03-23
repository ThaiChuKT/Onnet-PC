import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function onLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="shell">
      <header className="nav">
        <div className="brand">ONNET PC</div>
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => `chip ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/machines" className={({ isActive }) => `chip ${isActive ? 'active' : ''}`}>
            Machines
          </NavLink>
          {user ? (
            <>
              <NavLink to="/profile" className={({ isActive }) => `chip ${isActive ? 'active' : ''}`}>
                Profile
              </NavLink>
              <NavLink to="/wallet" className={({ isActive }) => `chip ${isActive ? 'active' : ''}`}>
                Wallet
              </NavLink>
              <NavLink to="/rentals" className={({ isActive }) => `chip ${isActive ? 'active' : ''}`}>
                Rentals
              </NavLink>
              {(user?.role ?? '').toLowerCase() === 'admin' ? (
                <NavLink to="/admin" className={({ isActive }) => `chip ${isActive ? 'active' : ''}`}>
                  Admin
                </NavLink>
              ) : null}
              <button className="btn ghost" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `chip ${isActive ? 'active' : ''}`}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => `chip ${isActive ? 'active' : ''}`}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
