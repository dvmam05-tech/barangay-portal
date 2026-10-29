import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => {
        let icon = <Info className="w-5 h-5 text-blue-500" />;
        let borderClass = 'border-blue-200 dark:border-blue-900/60 bg-white dark:bg-phdark-900';
        let titleColor = 'text-blue-900 dark:text-blue-300';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
          borderClass = 'border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-phdark-900';
          titleColor = 'text-emerald-900 dark:text-emerald-300';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-accent" />;
          borderClass = 'border-accent-border dark:border-accent-dark bg-white dark:bg-phdark-900';
          titleColor = 'text-accent-dark dark:text-accent-soft';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-gold" />;
          borderClass = 'border-amber-200 dark:border-amber-900/60 bg-white dark:bg-phdark-900';
          titleColor = 'text-amber-900 dark:text-amber-300';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${borderClass} transition-all duration-300 animate-slide-in`}
            role="alert"
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-semibold ${titleColor}`}>{toast.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
