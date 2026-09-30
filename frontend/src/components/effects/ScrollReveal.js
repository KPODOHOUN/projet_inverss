import useScrollReveal from '../../hooks/useScrollReveal';

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  once = true,
}) {
  const [ref, visible] = useScrollReveal({ once });

  const hidden =
    direction === 'left' ? '-translate-x-10 opacity-0'
    : direction === 'right' ? 'translate-x-10 opacity-0'
    : direction === 'scale' ? 'scale-95 opacity-0'
    : 'translate-y-8 opacity-0';

  const shown = 'translate-x-0 translate-y-0 scale-100 opacity-100';

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? shown : hidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
