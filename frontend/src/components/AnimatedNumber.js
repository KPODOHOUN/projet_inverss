import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Counts up from 0 on first mount (the deliberate dashboard "reveal") and
// from the previous value on every change after that, so a figure changing
// after an action reads as something that just happened, not a silent
// page refresh. Jumps straight to the final value for prefers-reduced-motion,
// since requestAnimationFrame isn't covered by the global CSS media query.
export default function AnimatedNumber({ value, decimals = 2, prefix = '', suffix = '', duration = 800 }) {
  const numericValue = Number(value) || 0;
  const reduced = prefersReducedMotion();
  const [display, setDisplay] = useState(reduced ? numericValue : 0);
  const prevValue = useRef(reduced ? numericValue : 0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      prevValue.current = numericValue;
      setDisplay(numericValue);
      return;
    }

    const start = prevValue.current;
    const end = numericValue;
    const startTime = performance.now();
    let raf;

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prevValue.current = end;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericValue, duration]);

  return <>{prefix}{display.toFixed(decimals)}{suffix}</>;
}
