import { useEffect } from 'react';

// Light mode is only meant to be an opt-in look for the public landing page
// — the dashboard's `.dash-scope` light overrides exist, but a user who
// switched to light mode on the landing page would otherwise land in a
// half-light dashboard with no toggle to switch back. Forcing dark here
// while mounted (and restoring whatever was there on unmount) keeps the
// landing page's own preference intact without leaking it into the app.
export default function useForceDarkMode() {
  useEffect(() => {
    const wasLight = document.documentElement.classList.contains('light-mode');
    document.documentElement.classList.remove('light-mode');
    return () => {
      if (wasLight) document.documentElement.classList.add('light-mode');
    };
  }, []);
}
