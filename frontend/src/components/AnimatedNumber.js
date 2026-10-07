import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Counts up/down from the previous value to the new one — used on every
// headline number (balance, invested, earnings) so a figure changing
// after an action reads as something that just happened, not a silent
// page refresh. Jumps straight to the final value for prefers-reduced-motion,
// since requestAnimationFrame isn't covered by the global CSS media query.
export default function AnimatedNumber({ value, decimals = 2, prefix = '', suffix = '', duration = 800 }) {
  const numericValue = Number(value) || 0;
  const [display, setDisplay] = useState(numericValue);
  const prevValue = useRef(numericValue);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValue.current = numericValue;
      setDisplay(numericValue);
      return;
    }
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
