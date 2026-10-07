const COLORS = ['#D4AF37', '#F5C542', '#22c55e', '#60a5fa', '#f5f5f5'];
const PARTICLES = 24;

// A brief celebratory burst — used only on genuine "something good just
// happened" moments (investment confirmed, withdrawal requested), never
// decorative/idle, and over almost instantly (prefers-reduced-motion
// already zeroes its CSS animation duration via the global rule).
export default function Confetti({ active }) {
  if (!active) return null;

  const particles = Array.from({ length: PARTICLES }, (_, i) => {
    const angle = (Math.PI * 2 * i) / PARTICLES + Math.random() * 0.5;
    const distance = 80 + Math.random() * 60;
    const cx = Math.cos(angle) * distance;
    const cy = Math.sin(angle) * distance - 40;
    const cr = Math.random() * 540 - 270;
    return { id: i, cx, cy, cr, color: COLORS[i % COLORS.length], delay: Math.random() * 0.15 };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-[110] flex items-center justify-center">
      {particles.map(p => (
        <span
          key={p.id}
          className="animate-confetti absolute w-2 h-2 rounded-sm"
          style={{
            backgroundColor: p.color,
            '--cx': `${p.cx}px`,
            '--cy': `${p.cy}px`,
            '--cr': `${p.cr}deg`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
