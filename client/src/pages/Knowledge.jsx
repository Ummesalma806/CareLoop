import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api.js';

export default function Knowledge() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [voted, setVoted] = useState({});

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api.get('/articles', { params: q ? { search: q } : {} }).then((r) => setArticles(r.data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const vote = async (id, helpful) => {
    try {
      await api.post(`/articles/${id}/vote`, { helpful });
      setVoted((v) => ({ ...v, [id]: true }));
      toast.success('Thanks for your feedback');
    } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Help center</h1>
      <p className="mb-4 text-stone-500">Search answers before raising a ticket.</p>
      <div className="relative mb-5">
        <Search size={18} className="absolute left-4 top-3.5 text-stone-400" />
        <input className="input !pl-11" placeholder="Search articles (e.g. wifi, password, fee)" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-stone-200" />)}</div>
        : articles.length === 0 ? <div className="card py-10 text-center text-stone-500">No articles found. Try another word or raise a ticket.</div>
        : (
          <div className="space-y-3">
            {articles.map((a) => (
              <div key={a._id} className="card !p-0 overflow-hidden">
                <button onClick={() => setOpen(open === a._id ? null : a._id)} className="flex w-full items-center justify-between gap-3 p-4 text-left">
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="text-xs text-stone-500">{a.category?.name}</p>
                  </div>
                  <ChevronDown size={18} className={`shrink-0 transition ${open === a._id ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {open === a._id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="border-t border-stone-100 p-4 text-stone-700">
                        <p className="whitespace-pre-line leading-relaxed">{a.body}</p>
                        <div className="mt-4 flex items-center gap-3 text-sm">
                          <span className="text-stone-500">Was this helpful?</span>
                          <button disabled={voted[a._id]} onClick={() => vote(a._id, true)} className="btn-ghost !px-3 !py-1"><ThumbsUp size={14} /> Yes</button>
                          <button disabled={voted[a._id]} onClick={() => vote(a._id, false)} className="btn-ghost !px-3 !py-1"><ThumbsDown size={14} /> No</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
