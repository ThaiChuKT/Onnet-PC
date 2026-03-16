import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, authStorage, unwrapApi } from '../lib/api.ts'
import type { ApiEnvelope, AuthResponse, Profile, RegisterResponse } from '../types/api.ts'

type AuthContextValue = {
  token: string | null
  user: Profile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: { fullName: string; email: string; phone: string; password: string }) => Promise<RegisterResponse>
  verifyEmail: (token: string) => Promise<string>
  refreshProfile: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(authStorage.getToken())
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!authStorage.getToken()) {
      setUser(null)
      return
    }
    const response = await api.get<ApiEnvelope<Profile>>('/users/me')
    setUser(unwrapApi(response.data))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        if (authStorage.getToken()) {
          const response = await api.get<ApiEnvelope<Profile>>('/users/me')
          if (!cancelled) {
            setUser(unwrapApi(response.data))
            setToken(authStorage.getToken())
          }
        }
      } catch {
        authStorage.clear()
        if (!cancelled) {
          setToken(null)
          setUser(null)
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

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<ApiEnvelope<AuthResponse>>('/auth/login', {
      email,
      password,
    })
    const auth = unwrapApi(response.data)
    authStorage.setToken(auth.accessToken)
    setToken(auth.accessToken)
    await refreshProfile()
  }, [refreshProfile])

  const register = useCallback(async (payload: { fullName: string; email: string; phone: string; password: string }) => {
    const response = await api.post<ApiEnvelope<RegisterResponse>>('/auth/register', payload)
    return unwrapApi(response.data)
  }, [])

  const verifyEmail = useCallback(async (emailToken: string) => {
    const response = await api.post<ApiEnvelope<string>>(`/auth/verify-email/${emailToken}`)
    return unwrapApi(response.data)
  }, [])

  const logout = useCallback(() => {
    authStorage.clear()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      verifyEmail,
      refreshProfile,
      logout,
    }),
    [token, user, loading, login, register, verifyEmail, refreshProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
