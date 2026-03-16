import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../context/AuthContext.tsx'
import { api, unwrapApi } from '../lib/api.ts'
import type { ApiEnvelope, Profile } from '../types/api.ts'

export function ProfilePage() {
  const { user, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [avatar, setAvatar] = useState(user?.avatar ?? '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const email = useMemo(() => user?.email ?? '-', [user])

  async function onSaveProfile(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.patch<ApiEnvelope<Profile>>('/users/me', {
        fullName,
        phone,
        avatar,
      })
      await refreshProfile()
      setSuccess('Profile updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  async function onChangePassword(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const response = await api.post<ApiEnvelope<string>>('/users/me/change-password', {
        oldPassword,
        newPassword,
        confirmPassword,
      })
      setSuccess(unwrapApi(response.data))
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid cols-2">
      <article className="card stack">
        <h2>Profile</h2>
        <p className="muted">Email: {email}</p>
        <form className="stack" onSubmit={onSaveProfile}>
          <label className="field">
            Full name
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label className="field">
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </label>
          <label className="field">
            Avatar URL
            <input value={avatar} onChange={(e) => setAvatar(e.target.value)} />
          </label>
          <button className="btn" type="submit" disabled={loading}>
            Save profile
          </button>
        </form>
      </article>

      <article className="card stack">
        <h3>Change password</h3>
        <form className="stack" onSubmit={onChangePassword}>
          <label className="field">
            Old password
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
          </label>
          <label className="field">
            New password
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required />
          </label>
          <label className="field">
            Confirm password
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
          </label>
          <button className="btn" type="submit" disabled={loading}>
            Change password
          </button>
        </form>
        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}
      </article>
    </section>
  )
}
