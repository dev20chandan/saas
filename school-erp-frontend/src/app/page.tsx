'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <div className="flex flex-col items-center space-y-6 text-center">
        {/* Blue square logo box (72x72) with text "ERP" in white */}
        <div className="w-[72px] h-[72px] bg-blue-600 dark:bg-blue-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-blue-500/20 dark:shadow-blue-500/10 animate-bounce">
          ERP
        </div>

        {/* Company name "SchoolSaaS" and Tagline */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            SchoolSaaS
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            India ka #1 school management platform
          </p>
        </div>

        {/* 3 animated loading dots */}
        <div className="flex space-x-2 pt-4">
          <span 
            className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" 
            style={{ animationDelay: '0s' }}
          />
          <span 
            className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" 
            style={{ animationDelay: '0.2s' }}
          />
          <span 
            className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" 
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>
    </main>
  );
}
