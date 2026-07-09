'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import {
  getRoleDisplayName,
  hasModuleAccess,
  type DashboardModule,
} from '@/lib/auth';

// ── icon helper ───────────────────────────────────────────────────────────────
export const Icon = ({ d, className = 'w-5 h-5' }: { d: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

// ── icon paths ────────────────────────────────────────────────────────────────
export const ICONS = {
  dashboard:     'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  schools:       'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  users:         'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  subscriptions: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  payments:      'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  analytics:     'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  support:       'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  audit:         'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  settings:      'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  search:        'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  bell:          'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  menu:          'M4 6h16M4 12h16M4 18h16',
  chevronDown:   'M19 9l-7 7-7-7',
  chevronRight:  'M9 5l7 7-7 7',
  calendar:      'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  check:         'M5 13l4 4L19 7',
  arrowUp:       'M5 15l7-7 7 7',
  arrowDown:     'M19 9l-7 7-7-7',
  moon:          'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  sun:           'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  logout:        'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  shield:        'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  database:      'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
  trash:         'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  save:          'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4',
  key:           'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
  upload:        'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
  mail:          'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  globe:         'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
  credit:        'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  edit:          'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  user:          'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
};

export const NAV = [
  { label: 'Dashboard',       icon: ICONS.dashboard,     href: '/dashboard',     module: 'dashboard' as DashboardModule },
  { label: 'Schools',         icon: ICONS.schools,       href: '/schools',       module: 'schools' as DashboardModule },
  { label: 'Users',           icon: ICONS.users,         href: '/users',         module: 'users' as DashboardModule },
  { label: 'Subscriptions',   icon: ICONS.subscriptions, href: '/subscriptions', module: 'subscriptions' as DashboardModule },
  { label: 'Payments',        icon: ICONS.payments,      href: '/payments',      module: 'payments' as DashboardModule },
  { label: 'Analytics',       icon: ICONS.analytics,     href: '/analytics',     module: 'analytics' as DashboardModule },
  { label: 'Support Tickets', icon: ICONS.support,       href: '/support',       module: 'support' as DashboardModule },
  { label: 'Audit Logs',      icon: ICONS.audit,         href: '/audit',         module: 'audit' as DashboardModule },
  { label: 'Admins',          icon: ICONS.users,         href: '/admins',        module: 'admins' as DashboardModule },
  { label: 'Settings',        icon: ICONS.settings,      href: '/settings',      module: 'settings' as DashboardModule },
];

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname();
  const { darkMode, toggleDark } = useTheme();
  const { token, role, permissions, signOut } = useAuth();
  const visibleNav = NAV.filter((item) => {
    if (item.module === 'admins' && role !== 'owner') return false;
    return hasModuleAccess(permissions, item.module);
  });

  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    let active = true;

    if (!token) {
      setProfile(null);
      return () => {
        active = false;
      };
    }

    api.get('/auth/me')
      .then((res) => {
        if (!active || !res) {
          return;
        }

        setProfile({
          name: res.name || getRoleDisplayName(role),
          email: res.email || 'platform@schools.in',
        });
      })
      .catch(() => {
        if (active) {
          setProfile(null);
        }
      });

    return () => {
      active = false;
    };
  }, [token, role]);

  const displayName = profile?.name || getRoleDisplayName(role);
  const displayEmail = profile?.email || 'platform@schools.in';
  
  // Extract initials dynamically
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || (role === 'owner' ? 'OW' : role === 'Admin' ? 'AD' : 'SB');

  return (
    <aside
      className={`flex flex-col fixed top-0 left-0 h-full z-30
        border-r transition-[width] duration-300 ease-in-out overflow-hidden
        bg-white dark:bg-[#13151f] border-slate-100 dark:border-[#2a2d3a] shadow-sm
        ${open ? 'w-[220px]' : 'w-[64px]'}`}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-slate-100 dark:border-[#2a2d3a] gap-3 flex-shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0 shadow-md shadow-blue-900/20">
          ERP
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${open ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}`}>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">SchoolSaaS</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">ERP Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {visibleNav.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              title={!open ? item.label : undefined}
              className={`relative flex items-center gap-3 h-10 px-4 mx-2 rounded-xl text-sm font-semibold
                transition-all duration-150 group mb-0.5
                ${isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'
                }`}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
              )}
              <span className={`flex-shrink-0 transition-colors
                ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-slate-400 dark:text-slate-300 group-hover:text-slate-650 dark:group-hover:text-slate-100'}`}>
                <Icon d={item.icon} className="w-[18px] h-[18px]" />
              </span>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300
                ${open ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: profile + dark toggle + logout */}
      <div className="border-t border-slate-100 dark:border-[#2a2d3a] p-3 space-y-1 flex-shrink-0">
        {/* owner profile */}
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ring-2 ring-blue-100 dark:ring-blue-900">
            {initials}
          </div>
          <div className={`overflow-hidden transition-all duration-300 flex-1 min-w-0 ${open ? 'opacity-100 max-w-[120px]' : 'opacity-0 max-w-0'}`}>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-none">{displayName}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{displayEmail}</p>
          </div>
          {open && <Icon d={ICONS.chevronRight} className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 group-hover:text-slate-600 dark:group-hover:text-slate-300" />}
        </div>

        {/* 🌙 Dark mode toggle — uses global ThemeContext */}
        <button
          onClick={toggleDark}
          title={!open ? (darkMode ? 'Switch to Light' : 'Switch to Dark') : undefined}
          className="flex items-center gap-2.5 w-full px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
        >
          <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-100 flex-shrink-0 group-hover:bg-slate-200 dark:group-hover:bg-white/15 transition-colors">
            <Icon d={darkMode ? ICONS.sun : ICONS.moon} className="w-4 h-4" />
          </span>
          <span className={`text-xs font-semibold text-slate-600 dark:text-slate-300 overflow-hidden transition-all duration-300 whitespace-nowrap flex-1 text-left
            ${open ? 'opacity-100 max-w-[120px]' : 'opacity-0 max-w-0'}`}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
          {open && (
            <div className={`flex-shrink-0 w-8 h-4 rounded-full transition-colors duration-300 relative ${darkMode ? 'bg-blue-600' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${darkMode ? 'left-4' : 'left-0.5'}`} />
            </div>
          )}
        </button>

        {/* Sign out */}
        <Link
          href="/login"
          onClick={signOut}
          title={!open ? 'Sign out' : undefined}
          className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
        >
          <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon d={ICONS.logout} className="w-4 h-4 text-slate-500 dark:text-slate-350 group-hover:text-red-600 dark:group-hover:text-red-300" />
          </span>
          <span className={`text-xs font-semibold overflow-hidden transition-all duration-300 whitespace-nowrap
            ${open ? 'opacity-100 max-w-[120px]' : 'opacity-0 max-w-0'}`}>
            Sign out
          </span>
        </Link>
      </div>
    </aside>
  );
}
