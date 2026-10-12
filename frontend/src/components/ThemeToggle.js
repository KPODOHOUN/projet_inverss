import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isLight, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Passer en mode sombre' : 'Passer en mode clair'}
      title={isLight ? 'Mode sombre' : 'Mode clair'}
      className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-full border border-white/10 text-[#9aa6b8] hover:text-[#e7ebf2] bg-transparent cursor-pointer transition-colors ${className}`}
    >
      {isLight ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
