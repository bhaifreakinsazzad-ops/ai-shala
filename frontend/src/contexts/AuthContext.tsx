import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '../lib/api'

interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar_url?: string
  subscription: 'free' | 'pro' | 'premium'
  daily_usage: number
  daily_limit: number
  image_daily_usage: number
  image_daily_limit: number
  is_admin: boolean
  subscription_ends_at?: string
  trial_ends_at?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('ai_shala_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      authApi.me()
        .then((res) => setUser(res.data.user))
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('ai_shala_token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  const register = async (data: { email: string; password: string; name: string; phone?: string }) => {
    const res = await authApi.register(data)
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('ai_shala_token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('ai_shala_token')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    const res = await authApi.me()
    setUser(res.data.user)
  }

  const updateUser = (updated: User) => setUser(updated)

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
