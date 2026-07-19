'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { getRoleDisplayName } from '@/lib/auth';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  icon: string;
  href?: string;
  children?: NavChild[];
}

export const SCHOOL_NAV: NavItem[] = [
  { label: 'Dashboard',   icon: ICONS.dashboard, href: '/school/dashboard' },
  { 
    label: 'Academic',   
    icon: ICONS.schools,
    children: [
      { label: 'Student Management', href: '/school/students' },
      { label: 'Teacher Management', href: '/school/teachers' },
      { label: 'Parent Portal', href: '/school/parents' },
      { label: 'Batch / Class Management', href: '/school/classes' },
      { label: 'Subject Management', href: '/school/subjects' },
      { label: 'Timetable', href: '/school/timetable' },
      { label: 'Homework / Assignments', href: '/school/homework' },
      { label: 'Notes & Study Material (PDF, Video)', href: '/school/material' },
      { label: 'Online Tests / Mock Tests', href: '/school/tests' },
      { label: 'Result & Report Card', href: '/school/results' },
      { label: 'Certificates', href: '/school/certificates' },
    ]
  },
  { 
    label: 'Parent Features',   
    icon: ICONS.users,
    children: [
      { label: 'Attendance Notification', href: '/school/parents/attendance' },
      { label: 'Homework Notification', href: '/school/parents/homework' },
      { label: 'Fee Reminder', href: '/school/parents/fees' },
      { label: 'Exam Result', href: '/school/parents/results' },
      { label: 'Chat with Teacher', href: '/school/parents/chat' },
      { label: 'Leave Request', href: '/school/parents/leave' },
    ]
  },
  { 
    label: 'Teacher Portal',   
    icon: ICONS.user,
    children: [
      { label: 'Mark Attendance', href: '/school/teachers/attendance' },
      { label: 'Upload Homework', href: '/school/teachers/homework' },
      { label: 'Upload Notes', href: '/school/teachers/notes' },
      { label: 'Create Exam', href: '/school/teachers/exams' },
      { label: 'Enter Marks', href: '/school/teachers/marks' },
      { label: 'Student Performance Analytics', href: '/school/teachers/analytics' },
      { label: 'Leave Request', href: '/school/teachers/leave' },
    ]
  },
  { 
    label: 'AI Features',   
    icon: ICONS.ai,
    children: [
      { label: 'AI Homework Generator', href: '/school/ai/homework' },
      { label: 'AI Question Paper Generator', href: '/school/ai/questions' },
      { label: 'AI Report Card Summary', href: '/school/ai/report-card' },
      { label: 'AI Attendance Insights', href: '/school/ai/attendance' },
      { label: 'AI Fee Prediction', href: '/school/ai/fees' },
      { label: 'AI Student Performance Prediction', href: '/school/ai/performance' },
      { label: 'AI Chatbot for Parents', href: '/school/ai/chatbot' },
      { label: 'AI Doubt Solver', href: '/school/ai/doubts' },
    ]
  },
  { 
    label: 'Coaching Specific',   
    icon: ICONS.subscriptions,
    children: [
      { label: 'Batch Timing', href: '/school/coaching/batch-timing' },
      { label: 'Demo Classes', href: '/school/coaching/demo' },
      { label: 'Lead Management', href: '/school/coaching/leads' },
      { label: 'Admission Enquiry', href: '/school/coaching/enquiry' },
      { label: 'Counsellor CRM', href: '/school/coaching/crm' },
      { label: 'Follow-up Calls', href: '/school/coaching/followups' },
      { label: 'Course Management', href: '/school/coaching/courses' },
      { label: 'EMI Fees', href: '/school/coaching/emi' },
      { label: 'Batch Transfer', href: '/school/coaching/batch-transfer' },
      { label: 'Doubt Sessions', href: '/school/coaching/doubts' },
      { label: 'Recorded Lectures', href: '/school/coaching/recorded' },
      { label: 'Zoom/Google Meet Integration', href: '/school/coaching/meetings' },
    ]
  },
  { label: 'Attendance',  icon: ICONS.check,     href: '/school/attendance' },
  { 
    label: 'Fees & Finance',  
    icon: ICONS.payments,
    children: [
      { label: 'Fee Collection', href: '/school/fees' },
      { label: 'Expenses', href: '/school/expenses' },
      { label: 'Payroll', href: '/school/payroll' },
    ]
  },
  { 
    label: 'Calendar',   
    icon: ICONS.calendar,
    children: [
      { label: 'Holidays', href: '/school/calendar/holidays' },
      { label: 'Exams', href: '/school/calendar/exams' },
      { label: 'Events', href: '/school/calendar/events' },
      { label: 'Parent Meeting', href: '/school/calendar/parent-meetings' },
      { label: 'Teacher Meeting', href: '/school/calendar/teacher-meetings' },
    ]
  },
  { label: 'Communication', icon: ICONS.bell, href: '/school/communication' },
  { 
    label: 'Inventory',   
    icon: ICONS.analytics,
    children: [
      { label: 'Library', href: '/school/inventory/library' },
      { label: 'Books', href: '/school/inventory/books' },
      { label: 'Uniform', href: '/school/inventory/uniforms' },
      { label: 'Stationery', href: '/school/inventory/stationery' },
      { label: 'Hostel', href: '/school/inventory/hostel' },
      { label: 'Transport', href: '/school/inventory/transport' },
      { label: 'Bus Tracking', href: '/school/inventory/bus-tracking' },
    ]
  },
  { label: 'Reports',     icon: ICONS.analytics, href: '/school/reports' },
  { label: 'Settings',    icon: ICONS.settings,  href: '/school/settings' },
];

interface SchoolSidebarProps {
  open: boolean;
}

export default function SchoolSidebar({ open }: SchoolSidebarProps) {
  const pathname = usePathname();
  const { darkMode, toggleDark } = useTheme();
  const { token, role, signOut, isCoaching } = useAuth();
  
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    SCHOOL_NAV.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => pathname.startsWith(child.href));
        if (hasActiveChild) {
          setExpandedGroups((prev) => ({ ...prev, [item.label]: true }));
        }
      }
    });
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

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
      className={`flex flex-col fixed top-0 h-full z-30
        border-r transition-all duration-300 ease-in-out overflow-hidden
        bg-white dark:bg-[#13151f] border-green-100 dark:border-[#2a2d3a] shadow-sm
        md:left-0 md:translate-x-0
        ${open 
          ? 'w-[220px] left-0 translate-x-0' 
          : 'w-[220px] -translate-x-full left-[-220px] md:w-[64px] md:translate-x-0 md:left-0'}`}
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
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden space-y-0.5">
        {SCHOOL_NAV.filter(item => {
          if (item.label === 'Coaching Specific' && !isCoaching) return false;
          return true;
        }).map((item) => {
          if (item.children) {
            const hasActiveChild = item.children.some(child => pathname.startsWith(child.href));
            const isExpanded = !!expandedGroups[item.label];

            return (
              <div key={item.label} className="flex flex-col">
                <button
                  onClick={() => toggleGroup(item.label)}
                  title={!open ? item.label : undefined}
                  className={`relative flex items-center justify-between h-9 px-4 mx-2 rounded-xl text-xs font-semibold
                    transition-all duration-150 group
                    ${hasActiveChild
                      ? 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'
                    }`}
                >
                  {hasActiveChild && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-green-600 rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3">
                    <span className={`flex-shrink-0 transition-colors
                      ${hasActiveChild ? 'text-green-600 dark:text-green-300' : 'text-slate-400 dark:text-slate-300 group-hover:text-slate-650 dark:group-hover:text-slate-100'}`}>
                      <Icon d={item.icon} className="w-4 h-4" />
                    </span>
                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300
                      ${open ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}`}>
                      {item.label}
                    </span>
                  </div>
                  {open && (
                    <span className={`text-slate-400 group-hover:text-slate-650 dark:group-hover:text-slate-100 transition-transform duration-200
                      ${isExpanded ? 'rotate-180' : ''}`}>
                      <Icon d={ICONS.chevronDown} className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>

                {isExpanded && open && (
                  <div className="mt-0.5 ml-6 pl-3 border-l border-green-100 dark:border-[#2a2d3a] flex flex-col gap-0.5">
                    {item.children.map((child) => {
                      const isChildActive = pathname.startsWith(child.href);
                      return (
                        <Link
                          key={child.label}
                          href={child.href}
                          className={`flex items-center min-h-8 py-1 px-3 rounded-lg text-[11px] font-semibold transition-all duration-150
                            ${isChildActive
                              ? 'text-green-700 dark:text-green-400 bg-green-50/50 dark:bg-green-950/20'
                              : 'text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-white'
                            }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname.startsWith(item.href || '');
          return (
            <Link
              key={item.label}
              href={item.href || '#'}
              title={!open ? item.label : undefined}
              className={`relative flex items-center gap-3 h-9 px-4 mx-2 rounded-xl text-xs font-semibold
                transition-all duration-150 group
                ${isActive
                  ? 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'
                }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-green-600 rounded-r-full" />
              )}
              <span className={`flex-shrink-0 transition-colors
                ${isActive ? 'text-green-600 dark:text-green-300' : 'text-slate-400 dark:text-slate-300 group-hover:text-slate-650 dark:group-hover:text-slate-100'}`}>
                <Icon d={item.icon} className="w-4 h-4" />
              </span>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300
                ${open ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
        {/* Scroll Spacer to prevent overlap of expanded sub-menus behind bottom profile card */}
        <div className="h-20" />
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
