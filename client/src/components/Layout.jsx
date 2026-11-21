import { NavLink, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';

const NAV = {
  customer: [['/tickets', 'My tickets'], ['/tickets/new', 'New ticket'], ['/knowledge', 'Help center']],
  agent: [['/queue', 'Ticket queue'], ['/knowledge', 'Help center']],
  admin: [['/queue', 'Ticket queue'], ['/knowledge', 'Help center']],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const links = NAV[user.role] || [];
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Logo size={32} />
          <nav className="flex gap-1">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end
                className={({ isActive }) => `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-brand text-white' : 'text-stone-600 hover:bg-stone-200'}`}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs leading-tight sm:block">
              <div className="font-semibold">{user.name}</div>
              <div className="capitalize text-stone-500">{user.role}{user.branch?.code ? ` · ${user.branch.code}` : ''}</div>
            </div>
            <button onClick={logout} className="btn-ghost !px-3 !py-1.5" title="Log out"><LogOut size={16} /></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6"><Outlet /></main>
    </div>
  );
}
