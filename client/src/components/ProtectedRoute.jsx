import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Only logged-in users get in. Optionally restrict by role: <ProtectedRoute roles={['agent']}>
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-stone-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
