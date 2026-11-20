import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

// Temporary landing page. Next we replace this with the Customer / Agent / Admin dashboards.
export default function Home() {
  const { user, logout } = useAuth();
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <Logo />
        <button onClick={logout} className="btn-ghost"><LogOut size={16} /> Log out</button>
      </div>
      <div className="card">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <p className="mt-2 text-stone-600">
          Role: <b>{user.role}</b>{user.adminLevel ? ` (${user.adminLevel})` : ''}
          {user.branch?.name ? <> · Branch: <b>{user.branch.name}</b></> : null}
        </p>
        <p className="mt-4 text-sm text-stone-500">Login works. Dashboards for each role come next.</p>
      </div>
    </div>
  );
}
