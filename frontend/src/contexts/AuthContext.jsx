import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'
import { TOKEN_KEY, USER_KEY } from '../services/api'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [initializing, setInitializing] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))

  const storeSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (!token) {
      setInitializing(false)
      return
    }
    let active = true
    authService
      .me()
      .then(({ user: freshUser }) => {
        if (!active) return
        setUser(freshUser)
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser))
      })
      .catch(() => {
        if (active) clearSession()
      })
      .finally(() => {
        if (active) setInitializing(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onUnauthorized = () => clearSession()
    window.addEventListener('da:unauthorized', onUnauthorized)
    return () => window.removeEventListener('da:unauthorized', onUnauthorized)
  }, [clearSession])

  const login = useCallback(
    async (credentials) => {
      const { token: newToken, user: newUser } = await authService.login(credentials)
      storeSession(newToken, newUser)
      return newUser
    },
    [storeSession],
  )

  const register = useCallback(
    async (payload) => {
      const { token: newToken, user: newUser } = await authService.register(payload)
      storeSession(newToken, newUser)
      return newUser
    },
    [storeSession],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // token already invalid — clear locally anyway
    }
    clearSession()
  }, [clearSession])

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      isContributor: user?.role === 'contributor' || user?.role === 'admin',
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, initializing, login, register, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
