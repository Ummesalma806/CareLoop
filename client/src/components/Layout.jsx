import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu, X, Ticket, PlusCircle, BookOpen, Inbox, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';

const NAV = {
  customer: [['/tickets', 'My tickets', Ticket], ['/tickets/new', 'New ticket', PlusCircle], ['/knowledge', 'Help center', BookOpen]],
  agent: [['/queue', 'Ticket queue', Inbox], ['/knowledge', 'Help center', BookOpen]],
  admin: [['/admin', 'Dashboard', LayoutDashboard], ['/queue', 'Ticket queue', Inbox], ['/knowledge', 'Help center', BookOpen]],
};

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const links = NAV[user.role] || [];
  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const roleLabel = user.role === 'admin' ? (user.adminLevel === 'super' ? 'Super admin' : 'Branch admin') : user.role;

  return (
    <div className="flex h-full flex-col bg-ink p-4 text-stone-300">
      <div className="px-2 py-3"><Logo light size={34} /></div>
      <nav className="mt-6 flex-1 space-y-1">
        {links.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} end onClick={onNavigate}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-brand-light' : ''} />
                {label}
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-light" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="rounded-2xl bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-light text-sm font-bold text-white">{initials}</div>
          <div className="min-w-0 text-sm leading-tight">
            <div className="truncate font-semibold text-white">{user.name}</div>
            <div className="truncate text-xs capitalize text-stone-400">{roleLabel}{user.branch?.code ? ` · ${user.branch.code}` : ''}</div>
          </div>
        </div>
        <button onClick={logout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2 text-sm font-semibold text-stone-300 transition hover:bg-white/10 hover:text-white">
          <LogOut size={15} /> Log out
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 lg:block"><Sidebar /></aside>

      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200/70 bg-paper/85 px-4 py-3 backdrop-blur lg:hidden">
        <Logo size={30} />
        <button onClick={() => setOpen(true)} className="btn-ghost !px-3 !py-2" aria-label="Open menu"><Menu size={18} /></button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'tween', duration: 0.25 }} className="fixed inset-y-0 left-0 z-40 w-64 lg:hidden">
              <button onClick={() => setOpen(false)} className="absolute right-3 top-4 z-10 text-stone-400" aria-label="Close menu"><X size={20} /></button>
              <Sidebar onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
