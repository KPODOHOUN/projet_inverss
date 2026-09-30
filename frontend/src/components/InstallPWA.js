import { useEffect, useState } from 'react';

const DISMISSED_KEY = 'neliaxaInstallDismissed';

const isIosDevice = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
  !window.MSStream;

const isStandaloneDisplay = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

export default function InstallPWA() {
  const [installEvent, setInstallEvent] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (isStandaloneDisplay()) return;
    let wasDismissed = false;
    try { wasDismissed = localStorage.getItem(DISMISSED_KEY) === '1'; } catch (e) { /* localStorage unavailable */ }
    if (wasDismissed) return;

    setDismissed(false);
    setIsIOS(isIosDevice());

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch (e) { /* localStorage unavailable */ }
  };

  const handleInstall = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    dismiss();
  };

  const visible = !dismissed && (installEvent || isIOS);

  useEffect(() => {
    document.body.classList.toggle('has-install-banner', Boolean(visible));
    return () => document.body.classList.remove('has-install-banner');
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 z-[100] px-4 sm:px-6"
      style={{ bottom: 'max(16px, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="max-w-md mx-auto bg-black border-2 border-yellow-500/60 shadow-2xl shadow-black/50 rounded-lg p-4 flex items-start gap-3">
        <img src="/logo192.png" alt="" className="w-10 h-10 rounded shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">Installer l'application IMC</p>
          {isIOS && !installEvent ? (
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              Appuyez sur <span className="text-yellow-500 font-semibold">Partager</span> puis
              <span className="text-yellow-500 font-semibold"> "Sur l'écran d'accueil"</span>.
            </p>
          ) : (
            <p className="text-gray-400 text-xs mt-1">Accédez à IMC comme une vraie application, en un tap.</p>
          )}

          {!isIOS && installEvent && (
            <button
              onClick={handleInstall}
              className="mt-3 px-4 py-2 bg-yellow-500 text-black text-xs font-bold tracking-wide rounded hover:bg-yellow-400 transition-colors cursor-pointer border-none"
            >
              INSTALLER
            </button>
          )}
        </div>

        <button
          onClick={dismiss}
          aria-label="Fermer"
          className="text-gray-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1 shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
