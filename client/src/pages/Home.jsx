import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Sends each role to its own starting page
export default function Home() {
  const { user } = useAuth();
  return <Navigate to={user.role === 'customer' ? '/tickets' : '/queue'} replace />;
}
