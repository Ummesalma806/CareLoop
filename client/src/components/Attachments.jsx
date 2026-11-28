import { Paperclip, FileText, X } from 'lucide-react';

// Show saved attachments (links to Cloudinary)
export function AttachmentList({ items }) {
  if (!items?.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((a, i) => (
        <a key={i} href={a.url} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-brand hover:text-brand">
          {a.mimeType?.startsWith('image/') ? <img src={a.url} alt="" className="h-8 w-8 rounded object-cover" /> : <FileText size={16} />}
          <span className="max-w-[140px] truncate">{a.name}</span>
        </a>
      ))}
    </div>
  );
}

// File picker with a removable list of chosen files (max 3)
export function FilePicker({ files, setFiles }) {
  const add = (e) => {
    const picked = [...e.target.files];
    e.target.value = '';
    const next = [...files, ...picked].slice(0, 3);
    if (next.some((f) => f.size > 4 * 1024 * 1024)) return alert('Each file must be 4 MB or smaller');
    setFiles(next);
  };
  return (
    <div>
      <label className="btn-ghost cursor-pointer !px-3 !py-1.5 text-xs">
        <Paperclip size={14} /> Attach files (JPG, PNG, PDF · max 3)
        <input type="file" hidden multiple accept="image/jpeg,image/png,image/webp,application/pdf" onChange={add} />
      </label>
      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <span key={i} className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs">
              <span className="max-w-[140px] truncate">{f.name}</span>
              <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label="Remove"><X size={12} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
