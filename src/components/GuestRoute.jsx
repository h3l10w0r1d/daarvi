import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

/**
 * Wraps public-only routes (landing, login, onboarding).
 * If the user is already authenticated, redirect straight to /home.
 */
export default function GuestRoute({ children }) {
  const { user } = useApp()

  if (user) {
    return <Navigate to="/shop" replace />
  }

  return children
}
