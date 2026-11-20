// 6 bars = the 6 stages of a ticket: Raise, Assign, Reply, Resolve, Close, Rate
export default function Logo({ size = 36, text = true, light = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 rounded-md"
            style={{
              width: size * 0.12,
              height: size * 0.34,
              marginLeft: -size * 0.06,
              marginTop: -size * 0.17,
              background: i === 5 ? '#FF6B4A' : 'linear-gradient(180deg,#139A4F,#7ACB4B)',
              transform: `rotate(${i * 60}deg) translateY(-${size * 0.29}px)`,
            }}
          />
        ))}
      </div>
      {text && <span className={`text-xl font-bold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>Careloop</span>}
    </div>
  );
}
