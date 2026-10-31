import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, X, KeyRound, Unlock, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authenticateAdmin } = useApp();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setErrorMsg('Please enter the 4-digit PIN.');
      return;
    }

    const success = authenticateAdmin(pin);
    if (success) {
      setPin('');
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const handleClose = () => {
    setPin('');
    setErrorMsg('');
    setIsAuthModalOpen(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-sm bg-white dark:bg-phdark-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-phdark-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-brand-darkest via-brand-dark to-brand-navy text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-gold shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Secretary Login</h3>
              <p className="text-xs text-slate-300">Barangay Cantaongon Portal</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-center">
            Enter the 4-digit PIN to unlock event scheduling, approvals, and official portal management.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 text-center uppercase tracking-wider">
              Secretary Passcode
            </label>
            <div className="relative max-w-[200px] mx-auto">
              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="••••"
                value={pin}
                onChange={e => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setErrorMsg('');
                }}
                className="w-full text-center text-2xl font-black tracking-[0.5em] px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-phdark-700 bg-slate-50 dark:bg-phdark-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all"
              />
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-500 font-bold text-center mt-1 animate-shake">
                {errorMsg}
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-brand-primary hover:bg-brand-dark text-white font-bold text-xs shadow-md shadow-brand-navy/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4 text-gold" />
              <span>Unlock Admin Controls</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Continue as Public Viewer
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
