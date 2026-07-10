'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import SchoolSidebar from '@/components/school/SchoolSidebar';
import { useAuth } from '@/lib/AuthContext';
import { getRoleDisplayName } from '@/lib/auth';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';

// ── Top Bar ───────────────────────────────────────────────────────────────────
interface TopbarProps {
  title: string;
  subtitle?: string;
  onToggle: () => void;
}
export function Topbar({ title, subtitle, onToggle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 h-14 flex items-center px-4 sm:px-6 gap-4
      bg-white dark:bg-[#1a1d27] border-b border-green-100 dark:border-[#2a2d3a] shadow-sm">
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
          placeholder="Search students, staff..."
          className="bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 flex-1"
        />
      </div>

      {/* Notification bell */}
      <button className="relative text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex-shrink-0 transition-colors">
        <Icon d={ICONS.bell} className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center">
          3
        </span>
      </button>
    </header>
  );
}

// ── School Layout Wrapper ─────────────────────────────────────────────────────
interface SchoolLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function SchoolLayout({ children, title, subtitle }: SchoolLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { token, role, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!token) {
      router.replace('/school-login');
    }
  }, [isReady, router, token]);

  if (!isReady || !token) {
    return (
      <div className="min-h-screen bg-[#f5fdf4] dark:bg-[#0f1117] flex items-center justify-center">
        <div className="rounded-2xl border border-green-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] px-5 py-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Loading school portal…</p>
        </div>
      </div>
    );
  }

  // Restrict system owners from accessing the school portal if we want, or allow them.
  // We'll allow them for testing.

  return (
    <div className="flex min-h-screen bg-[#f5fdf4] dark:bg-[#0f1117] font-sans text-slate-800 dark:text-slate-100">
      <SchoolSidebar open={sidebarOpen} />

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-[margin] duration-300 ease-in-out
          ${sidebarOpen ? 'ml-[220px]' : 'ml-[64px]'}`}
      >
        <Topbar
          title={title}
          subtitle={subtitle}
          onToggle={() => setSidebarOpen(o => !o)}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
