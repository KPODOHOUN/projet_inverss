import { useTheme } from '../../context/ThemeContext';

/** Fond plat — sans animation ni effets décoratifs */
export default function AuroraBackground({ variant = 'full' }) {
  const { isLight } = useTheme();
  const position = variant === 'auth' ? 'absolute inset-0' : 'fixed inset-0';

  return (
    <div
      className={`pointer-events-none ${position} z-0 ${isLight ? 'bg-gray-50' : 'bg-black'}`}
      aria-hidden="true"
    />
  );
}
