'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  DEFAULT_PASSWORD,
  getDefaultPermissions,
  mapBackendRoleToFrontend,
} from '@/lib/auth';
import { api } from '@/lib/api';

export default function SchoolLoginPage() {
  const router = useRouter();
  const { token, isReady, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('School@123');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgot, setIsForgot] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isReady && token) {
      router.replace('/school/dashboard');
    }
  }, [isReady, router, token]);

  if (!isReady) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Loading login…</p>
        </div>
      </main>
    );
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await api.post('/auth/login', { email, password }, { requireAuth: false });
      const mappedRole = mapBackendRoleToFrontend(response.role);
      
      signIn({
        token: response.token,
        role: mappedRole,
        type: 'user',
        schoolId: response.schoolId || '',
        permissions: response.user?.settings?.permissions || getDefaultPermissions(mappedRole),
      });
      
      router.push('/school/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and new password are required.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await api.post('/auth/forgot-password', { email, password }, { requireAuth: false });
      setSuccessMessage('Password updated successfully! You can login now.');
      setIsForgot(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Check if email exists.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-white text-slate-900 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
        
        {/* LEFT COLUMN: BRAND SIDEBAR (hidden on mobile/tablet) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-b from-[#f5fdf4] to-[#dcfce7] flex-col justify-between p-12 border-r border-green-100">
          <div>
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-green-500/20">
                ERP
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                SchoolSaaS
              </span>
            </div>
            <span className="text-[10px] tracking-wider text-green-600 font-bold block mt-1">
              SCHOOL PORTAL
            </span>
          </div>

          <div className="flex flex-col justify-center flex-grow py-8 max-w-sm mx-auto">
            {/* Welcome back chip */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 border border-green-200 text-green-700 w-max mb-6">
              Welcome to Your School! 👋
            </span>

            {/* Main title */}
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              Sign in to your <br />
              <span className="text-green-600">School Portal</span>
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Manage your daily operations, students, and staff efficiently.
            </p>

            {/* School illustration */}
            <div className="relative w-full h-[240px] my-6 flex items-center justify-center">
              <Image 
                src="/school_illustration.png" 
                alt="School Illustration"
                width={260}
                height={240}
                className="w-auto h-auto object-contain drop-shadow-lg"
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            </div>
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-green-200/50 pt-4">
            <span>© 2025 SchoolSaaS. All rights reserved.</span>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM PANEL */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center px-4 py-8 sm:px-6 sm:py-12 md:px-16 lg:px-24 bg-slate-50 lg:bg-slate-50/50 min-h-screen lg:min-h-0">
          <div className="w-full max-w-[420px] bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm lg:shadow-md relative">
            
            {/* Admin Portal Toggle */}
            <div className="absolute -top-12 right-0 lg:hidden flex justify-end w-full">
              <Link href="/login" className="text-xs font-semibold text-slate-500 hover:text-blue-600">
                Go to Admin Portal &rarr;
              </Link>
            </div>
            
            {/* Header logo for mobile */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                  ERP
                </div>
                <span className="text-base font-bold text-slate-900">
                  School Portal
                </span>
              </div>
            </div>

            <div className="hidden lg:flex justify-end w-full mb-2">
              <Link href="/login" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                Go to System Admin Portal &rarr;
              </Link>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {isForgot ? 'Reset Password' : 'School Sign In'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isForgot ? 'Enter your email and new password to reset.' : 'Enter your school credentials below.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={isForgot ? handleForgotPassword : handleLogin} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-755">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    placeholder="teacher@school.com"
                    className="w-full h-11 pl-11 pr-4 border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/15 rounded-xl text-sm focus:outline-none bg-slate-50/50 hover:bg-slate-50 text-slate-900 placeholder-slate-400 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-755">
                  {isForgot ? 'New Password' : 'Password'}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    placeholder={isForgot ? 'Enter new password' : 'Enter your password'}
                    className="w-full h-11 pl-11 pr-12 border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/15 rounded-xl text-sm focus:outline-none bg-slate-50/50 hover:bg-slate-50 text-slate-900 placeholder-slate-400 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPass ? (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                {isForgot ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgot(false);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-green-600 hover:underline font-medium ml-auto"
                  >
                    Back to Sign In
                  </button>
                ) : (
                  <>
                    <label className="flex items-center space-x-2 text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-green-600 border-slate-200 rounded focus:ring-green-500 accent-green-600"
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgot(true);
                        setError('');
                        setSuccessMessage('');
                      }}
                      className="text-green-600 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </>
                )}
              </div>

              {/* Success / Error boxes */}
              {successMessage && (
                <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mt-2 font-medium">
                  {successMessage}
                </p>
              )}

              {error && (
                <p className="text-xs text-red-650 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-2 font-medium">
                  {error}
                </p>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] text-slate-500 leading-5">
                <p>Login with a user account created under your school.</p>
                <p className="mt-1">Make sure you have registered your school via the admin portal first.</p>
              </div>

              {/* Sign In / Reset Password Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-green-600 hover:bg-green-700 hover:-translate-y-0.5 focus:ring-4 focus:ring-green-500/30 disabled:bg-green-400 disabled:hover:translate-y-0 text-white rounded-xl text-sm font-semibold transition-all duration-300 mt-6 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg shadow-green-500/20"
              >
                {loading ? (
                  <span>{isForgot ? 'Updating…' : 'Signing in…'}</span>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>{isForgot ? 'Reset Password' : 'Sign into Portal'}</span>
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-slate-500 mt-6 text-center">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-green-600 hover:underline font-semibold">
                Register a new school
              </Link>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
