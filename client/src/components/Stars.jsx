import { useState } from 'react';
import { Star } from 'lucide-react';

export default function Stars({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          className="transition hover:scale-125" aria-label={`${n} stars`}>
          <Star size={30} className={(hover || value) >= n ? 'fill-brand-coral text-brand-coral' : 'text-stone-300'} />
        </button>
      ))}
    </div>
  );
}
