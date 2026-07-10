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

export default function LoginPage() {
  const router = useRouter();
  const { token, isReady, signIn } = useAuth();
  const [email, setEmail] = useState('owner@schoolsaas.in');
  const [password, setPassword] = useState('School@123');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isReady && token) {
      router.replace('/dashboard');
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
      setError('Email aur password fill karein.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/admin-login', { email, password }, { requireAuth: false });
      const mappedRole = mapBackendRoleToFrontend(response.role);
      
      signIn({
        token: response.token,
        role: mappedRole,
        type: 'admin',
        schoolId: response.schoolId || '',
        permissions: response.user?.settings?.permissions || getDefaultPermissions(mappedRole),
      });
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Server se connect nahi ho paya. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-white text-slate-900 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
        
        {/* LEFT COLUMN: BRAND SIDEBAR (hidden on mobile/tablet) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-b from-[#f0f7ff] to-[#e0f0fe] flex-col justify-between p-12 border-r border-blue-100">
          <div>
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-500/20">
                ERP
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                SchoolSaaS
              </span>
            </div>
            <span className="text-[10px] tracking-wider text-slate-400 font-bold block mt-1">
              ERP PLATFORM
            </span>
          </div>

          <div className="flex flex-col justify-center flex-grow py-8 max-w-sm mx-auto">
            {/* Welcome back chip */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 w-max mb-6">
              Welcome Back! 👋
            </span>

            {/* Main title */}
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              Sign in to your <br />
              <span className="text-blue-600">SchoolSaaS</span>
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Manage your school operations in one place.
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

            {/* Feature lists */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center flex-shrink-0 text-blue-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Secure & Reliable</h4>
                  <p className="text-[11px] text-slate-500">Enterprise grade security to protect your data</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center flex-shrink-0 text-blue-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Easy to Use</h4>
                  <p className="text-[11px] text-slate-500">Simple and intuitive interface for everyone</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center flex-shrink-0 text-blue-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">All-in-One Solution</h4>
                  <p className="text-[11px] text-slate-500">From admission to examination, manage everything</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-blue-200/50 pt-4">
            <span>© 2025 SchoolSaaS. All rights reserved.</span>
            <div className="flex space-x-3 font-semibold text-slate-500">
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <span>SSL Secured</span>
              </span>
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <span>24/7 Support</span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM PANEL */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center px-6 py-12 md:px-16 lg:px-24 bg-slate-50/50">
          <div className="w-full max-w-[400px] bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
            {/* Header logo for mobile */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                  ERP
                </div>
                <span className="text-base font-bold text-slate-900">
                  SchoolSaaS
                </span>
              </div>
            </div>

            <div className="hidden lg:flex justify-end w-full mb-2">
              <Link href="/school-login" className="text-xs font-semibold text-slate-500 hover:text-green-600 transition-colors">
                Go to School Portal &rarr;
              </Link>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                System Admin Sign In
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your system owner credentials below.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
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
                    placeholder="you@school.com"
                    className="w-full h-11 pl-11 pr-4 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm focus:outline-none bg-slate-50/50 hover:bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-755">
                  Password
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
                    placeholder="Enter your password"
                    className="w-full h-11 pl-11 pr-12 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm focus:outline-none bg-slate-50/50 hover:bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
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
                <label className="flex items-center space-x-2 text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-200 rounded focus:ring-blue-500 accent-blue-600"
                  />
                  <span>Remember me</span>
                </label>
                <Link href="#" className="text-blue-600 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* Error box */}
              {error && (
                <p className="text-xs text-red-650 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-2 font-medium">
                  {error}
                </p>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] text-slate-500 leading-5">
                <p><span className="font-semibold text-slate-700">Owner:</span> owner@schoolsaas.in</p>
                <p className="mt-1">All accounts use the same password: <span className="font-semibold text-slate-700">{DEFAULT_PASSWORD}</span></p>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all duration-200 mt-6 flex items-center justify-center space-x-2 shadow-md shadow-blue-500/10"
              >
                {loading ? (
                  <span>Signing in…</span>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Sign in</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] tracking-wider uppercase font-semibold">
                or continue with
              </span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* SSO buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center space-x-2 h-10 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>
              <button className="flex items-center justify-center space-x-2 h-10 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#f35022" d="M1.5 1.5h9.5v9.5H1.5z"/>
                  <path fill="#7fba00" d="M12 1.5h9.5v9.5H12z"/>
                  <path fill="#00a4ef" d="M1.5 12h9.5v9.5H1.5z"/>
                  <path fill="#ffb900" d="M12 12h9.5v9.5H12z"/>
                </svg>
                <span>Microsoft</span>
              </button>
            </div>

            {/* SSO Register link */}
            <p className="text-xs text-slate-500 mt-6 text-center">
              Are you a school user?{' '}
              <Link href="/school-login" className="text-green-600 hover:underline font-semibold">
                Go to School Login
              </Link>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
