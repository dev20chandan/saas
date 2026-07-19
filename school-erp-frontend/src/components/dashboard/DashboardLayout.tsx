'use client';

import { useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar, { Icon, ICONS, NAV } from '@/components/dashboard/Sidebar';
import { useAuth } from '@/lib/AuthContext';
import { hasModuleAccess, getRoleDisplayName } from '@/lib/auth';

// ── Top Bar ───────────────────────────────────────────────────────────────────
interface TopbarProps {
  title: string;
  subtitle?: string;
  onToggle: () => void;
}
export function Topbar({ title, subtitle, onToggle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 h-14 flex items-center px-4 sm:px-6 gap-4
      bg-white dark:bg-[#1a1d27] border-b border-slate-100 dark:border-[#2a2d3a] shadow-sm">
      <button
        onClick={onToggle}
        className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex-shrink-0 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Icon d={ICONS.menu} className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-extrabold text-slate-900 dark:text-white leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-[#2a2d3a] rounded-xl px-3 h-9 gap-2 w-56 flex-shrink-0">
        <Icon d={ICONS.search} className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search anything..."
          className="bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 flex-1"
        />
      </div>

      {/* Notification bell */}
      <button className="relative text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex-shrink-0 transition-colors">
        <Icon d={ICONS.bell} className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center">
          5
        </span>
      </button>
    </header>
  );
}

// ── Dashboard Layout ──────────────────────────────────────────────────────────
interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { token, role, permissions, isReady } = useAuth();
  const activeRoute = NAV.find((item) => item.href === pathname || (item.href !== '/dashboard' && pathname.startsWith(item.href)));
  const routeAllowed = activeRoute ? hasModuleAccess(permissions, activeRoute.module) : true;

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!token) {
      router.replace('/login');
    }
  }, [isReady, router, token]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] dark:bg-[#0f1117] flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] px-5 py-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] dark:bg-[#0f1117] flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] px-5 py-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] dark:bg-[#0f1117] font-sans text-slate-800 dark:text-slate-100 relative">
      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-25 transition-opacity"
        />
      )}

      {/* Sidebar — reads darkMode from ThemeContext directly */}
      <Sidebar open={sidebarOpen} />

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ease-in-out
          ${sidebarOpen ? 'md:ml-[220px]' : 'md:ml-[64px]'}`}
      >
        <Topbar
          title={title}
          subtitle={subtitle}
          onToggle={() => setSidebarOpen(o => !o)}
        />
        <main className="flex-1 overflow-auto">
          {routeAllowed ? (
            children
          ) : (
            <div className="p-6 sm:p-8">
              <div className="max-w-xl rounded-2xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] shadow-sm p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Access restricted</p>
                <h2 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">This module is not available for {getRoleDisplayName(role)}</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  The current role can still use the modules shown in the sidebar.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
