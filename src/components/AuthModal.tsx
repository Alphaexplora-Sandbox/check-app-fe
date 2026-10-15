import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, isLoading, error } = useAuthStore();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill in both email and password.');
      return;
    }

    try {
      if (isRegisterMode) {
        await register(email, password, fullName || email.split('@')[0]);
      } else {
        await login(email, password);
      }
    } catch {
      // Error is set in store
    }
  };

  const fillCustomer = () => {
    setEmail('customer@e-commerce-mock.com');
    setPassword('CustomerPass123!');
    setLocalError(null);
  };

  const fillAdmin = () => {
    setEmail('admin@e-commerce-mock.com');
    setPassword('AdminPass123!');
    setLocalError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 sm:p-8 shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Lock className="h-6 w-6" />
          </div>
          <h2 id="auth-modal-title" className="text-xl font-bold tracking-tight text-white">
            {isRegisterMode ? 'Create an Account' : 'Welcome to e-commerce-mock'}
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            {isRegisterMode
              ? 'Join our premium customer network'
              : 'Sign in to access your cart, checkout and orders'}
          </p>
        </div>

        {/* Error Callout */}
        {(error || localError) && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error || localError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div>
              <label htmlFor="reg-fullname" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="reg-fullname"
                  type="text"
                  placeholder="Jane Customer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3.5 py-2.5 pl-10 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                placeholder="customer@e-commerce-mock.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3.5 py-2.5 pl-10 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="auth-password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3.5 py-2.5 pl-10 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {isLoading
              ? 'Processing...'
              : isRegisterMode
              ? 'Create Account'
              : 'Log In'}
          </button>
        </form>

        {/* Quick Demo Autofill Helpers */}
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="text-[11px] font-medium text-zinc-500 mb-2">Quick Demo Accounts:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillCustomer}
              className="rounded-lg border border-white/5 bg-zinc-950/80 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-emerald-500/40 hover:text-white transition-colors text-left"
            >
              <span className="block font-medium text-emerald-400">Customer</span>
              <span className="block text-[10px] text-zinc-500 truncate">customer@...</span>
            </button>
            <button
              type="button"
              onClick={fillAdmin}
              className="rounded-lg border border-white/5 bg-zinc-950/80 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-amber-500/40 hover:text-white transition-colors text-left"
            >
              <span className="block font-medium text-amber-400">Admin</span>
              <span className="block text-[10px] text-zinc-500 truncate">admin@...</span>
            </button>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setLocalError(null);
            }}
            className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            {isRegisterMode
              ? 'Already have an account? Sign in'
              : "Don't have an account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
};
