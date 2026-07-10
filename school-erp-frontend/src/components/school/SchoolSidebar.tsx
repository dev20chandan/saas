'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { getRoleDisplayName } from '@/lib/auth';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';

export const SCHOOL_NAV = [
  { label: 'Dashboard',   icon: ICONS.dashboard, href: '/school/dashboard' },
  { label: 'Students',    icon: ICONS.users,     href: '/school/students' },
  { label: 'Teachers',    icon: ICONS.user,      href: '/school/teachers' },
  { label: 'Classes',     icon: ICONS.schools,   href: '/school/classes' },
  { label: 'Attendance',  icon: ICONS.check,     href: '/school/attendance' },
  { label: 'Fees',        icon: ICONS.payments,  href: '/school/fees' },
  { label: 'Settings',    icon: ICONS.settings,  href: '/school/settings' },
];

interface SchoolSidebarProps {
  open: boolean;
}

export default function SchoolSidebar({ open }: SchoolSidebarProps) {
  const pathname = usePathname();
  const { darkMode, toggleDark } = useTheme();
  const { token, role, signOut } = useAuth();
  
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
        if (!active || !res) return;
        setProfile({
          name: res.name || getRoleDisplayName(role),
          email: res.email || 'school@portal.in',
        });
      })
      .catch(() => {
        if (active) setProfile(null);
      });

    return () => {
      active = false;
    };
  }, [token, role]);

  const displayName = profile?.name || getRoleDisplayName(role);
  const displayEmail = profile?.email || 'school@portal.in';
  
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'SC';

  return (
    <aside
      className={`flex flex-col fixed top-0 left-0 h-full z-30
        border-r transition-[width] duration-300 ease-in-out overflow-hidden
        bg-white dark:bg-[#13151f] border-green-100 dark:border-[#2a2d3a] shadow-sm
        ${open ? 'w-[220px]' : 'w-[64px]'}`}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-green-100 dark:border-[#2a2d3a] gap-3 flex-shrink-0">
        <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0 shadow-md shadow-green-900/20">
          ERP
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${open ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}`}>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">School Portal</p>
          <p className="text-[10px] text-green-600 dark:text-green-500 font-medium whitespace-nowrap">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {SCHOOL_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              title={!open ? item.label : undefined}
              className={`relative flex items-center gap-3 h-10 px-4 mx-2 rounded-xl text-sm font-semibold
                transition-all duration-150 group mb-0.5
                ${isActive
                  ? 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'
                }`}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-green-600 rounded-r-full" />
              )}
              <span className={`flex-shrink-0 transition-colors
                ${isActive ? 'text-green-600 dark:text-green-300' : 'text-slate-400 dark:text-slate-300 group-hover:text-slate-650 dark:group-hover:text-slate-100'}`}>
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
      <div className="border-t border-green-100 dark:border-[#2a2d3a] p-3 space-y-1 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ring-2 ring-green-100 dark:ring-green-900">
            {initials}
          </div>
          <div className={`overflow-hidden transition-all duration-300 flex-1 min-w-0 ${open ? 'opacity-100 max-w-[120px]' : 'opacity-0 max-w-0'}`}>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-none">{displayName}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{displayEmail}</p>
          </div>
        </div>

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
            <div className={`flex-shrink-0 w-8 h-4 rounded-full transition-colors duration-300 relative ${darkMode ? 'bg-green-600' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${darkMode ? 'left-4' : 'left-0.5'}`} />
            </div>
          )}
        </button>

        <Link
          href="/school-login"
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
