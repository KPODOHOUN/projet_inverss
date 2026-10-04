import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('neliaxaTheme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) { /* localStorage unavailable */ }
  return 'dark'; // IMC's native theme — light mode is the opt-in
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  // Pages outside the landing page force dark regardless of the saved
  // preference (see useForceDarkMode). This lives here, as the single
  // effect that actually touches the DOM class, instead of letting pages
  // mutate document.documentElement directly — two independent effects
  // both touching the same class raced against each other (whichever
  // fired last won), which is exactly what let light mode leak into pages
  // that were supposed to stay dark.
  const [forceDark, setForceDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', theme === 'light' && !forceDark);
    try { localStorage.setItem('neliaxaTheme', theme); } catch (e) { /* ignore */ }
  }, [theme, forceDark]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLight: theme === 'light' && !forceDark, setForceDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
