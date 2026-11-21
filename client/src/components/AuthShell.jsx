import { motion } from 'framer-motion';
import { ShieldCheck, Timer, Star } from 'lucide-react';
import Logo from './Logo.jsx';

const POINTS = [
  [ShieldCheck, 'Branch-level privacy', 'Customers see only their own tickets, agents only their branch.'],
  [Timer, 'SLA you can trust', 'Every ticket gets a deadline based on its priority.'],
  [Star, 'Closed with feedback', 'Each resolved ticket ends with a satisfaction rating.'],
];

// Shared layout for the Login and Register pages
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between"
        style={{ background: 'radial-gradient(700px 500px at 100% 0%, rgba(122,203,75,.28), transparent 60%), radial-gradient(600px 500px at 0% 100%, rgba(255,107,74,.18), transparent 60%), linear-gradient(160deg,#0E1B15,#0A3B2A)' }}>
        <motion.div className="pointer-events-none absolute -right-28 -top-28 opacity-[0.14]" animate={{ rotate: 360 }} transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}>
          <Logo size={460} text={false} />
        </motion.div>
        <div className="relative"><Logo light size={42} /></div>
        <div className="relative max-w-md">
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">Every voice,<br /><span className="text-brand-light">resolved.</span></h1>
          <p className="mt-5 text-lg text-stone-300">One place for every branch to raise, track and close support tickets, with answers ready in the help center.</p>
          <ul className="mt-10 space-y-5">
            {POINTS.map(([Icon, head, text], i) => (
              <motion.li key={head} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.12 }} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10"><Icon size={18} className="text-brand-light" /></span>
                <span><b className="block">{head}</b><span className="text-sm text-stone-400">{text}</span></span>
              </motion.li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-stone-400">Careloop · Multi-branch support platform</p>
      </div>

      <div className="flex items-center justify-center p-5 sm:p-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="mb-6 lg:hidden"><Logo /></div>
          <div className="rounded-3xl border border-white bg-white/75 p-7 shadow-card backdrop-blur sm:p-9">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="mb-6 mt-1 text-stone-500">{subtitle}</p>
            {children}
          </div>
          {footer}
        </motion.div>
      </div>
    </div>
  );
}
