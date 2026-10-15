import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-zinc-900/95 px-4 py-3 text-xs text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 pointer-events-none"
    >
      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss toast"
        className="ml-2 text-zinc-400 hover:text-white pointer-events-auto"
      >
        ✕
      </button>
    </div>
  );
};
