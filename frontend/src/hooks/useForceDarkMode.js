import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

// Light mode is only meant to be an opt-in look for the public landing page
// — pages that call this stay dark regardless of the saved preference.
// Goes through ThemeContext's own setForceDark rather than touching
// document.documentElement directly: that class is also written by
// ThemeProvider's own effect, and two independent effects racing to set
// the same DOM class is exactly how light mode leaked in before (whichever
// fired last won, unpredictably).
export default function useForceDarkMode() {
  const { setForceDark } = useTheme();
  useEffect(() => {
    setForceDark(true);
    return () => setForceDark(false);
  }, [setForceDark]);
}
