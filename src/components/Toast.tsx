import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X, Copy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playSuccessSound, playSubmissionSuccessSound, playAlertSound, playErrorSound, playClickSound } from '../lib/sounds';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error' | 'copied';
  duration?: number;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastItem['type'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((title: string, message?: string, type: ToastItem['type'] = 'success', duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type, duration }]);

    // Play appropriate sound effect
    if (type === 'success' || type === 'copied') {
      if (title.toLowerCase().includes('সফল') || title.toLowerCase().includes('success') || title.toLowerCase().includes('আবেদন')) {
        playSubmissionSuccessSound();
      } else {
        playSuccessSound();
      }
    } else if (type === 'warning') {
      playAlertSound();
    } else if (type === 'error') {
      playErrorSound();
    } else {
      playClickSound();
    }

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-500/30 dark:border-slate-500/30 shadow-2xl shadow-slate-950/20 text-slate-900 dark:text-white backdrop-blur-xl"
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-slate-500" />}
                {toast.type === 'copied' && <Copy className="w-5 h-5 text-slate-500" />}
                {toast.type === 'info' && <Sparkles className="w-5 h-5 text-brand-primary-hover" />}
                {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-heading">{toast.title}</h5>
                {toast.message && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
