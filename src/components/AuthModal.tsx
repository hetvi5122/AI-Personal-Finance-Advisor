import React, { useState, useEffect } from 'react';
import { X, Sparkles, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { findUserByEmail, saveRegisteredUser } from '../lib/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate?: (name: string, email: string, isDemo?: boolean) => void;
  onSuccess?: (name?: string, email?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthenticate, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Clear inputs whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setName('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Password validation checks
  const hasMinLength = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

  const handleAuthSuccess = (nameVal: string, emailVal: string, isDemo = false) => {
    setError(null);
    if (onAuthenticate) {
      onAuthenticate(nameVal, emailVal, isDemo);
    }
    if (onSuccess) {
      onSuccess(nameVal, emailVal);
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }

      // Strict Password Validation Rules
      if (!hasMinLength) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (!hasLetter) {
        setError('Password must contain at least one letter (a-z or A-Z).');
        return;
      }
      if (!hasNumber) {
        setError('Password must contain at least one number (0-9).');
        return;
      }
      if (!hasSpecialChar) {
        setError('Password must contain at least one special character (e.g. @, !, #, $, etc.).');
        return;
      }

      const existing = findUserByEmail(cleanEmail);
      if (existing) {
        setError('An account with this email already exists. Please sign in instead.');
        return;
      }

      saveRegisteredUser({
        name: name.trim(),
        email: cleanEmail,
        password: password,
      });

      handleAuthSuccess(name.trim(), cleanEmail, false);
    } else {
      const user = findUserByEmail(cleanEmail);
      if (!user) {
        setError('No account found with this email. Please sign up first.');
        return;
      }

      if (user.password !== password) {
        setError('Incorrect password. Please try again.');
        return;
      }

      const isDemoUser = cleanEmail.toLowerCase() === 'alex.morgan@fintech.ai';
      handleAuthSuccess(user.name, user.email, isDemoUser);
    }
  };

  const handleDemoQuickLogin = () => {
    handleAuthSuccess('Alex Morgan', 'alex.morgan@fintech.ai', true);
  };

  const toggleMode = () => {
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {isSignUp ? 'Create WealthAI Account' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Access your AI-driven financial dashboard & reports
          </p>
        </div>

        {/* Quick Demo Button */}
        <div className="mt-6">
          <button
            onClick={handleDemoQuickLogin}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>One-Click Instant Demo Login (Alex Morgan)</span>
          </button>
        </div>

        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-neutral-200 dark:border-neutral-800 w-full" />
          <span className="bg-white dark:bg-neutral-900 px-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wider absolute">
            Or continue with email
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Live Password Checklist for Account Creation */}
            {isSignUp && (
              <div className="mt-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 text-[11px] space-y-1.5">
                <div className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  Password Must Contain:
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-neutral-500'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-500' : 'text-neutral-400 opacity-50'}`} />
                  <span>Minimum 6 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${hasLetter ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-neutral-500'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasLetter ? 'text-emerald-500' : 'text-neutral-400 opacity-50'}`} />
                  <span>At least 1 letter (a-z or A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-neutral-500'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-500' : 'text-neutral-400 opacity-50'}`} />
                  <span>At least 1 number (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${hasSpecialChar ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-neutral-500'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasSpecialChar ? 'text-emerald-500' : 'text-neutral-400 opacity-50'}`} />
                  <span>At least 1 special character (@ ! . # $ % & *)</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition cursor-pointer mt-2"
          >
            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            type="button"
            className="text-xs text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
};
