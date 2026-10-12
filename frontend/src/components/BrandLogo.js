import { useTheme } from '../context/ThemeContext';

// The wordmark is white on the dark logo and dark on the light one, so the
// file has to follow the active theme or it disappears on the wrong background.
export default function BrandLogo({ className = 'h-8 w-auto' }) {
  const { isLight } = useTheme();
  return <img src={isLight ? '/logo-on-light.png' : '/logo-on-dark.png'} alt="IMC Corporation" className={`object-contain ${className}`} />;
}
