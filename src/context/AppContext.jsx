import { createContext, useContext, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { usersApi } from '../api/users'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const queryClient = useQueryClient()

  // ─── Mode ──────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState('global')
  const toggleMode = () => setMode(m => (m === 'global' ? 'local' : 'global'))

  // ─── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('daarvi_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  const _storeTokens = (data) => {
    localStorage.setItem('daarvi_access_token', data.access_token)
    localStorage.setItem('daarvi_refresh_token', data.refresh_token)
    localStorage.setItem('daarvi_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  // ─── Session validation on startup ────────────────────────────────────────
  // When the app loads with a stored user, verify the token is still valid.
  // If not, attempt to refresh. If refresh fails, clear the session.
  useEffect(() => {
    const validateSession = async () => {
      const accessToken  = localStorage.getItem('daarvi_access_token')
      const refreshToken = localStorage.getItem('daarvi_refresh_token')

      if (!accessToken && !refreshToken) return  // no session at all

      try {
        // Ping /users/me — the axios interceptor will auto-refresh if needed
        const freshUser = await usersApi.me()
        setUser(freshUser)
        localStorage.setItem('daarvi_user', JSON.stringify(freshUser))
      } catch {
        // Both access and refresh failed — clear everything
        _clearSession()
      }
    }

    if (user) validateSession()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])                      // run once on mount only

  // ─── Global 401 listener ──────────────────────────────────────────────────
  // If the axios interceptor exhausts the refresh and re-throws a 401,
  // this listener clears the session and lets ProtectedRoute redirect to '/'.
  useEffect(() => {
    const handler = () => _clearSession()
    window.addEventListener('daarvi:auth-expired', handler)
    return () => window.removeEventListener('daarvi:auth-expired', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const _clearSession = () => {
    localStorage.removeItem('daarvi_access_token')
    localStorage.removeItem('daarvi_refresh_token')
    localStorage.removeItem('daarvi_user')
    setUser(null)
    setWishlist([])
    setDnaProfile(null)
    queryClient.clear()
  }

  const login = async (email, password) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const data = await authApi.login(email, password)
      _storeTokens(data)
      // Sync wishlist after login
      const ids = await usersApi.getWishlist()
      setWishlist(ids)
      // Sync DNA profile
      if (data.user.dna_profile) {
        setDnaProfile({
          shape: data.user.dna_profile.shape,
          style: data.user.dna_profile.style || [],
          palette: data.user.dna_profile.palette,
          budget: data.user.dna_profile.budget,
          mode: data.user.dna_profile.mode,
        })
      }
      return data.user
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed'
      setAuthError(msg)
      throw new Error(msg)
    } finally {
      setAuthLoading(false)
    }
  }

  const register = async (email, name, password) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const data = await authApi.register(email, name, password)
      _storeTokens(data)
      return data.user
    } catch (err) {
      // Surface Pydantic validation errors from the backend
      const detail = err.response?.data?.detail
      let msg = 'Registration failed'
      if (typeof detail === 'string') {
        msg = detail
      } else if (Array.isArray(detail)) {
        // Pydantic v2 returns array of {loc, msg, type}
        msg = detail.map(d => d.msg.replace('Value error, ', '')).join('. ')
      }
      setAuthError(msg)
      throw new Error(msg)
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = () => {
    _clearSession()
  }

  // ─── DNA Profile ───────────────────────────────────────────────────────────
  const [dnaProfile, setDnaProfile] = useState(null)

  const saveDnaProfile = async (profile) => {
    setDnaProfile(profile)
    if (user) {
      try {
        await usersApi.saveDnaProfile(profile)
      } catch (e) {
        console.warn('Failed to save DNA profile to API:', e)
      }
    }
  }

  // ─── Wishlist (server-synced when logged in) ───────────────────────────────
  const [wishlist, setWishlist] = useState([]) // array of product ids

  const toggleWishlist = async (productId) => {
    const isIn = wishlist.includes(productId)
    // Optimistic update
    setWishlist(prev => isIn ? prev.filter(id => id !== productId) : [...prev, productId])
    // Notify via global toast
    window.dispatchEvent(new CustomEvent('daarvi:toast', {
      detail: {
        message: isIn ? 'Removed from wishlist' : 'Added to wishlist',
        type: 'success',
      },
    }))
    if (user) {
      try {
        if (isIn) {
          await usersApi.removeFromWishlist(productId)
        } else {
          await usersApi.addToWishlist(productId)
        }
      } catch (e) {
        // Rollback on failure
        setWishlist(prev => isIn ? [...prev, productId] : prev.filter(id => id !== productId))
        window.dispatchEvent(new CustomEvent('daarvi:toast', {
          detail: { message: 'Wishlist update failed', type: 'error' },
        }))
      }
    }
  }

  const isWishlisted = (productId) => wishlist.includes(productId)

  // ─── Currency ──────────────────────────────────────────────────────────────
  const [currency, setCurrency] = useState(
    () => localStorage.getItem('daarvi_currency') || 'USD'
  )
  const updateCurrency = (curr) => {
    setCurrency(curr)
    localStorage.setItem('daarvi_currency', curr)
  }

  // ─── Newsletter preference ─────────────────────────────────────────────────
  const [newsletter, setNewsletter] = useState(() => {
    const v = localStorage.getItem('daarvi_newsletter')
    return v !== null ? v === 'true' : true // default opt-in
  })
  const setNewsletterPref = (val) => {
    setNewsletter(val)
    localStorage.setItem('daarvi_newsletter', String(val))
  }

  // ─── Mobile sidebar ────────────────────────────────────────────────────────
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // ─── Cart (local state only) ───────────────────────────────────────────────
  const [cart, setCart] = useState([])

  const addToCart = (product, size, color) => {
    setCart(prev => {
      const existing = prev.find(
        item => item.product.id === product.id && item.size === size && item.color === color
      )
      if (existing) {
        return prev.map(item => (item === existing ? { ...item, qty: item.qty + 1 } : item))
      }
      return [...prev, { product, size, color, qty: 1 }]
    })
  }

  const removeFromCart = (productId, size, color) => {
    setCart(prev =>
      prev.filter(item => !(item.product.id === productId && item.size === size && item.color === color))
    )
  }

  const clearCart = () => setCart([])

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const cartTotal = (m) =>
    cart.reduce(
      (sum, item) => sum + (m === 'local' ? item.product.price_local : item.product.price_global) * item.qty,
      0
    )

  return (
    <AppContext.Provider
      value={{
        // mode
        mode, setMode, toggleMode,
        // auth
        user, setUser, login, register, logout, authLoading, authError,
        // dna
        dnaProfile, setDnaProfile: saveDnaProfile,
        // wishlist
        wishlist, toggleWishlist, isWishlisted,
        // cart
        cart, addToCart, removeFromCart, clearCart, cartCount, cartTotal,
        // currency
        currency, updateCurrency,
        // newsletter
        newsletter, setNewsletterPref,
        // mobile sidebar
        mobileSidebarOpen, setMobileSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
