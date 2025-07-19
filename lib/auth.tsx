"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { setCookie, getCookie, deleteCookie } from 'cookies-next'

// Simple hardcoded credentials - in a real app, use a more secure approach
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "wedding2025" // You should change this to a secure password

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already authenticated on mount
  useEffect(() => {
    const authStatus = getCookie('wedding_admin_auth')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const login = (username: string, password: string) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setCookie('wedding_admin_auth', 'true', { 
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
        sameSite: 'strict'
      })
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    deleteCookie('wedding_admin_auth')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}