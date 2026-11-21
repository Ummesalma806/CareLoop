import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Lock, UserCheck, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatusBadge, PriorityBadge, SlaBadge } from '../components/Badges.jsx';
import Timeline from '../components/Timeline.jsx';
import Stars from '../components/Stars.jsx';
import { fmt } from '../lib/format.js';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [reply, setReply] = useState('');
  const [internal, setInternal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [agents, setAgents] = useState([]);
  const [pickAgent, setPickAgent] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [t, c] = await Promise.all([api.get(`/tickets/${id}`), api.get(`/tickets/${id}/comments`)]);
      setTicket(t.data);
      setComments(c.data);
    } catch (e) {
      if (e.response?.status === 404) setNotFound(true); else toast.error(errMsg(e));
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Branch admin / super admin can assign: load agents of this ticket's branch
  useEffect(() => {
    if (user.role === 'admin' && ticket) {
      api.get('/admin/agents').then((r) => setAgents(r.data.filter((a) => a.branch?._id === ticket.branch?._id))).catch(() => {});
    }
  }, [user.role, ticket?._id]); // eslint-disable-line

  // Runs an API action, then reloads the ticket
  const act = async (fn, okMsg) => {
    setBusy(true);
    try { await fn(); if (okMsg) toast.success(okMsg); await load(); }
    catch (e) { toast.error(errMsg(e)); }
    finally { setBusy(false); }
  };

  if (notFound) return <div className="card py-14 text-center"><p className="mb-3 text-lg font-semibold">Ticket not found</p><Link to="/" className="text-brand">Go back</Link></div>;
  if (!ticket) return <div className="space-y-3"><div className="h-28 animate-pulse rounded-2xl bg-stone-200" /><div className="h-64 animate-pulse rounded-2xl bg-stone-200" /></div>;

  const isCustomer = user.role === 'customer';
  const isStaff = !isCustomer;
  const mine = ticket.assignedTo?._id === user._id;
  const canWorkOn = user.role === 'admin' || mine;
  const closed = ticket.status === 'closed';
  const canRate = isCustomer && ['resolved', 'closed'].includes(ticket.status) && !ticket.isRated;

  const sendReply = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    act(async () => { await api.post(`/tickets/${id}/comments`, { body: reply, isInternal: internal }); setReply(''); setInternal(false); });
  };
  const setStatus = (status, msg) => act(() => api.patch(`/tickets/${id}/status`, { status }), msg);
  const submitRating = () => {
    if (!rating) return toast.error('Please select a star rating');
    act(() => api.post(`/tickets/${id}/satisfaction`, { rating, comment: ratingComment || undefined }), 'Thanks for your feedback!');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Link to={isCustomer ? '/tickets' : '/queue'} className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-brand"><ArrowLeft size={16} /> Back</Link>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Header */}
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-stone-500">{ticket.key}</span>
              <div className="flex items-center gap-2"><SlaBadge ticket={ticket} /><StatusBadge status={ticket.status} /></div>
            </div>
            <h1 className="mt-1 text-xl font-bold">{ticket.subject}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
              <PriorityBadge priority={ticket.priority} />
              <span>{ticket.category?.name}</span>
              <span>{ticket.branch?.name}</span>
              <span>Opened {fmt(ticket.createdAt)}</span>
            </div>
            <p className="mt-4 whitespace-pre-line text-stone-700">{ticket.description}</p>
            {isStaff && <p className="mt-3 text-xs text-stone-500">Customer: {ticket.customer?.name} ({ticket.customer?.email})</p>}
          </div>

          {/* Staff actions */}
          {isStaff && !closed && (
            <div className="card flex flex-wrap items-center gap-2">
              {user.role === 'agent' && !ticket.assignedTo && (
                <button disabled={busy} className="btn-primary" onClick={() => act(() => api.patch(`/tickets/${id}/assign`), 'Ticket claimed')}><UserCheck size={18} /> Claim this ticket</button>
              )}
              {user.role === 'admin' && (
                <div className="flex gap-2">
                  <select className="input !w-auto" value={pickAgent} onChange={(e) => setPickAgent(e.target.value)}>
                    <option value="">Assign to agent…</option>
                    {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                  <button disabled={busy || !pickAgent} className="btn-ghost" onClick={() => act(() => api.patch(`/tickets/${id}/assign`, { agentId: pickAgent }), 'Ticket assigned')}>Assign</button>
                </div>
              )}
              {canWorkOn && ticket.assignedTo && ticket.status === 'in_progress' && (
                <button disabled={busy} className="btn-primary" onClick={() => setStatus('resolved', 'Marked as resolved')}><CheckCircle2 size={18} /> Mark resolved</button>
              )}
              {canWorkOn && ticket.status === 'resolved' && (
                <>
                  <button disabled={busy} className="btn-ghost" onClick={() => setStatus('in_progress', 'Ticket reopened')}><RotateCcw size={16} /> Reopen</button>
                  <button disabled={busy} className="btn-ghost" onClick={() => setStatus('closed', 'Ticket closed')}><XCircle size={16} /> Close ticket</button>
                </>
              )}
              {user.role === 'agent' && ticket.assignedTo && !mine && <span className="text-sm text-stone-500">Claimed by {ticket.assignedTo.name}</span>}
            </div>
          )}

          {/* Conversation */}
          <div className="card">
            <h2 className="mb-4 font-bold">Conversation</h2>
            <div className="space-y-3">
              {comments.length === 0 && <p className="text-sm text-stone-500">No replies yet.</p>}
              {comments.map((c) => {
                const own = c.author?._id === user._id;
                return (
                  <motion.div key={c._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-3 ${c.isInternal ? 'border border-dashed border-yellow-500 bg-yellow-50' : own ? 'bg-brand/10' : 'bg-stone-100'}`}>
                    <div className="mb-1 flex items-center justify-between text-xs text-stone-500">
                      <span className="font-semibold text-stone-700">{c.author?.name} <span className="font-normal capitalize">({c.author?.role})</span></span>
                      <span className="flex items-center gap-1">{c.isInternal && <><Lock size={12} /> Internal note · </>}{fmt(c.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-line text-sm">{c.body}</p>
                  </motion.div>
                );
              })}
            </div>

            {!closed && (isCustomer || canWorkOn) ? (
              <form onSubmit={sendReply} className="mt-4 space-y-2">
                <textarea className="input min-h-24" placeholder={internal ? 'Write an internal note (customer cannot see this)…' : 'Write a reply…'} value={reply} onChange={(e) => setReply(e.target.value)} />
                <div className="flex items-center justify-between">
                  {isStaff ? (
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-600"><input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Internal note</label>
                  ) : <span />}
                  <button className="btn-primary" disabled={busy || !reply.trim()}><Send size={16} /> Send</button>
                </div>
              </form>
            ) : isStaff && !closed ? <p className="mt-4 text-sm text-stone-500">Claim this ticket to reply.</p> : null}
          </div>

          {/* Rating */}
          {canRate && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card border-brand/40 bg-brand/5">
              <h2 className="font-bold">How was your support?</h2>
              <p className="mb-3 text-sm text-stone-600">Your rating closes this ticket and helps the branch improve.</p>
              <Stars value={rating} onChange={setRating} />
              <textarea className="input mt-3" placeholder="Anything you would like to add? (optional)" value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} maxLength={500} />
              <button className="btn-primary mt-3" disabled={busy} onClick={submitRating}>Submit rating</button>
            </motion.div>
          )}
          {isCustomer && ticket.isRated && <div className="card bg-emerald-50 text-sm text-emerald-800">Thank you, you have rated this ticket.</div>}
        </div>

        {/* Audit timeline */}
        <div className="card h-fit">
          <h2 className="mb-4 font-bold">Ticket history</h2>
          <Timeline history={ticket.history} />
        </div>
      </div>
    </motion.div>
  );
}
