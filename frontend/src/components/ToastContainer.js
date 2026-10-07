import { useEffect, useState, useCallback } from 'react';
import { subscribeToast } from '../utils/toast';

const STYLES = {
  success: { border: 'border-green-500/50', icon: '✓', iconBg: 'bg-green-500/20 text-green-400' },
  error:   { border: 'border-red-500/50',   icon: '✕', iconBg: 'bg-red-500/20 text-red-400' },
  info:    { border: 'border-yellow-500/50', icon: 'i', iconBg: 'bg-yellow-500/20 text-yellow-400' },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(list => list.filter(t => t.id !== id));
  }, []);

  useEffect(() => subscribeToast((t) => {
    setToasts(list => [...list, t]);
    setTimeout(() => dismiss(t.id), 4000);
  }), [dismiss]);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[92vw] max-w-sm">
      {toasts.map(t => {
        const s = STYLES[t.type] || STYLES.success;
        return (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={`animate-toastIn flex items-start gap-3 p-3.5 bg-[#0d0d0d] border-2 ${s.border} rounded-lg shadow-2xl cursor-pointer`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${s.iconBg}`}>{s.icon}</span>
            <p className="text-sm text-gray-200 font-medium">{t.message}</p>
          </div>
        );
      })}
    </div>
  );
}
