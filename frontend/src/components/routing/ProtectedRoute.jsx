import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Loader from '../ui/Loader'

export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, initializing, user } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname + location.search }} />
  }

  if (roles?.length) {
    const allowed = roles.includes(user?.role) || (roles.includes('contributor') && user?.role === 'admin')
    if (!allowed) return <Navigate to="/403" replace />
  }

  return children
}
