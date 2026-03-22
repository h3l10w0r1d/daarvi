import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

/**
 * Wraps any route that requires authentication.
 * If no valid user/token exists, redirects to the landing page.
 * The attempted location is saved so we can redirect back after login.
 */
export default function ProtectedRoute({ children }) {
  const { user } = useApp()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return children
}
