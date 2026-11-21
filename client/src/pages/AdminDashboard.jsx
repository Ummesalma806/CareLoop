import { useEffect, useState } from 'react';
import { animate, motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Ticket, Activity, AlarmClock, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { STATUS_LABEL } from '../lib/format.js';

const STATUS_COLOR = { open: '#EA7A1F', in_progress: '#84CC16', resolved: '#10B981', closed: '#A8A29E' };
const PRIORITY_COLOR = { low: '#A8A29E', medium: '#CA8A04', high: '#EA580C', urgent: '#DC2626' };

function CountUp({ value, decimals = 0 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const c = animate(0, value ?? 0, { duration: 1.1, ease: 'easeOut', onUpdate: (v) => setN(v) });
    return () => c.stop();
  }, [value]);
  return <>{n.toFixed(decimals)}</>;
}

function StatCard({ icon: Icon, label, value, decimals = 0, suffix = '', danger }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card">
      <div className="flex items-center justify-between text-sm text-stone-500">{label}<Icon size={18} className={danger ? 'text-red-500' : 'text-brand'} /></div>
      <div className={`mt-2 text-3xl font-bold ${danger ? 'text-red-600' : ''}`}>
        {value == null ? '–' : <><CountUp value={value} decimals={decimals} />{suffix}</>}
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get('/admin/stats').then((r) => setStats(r.data)).catch((e) => toast.error(errMsg(e))); }, []);

  if (!stats) {
    return <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-200" />)}</div><div className="h-72 animate-pulse rounded-2xl bg-stone-200" /></div>;
  }

  const { totals, byStatus, byPriority, agentMetrics, branchComparison } = stats;
  const active = (byStatus.open || 0) + (byStatus.in_progress || 0);
  const statusData = Object.entries(byStatus).map(([k, v]) => ({ key: k, name: STATUS_LABEL[k], value: v }));
  const priorityData = ['low', 'medium', 'high', 'urgent'].map((p) => ({ key: p, name: p[0].toUpperCase() + p.slice(1), count: byPriority[p] || 0 }));
  const scope = user.adminLevel === 'super' ? 'All branches' : user.branch?.name || 'Your branch';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-stone-500">{scope}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Ticket} label="Total tickets" value={totals.tickets} />
        <StatCard icon={Activity} label="Active tickets" value={active} />
        <StatCard icon={AlarmClock} label="Past SLA deadline" value={totals.overdue} danger={totals.overdue > 0} />
        <StatCard icon={Star} label={`Avg. rating (${totals.ratings})`} value={totals.avgRating} decimals={2} suffix=" / 5" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-2 font-bold">Tickets by status</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {statusData.map((d) => <Cell key={d.key} fill={STATUS_COLOR[d.key]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h2 className="mb-2 font-bold">Tickets by priority</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>{priorityData.map((d) => <Cell key={d.key} fill={PRIORITY_COLOR[d.key]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="mb-3 font-bold">Agent performance</h2>
        {agentMetrics.length === 0 ? <p className="text-sm text-stone-500">No agent activity yet.</p> : (
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase text-stone-500">
              <tr><th className="pb-2">Agent</th><th>Branch</th><th>Assigned</th><th>Resolved</th><th>Avg. resolution</th><th>Avg. rating</th><th>SLA breaches</th></tr>
            </thead>
            <tbody>
              {agentMetrics.map((a) => (
                <tr key={a.agentId} className="border-t border-stone-100">
                  <td className="py-2.5 font-semibold">{a.name}</td><td>{a.branch}</td><td>{a.assigned}</td><td>{a.resolved}</td>
                  <td>{a.avgResolutionHours != null ? `${a.avgResolutionHours} h` : '–'}</td>
                  <td>{a.avgRating != null ? `★ ${a.avgRating}` : '–'}</td>
                  <td className={a.breaches > 0 ? 'font-semibold text-red-600' : ''}>{a.breaches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {branchComparison && (
        <div className="card">
          <h2 className="mb-1 font-bold">Branch comparison</h2>
          <p className="mb-3 text-sm text-stone-500">Which branch resolves faster and keeps customers happier</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={branchComparison}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="code" /><YAxis allowDecimals={false} /><Tooltip /><Legend />
                <Bar dataKey="total" name="Tickets" fill="#139A4F" radius={[6, 6, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#84CC16" radius={[6, 6, 0, 0]} />
                <Bar dataKey="breaches" name="SLA breaches" fill="#FF6B4A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-stone-500"><tr><th className="pb-2">Branch</th><th>Tickets</th><th>Resolved</th><th>SLA breaches</th><th>Avg. rating</th></tr></thead>
            <tbody>
              {branchComparison.map((b) => (
                <tr key={b.code} className="border-t border-stone-100"><td className="py-2.5 font-semibold">{b.branch}</td><td>{b.total}</td><td>{b.resolved}</td><td>{b.breaches}</td><td>{b.avgRating != null ? `★ ${b.avgRating}` : '–'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
