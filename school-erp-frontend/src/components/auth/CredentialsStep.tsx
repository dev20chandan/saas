'use client';

import { useState } from 'react';
import { getDefaultPermissions } from '@/lib/auth';
import { api } from '@/lib/api';

interface CredentialsStepProps {
  schoolId: string;
  onBack: () => void;
  onSuccess: (token: string, role: string, schoolId: string) => void;
  error: string;
  setError: (v: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

export default function CredentialsStep({
  schoolId,
  onBack,
  onSuccess,
  error,
  setError,
  loading,
  setLoading,
}: CredentialsStepProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      setError('Email aur password dono bharo');
      return;
    }
    try {
      const response = await api.post('/auth/login', { email, password, schoolId }, { requireAuth: false });
      
      const role = response.role || 'Teacher';
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', role);
      localStorage.setItem('permissions', JSON.stringify(getDefaultPermissions(role as any)));
      
      onSuccess(response.token, role, schoolId);
    } catch (err: any) {
      setError(err?.message || 'Server se connect nahi ho paya. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Input fields */}
      <div className="space-y-3">
        {/* Email Address */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-400">
            Email address
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-zinc-500 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="you@school.com"
              className="w-full h-11 pl-11 pr-4 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 bg-zinc-900/50 hover:bg-zinc-900/80 text-white placeholder-zinc-500 transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-400">
            Password
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-zinc-500 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="••••••••"
              className="w-full h-11 pl-11 pr-12 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 bg-zinc-900/50 hover:bg-zinc-900/80 text-white placeholder-zinc-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {showPass ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-xl px-4 py-3 mt-2">
          {error}
        </p>
      )}

      {/* Sign In Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 disabled:border-zinc-800/40 text-white rounded-xl text-sm font-semibold transition-all duration-200 mt-4 flex items-center justify-center"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      {/* Footer links */}
      <div className="flex items-center justify-between text-xs pt-2">
        <button
          onClick={onBack}
          className="text-blue-500 hover:text-blue-400 hover:underline transition-colors flex items-center space-x-1"
        >
          <span>←</span>
          <span>Change school ID</span>
        </button>
        <button className="text-zinc-500 hover:text-zinc-300 hover:underline transition-colors">
          Forgot password?
        </button>
      </div>
    </div>
  );
}
