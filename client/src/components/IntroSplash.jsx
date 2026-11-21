import { useEffect, useState } from 'react';

// Boxes appear -> fill up -> form a spinning ring -> brand name reveals
export default function IntroSplash({ onDone }) {
  const [cls, setCls] = useState('');

  useEffect(() => {
    const timers = [];
    const add = (c, ms) => timers.push(setTimeout(() => setCls((p) => `${p} ${c}`), ms));
    add('in', 100);
    add('fill', 900);
    add('ring', 2400);
    add('name', 5000);
    add('hide', 6800);
    timers.push(setTimeout(onDone, 7400));
    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line

  const skip = () => { setCls((p) => `${p} hide`); setTimeout(onDone, 400); };

  return (
    <div className={`intro ${cls}`}>
      <button className="intro-skip" onClick={skip}>Skip</button>
      <div className="intro-lockup">
        <div className="intro-mark">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="intro-bar" style={{ '--i': i }} />)}</div>
        <div className="intro-word" aria-label="Careloop">{[...'Careloop'].map((c, k) => <span key={k} style={{ '--k': k }}>{c}</span>)}</div>
      </div>
      <div className="intro-tag">Every voice, resolved.</div>
    </div>
  );
}
