import { useEffect, useMemo, useState } from 'react'
import config from '../config'
import { AuthContext } from './AuthContextValue'

async function parseApiResponse(response) {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || '请求失败，请稍后重试')
  }
  return payload
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dialog, setDialog] = useState({ open: false, mode: 'login', message: '' })

  const refreshUser = async () => {
    const response = await fetch(`${config.apiBaseUrl}${config.endpoints.auth.me}`, {
      credentials: 'include'
    })
    const payload = await parseApiResponse(response)
    setUser(payload.authenticated ? payload.user : null)
    return payload.user
  }

  useEffect(() => {
    refreshUser()
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const login = async ({ email, password }) => {
    const response = await fetch(`${config.apiBaseUrl}${config.endpoints.auth.login}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })
    const payload = await parseApiResponse(response)
    setUser(payload.user)
    return payload.user
  }

  const register = async ({ email, password, inviteCode }) => {
    const response = await fetch(`${config.apiBaseUrl}${config.endpoints.auth.register}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, inviteCode })
    })
    const payload = await parseApiResponse(response)
    setUser(payload.user)
    return payload.user
  }

  const logout = async () => {
    await fetch(`${config.apiBaseUrl}${config.endpoints.auth.logout}`, {
      method: 'POST',
      credentials: 'include'
    })
    setUser(null)
  }

  const redeemInvite = async (inviteCode) => {
    const response = await fetch(`${config.apiBaseUrl}${config.endpoints.auth.redeemInvite}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ inviteCode })
    })
    const payload = await parseApiResponse(response)
    setUser(payload.user)
    return payload.user
  }

  const openAuthDialog = (mode = 'login', message = '') => {
    setDialog({ open: true, mode, message })
  }

  const closeAuthDialog = () => {
    setDialog((current) => ({ ...current, open: false, message: '' }))
  }

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    isMember: user?.membershipStatus === 'member' || user?.role === 'admin',
    dialog,
    openAuthDialog,
    closeAuthDialog,
    login,
    register,
    logout,
    redeemInvite,
    refreshUser
  }), [user, isLoading, dialog])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
