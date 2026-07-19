'use client';

import { useMemo, useState } from 'react';
import SchoolLayout from '@/components/school/SchoolLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { getRoleDisplayName } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';
import { useStats } from '@/hooks/useStats';
import { useUsers } from '@/hooks/useUsers';
import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url);

// ── SVG Chart Widgets ──────────────────────────────────────────────────────────

// 1. Attendance Chart
function AttendanceChart() {
  const pts = [91, 93, 92, 95, 94, 96, 95, 97, 96, 98, 97, 98, 97, 99];
  const w = 400, h = 140, max = 100, min = 80;
  const coords = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - ((p - min) / (max - min)) * (h - 20) - 10}`);
  const lineD = `M ${coords.join(' L ')}`;
  const areaD = `M 0,${h} L ${coords.join(' L ')} L ${w},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
      <defs>
        <linearGradient id="attGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--school-color, #10b981)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--school-color, #10b981)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#attGradient)" />
      <path d={lineD} fill="none" stroke="var(--school-color, #10b981)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => {
        const [x, y] = c.split(',');
        if (i % 2 === 0) return null;
        return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--school-color, #10b981)" stroke="white" strokeWidth="1" />;
      })}
    </svg>
  );
}

// 2. Revenue Chart
function RevenueChart() {
  const pts = [120, 150, 140, 185, 210, 195, 240];
  const w = 400, h = 145, max = 250, min = 100;
  const coords = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - ((p - min) / (max - min)) * (h - 20) - 10}`);
  const lineD = `M ${coords.join(' L ')}`;
  const areaD = `M 0,${h} L ${coords.join(' L ')} L ${w},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
      <defs>
        <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--school-color, #10b981)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--school-color, #10b981)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#revGradient)" />
      <path d={lineD} fill="none" stroke="var(--school-color, #10b981)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => {
        const [x, y] = c.split(',');
        return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--school-color, #10b981)" stroke="white" strokeWidth="1" />;
      })}
    </svg>
  );
}

// 3. Fee Collection Trend (Monthly collection vs Target)
function FeeTrendChart() {
  const maxVal = 100;
  const actuals = [65, 78, 85, 92, 88, 95];
  const target = 95;
  return (
    <div className="space-y-3.5 pt-2">
      {['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, idx) => {
        const pct = actuals[idx];
        return (
          <div key={month} className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span>{month}</span>
              <span className="text-slate-800 dark:text-white">{pct}% Colected</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ 
                  width: `${pct}%`, 
                  backgroundColor: 'var(--school-color, #10b981)' 
                }}
              />
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-sm"
                style={{ left: `${target}%` }}
                title={`Target: ${target}%`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 4. Student Growth Chart
function StudentGrowthChart() {
  const pts = [210, 240, 280, 310, 360, 395, 450];
  const w = 400, h = 145, max = 500, min = 150;
  const coords = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - ((p - min) / (max - min)) * (h - 20) - 10}`);
  const lineD = `M ${coords.join(' L ')}`;
  const areaD = `M 0,${h} L ${coords.join(' L ')} L ${w},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
      <defs>
        <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--school-color, #10b981)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--school-color, #10b981)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#growthGradient)" />
      <path d={lineD} fill="none" stroke="var(--school-color, #10b981)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => {
        const [x, y] = c.split(',');
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--school-color, #10b981)" stroke="white" strokeWidth="1" />;
      })}
    </svg>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────────
export default function SchoolDashboardPage() {
  const { role } = useAuth();
  
  // Real DB counts & users connection
  const { stats, isLoading: statsLoading } = useStats();
  const { users, isLoading: usersLoading } = useUsers(5);

  // Recent admissions — latest 5 students sorted by join date
  const { data: recentStudentsData, isLoading: studentsLoading } = useSWR(
    '/students?limit=5&page=1',
    fetcher,
    { revalidateOnFocus: false }
  );
  const recentStudents = recentStudentsData?.users || [];

  // Today's timetable slots — filter by current day name
  const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const { data: timetableData, isLoading: timetableLoading } = useSWR('/timetable', fetcher, {
    revalidateOnFocus: false,
  });
  const todaySlots = useMemo(() => {
    const all: any[] = timetableData || [];
    return all
      .filter((s: any) => s.dayOfWeek === todayName)
      .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
      .slice(0, 4);
  }, [timetableData, todayName]);

  const isLoading = statsLoading || usersLoading;

  if (isLoading || !stats) {
    return (
      <SchoolLayout title="School Dashboard" subtitle={`Welcome back, ${getRoleDisplayName(role)}!`}>
        <div className="p-10 flex justify-center">
          <p className="text-slate-505 dark:text-slate-400 font-semibold animate-pulse">Loading dashboard...</p>
        </div>
      </SchoolLayout>
    );
  }

  // Bind DB values + safe defaults
  const studentCount    = stats.totalStudents || 0;
  const teacherCount    = stats.totalTeachers || 0;
  const parentCount     = stats.totalParents ?? Math.floor(studentCount * 0.95);
  const newAdmissions   = stats.newAdmissions ?? 0;
  const activeBatches   = stats.activeBatches ?? 0;
  const pendingFeeCount = stats.pendingFeeStudents ?? 0;
  const totalEnquiries  = stats.totalEnquiries ?? 0;
  const enrolledEnq     = stats.enrolledEnquiries ?? 0;
  const conversionPct   = totalEnquiries > 0
    ? `${Math.round((enrolledEnq / totalEnquiries) * 100)}%`
    : '0%';

  // 1. Top Card Dataset — all dynamic
  const topCardsData = [
    { label: 'Students',       value: String(studentCount),  icon: '👨',    colorBg: 'bg-blue-500/10',   colorText: 'text-blue-600 dark:text-blue-400',    pct: '+4.2%' },
    { label: 'Teachers',       value: String(teacherCount),  icon: '👩',    colorBg: 'bg-emerald-500/10', colorText: 'text-emerald-600 dark:text-emerald-400', pct: '+2.1%' },
    { label: 'Parents',        value: String(parentCount),   icon: '👨‍👩‍👧',  colorBg: 'bg-purple-500/10',  colorText: 'text-purple-600 dark:text-purple-400',  pct: '+3.5%' },
    { label: 'Enquiries',      value: String(totalEnquiries),icon: '📋',    colorBg: 'bg-amber-500/10',  colorText: 'text-amber-600 dark:text-amber-400',    pct: conversionPct },
    { label: 'Pending Fees',   value: String(pendingFeeCount), icon: '💳', colorBg: 'bg-rose-500/10',   colorText: 'text-rose-600 dark:text-rose-400',      pct: pendingFeeCount > 0 ? '⚠️' : '✅' },
    { label: 'New Admissions', value: String(newAdmissions), icon: '🆕',   colorBg: 'bg-indigo-500/10', colorText: 'text-indigo-600 dark:text-indigo-400',  pct: 'This Month' },
    { label: 'Conversion',     value: conversionPct,         icon: '📈',   colorBg: 'bg-teal-500/10',   colorText: 'text-teal-600 dark:text-teal-400',      pct: `${enrolledEnq} enrolled` },
    { label: 'Active Batches', value: String(activeBatches), icon: '🎯',   colorBg: 'bg-orange-500/10', colorText: 'text-orange-600 dark:text-orange-400',  pct: 'Classes' },
  ];

  return (
    <SchoolLayout title="School Dashboard" subtitle={`Welcome back, ${getRoleDisplayName(role)}!`}>
      <div className="p-4 sm:p-6 space-y-6">

        {/* Date Filter */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-205 bg-white dark:bg-[#1a1d27] border border-slate-200 dark:border-[#2a2d3a] rounded-xl px-4 h-9 shadow-sm hover:border-slate-300 dark:hover:border-slate-605 transition-colors">
            <Icon d={ICONS.calendar} className="w-4 h-4 text-slate-400" />
            Today: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            <Icon d={ICONS.chevronDown} className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* ── 1. Top cards (Grid of 8 widgets) ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {topCardsData.map((c) => (
            <div key={c.label} className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl p-4.5 space-y-2 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xl leading-none">{c.icon}</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${c.colorBg} ${c.colorText}`}>
                  {c.pct}
                </span>
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{c.value}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate">{c.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── 2. Middle section (6 charts) ───────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* 2.1 Attendance Chart */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Attendance trend</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Average: 96% student presence</p>
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-lg">↑ 1.2%</span>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] text-slate-400 dark:text-slate-500 font-medium py-1">
                {['100%', '95%', '90%', '85%', '80%'].map(l => <span key={l}>{l}</span>)}
              </div>
              <div className="pl-8">
                <AttendanceChart />
                <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-medium px-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(l => <span key={l}>{l}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* 2.2 Revenue Chart */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-101 dark:border-[#2a2d3a] shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Revenue Chart</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Last 6 Months (in Thousands)</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg">₹4.24L Total</span>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] text-slate-400 dark:text-slate-500 font-medium py-1">
                {['250k', '200k', '150k', '100k', '50k'].map(l => <span key={l}>{l}</span>)}
              </div>
              <div className="pl-8">
                <RevenueChart />
                <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-medium px-2">
                  {['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map(l => <span key={l}>{l}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* 2.3 Admission Funnel */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Admission Funnel</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Conversion path this season</p>
            </div>
            <div className="space-y-2 mt-4">
              {[
                { stage: 'Enquiries', count: 180, pct: 100, color: 'bg-blue-500' },
                { stage: 'Registrations', count: 110, pct: 61, color: 'bg-indigo-500' },
                { stage: 'Interviews/Tests', count: 68, pct: 37, color: 'bg-purple-500' },
                { stage: 'Enrolled', count: 42, pct: 23, color: 'bg-green-600' },
              ].map(f => (
                <div key={f.stage} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-700 dark:text-slate-350">{f.stage}</span>
                    <span className="text-slate-500">{f.count} ({f.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-10/10 dark:bg-slate-800 h-3 rounded-xl overflow-hidden">
                    <div 
                      className={`h-full rounded-xl opacity-90 transition-all`} 
                      style={{ width: `${f.pct}%`, backgroundColor: 'var(--school-color, #10b981)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2.4 Batch Occupancy */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Batch Occupancy</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Coaching batch capacity distribution</p>
            </div>
            <div className="space-y-3.5 mt-4">
              {[
                { name: 'Grade 10 - Science (A)', count: 32, max: 40, fillPct: 80 },
                { name: 'Grade 11 - Commerce (B)', count: 22, max: 30, fillPct: 73 },
                { name: 'JEE Advanced Prep (T-1)', count: 43, max: 50, fillPct: 86 },
                { name: 'NEET Foundation (N-2)', count: 15, max: 30, fillPct: 50 },
              ].map(b => (
                <div key={b.name} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <span className="truncate max-w-[200px]">{b.name}</span>
                    <span>{b.count}/{b.max} ({b.fillPct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ 
                        width: `${b.fillPct}%`,
                        backgroundColor: b.fillPct > 80 ? 'var(--school-color, #10b981)' : '#f59e0b'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2.5 Fee Collection Trend */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Fee Collection Trend</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Target vs Actual Collections</p>
            </div>
            <FeeTrendChart />
          </div>

          {/* 2.6 Student Growth */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Student Growth</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Cumulative admissions scaling</p>
              </div>
              <span className="text-xs font-bold text-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-lg">+120 This Year</span>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] text-slate-400 dark:text-slate-500 font-medium py-1">
                {['500', '375', '250', '125', '0'].map(l => <span key={l}>{l}</span>)}
              </div>
              <div className="pl-8">
                <StudentGrowthChart />
                <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-medium px-2">
                  {['2020', '2021', '2022', '2023', '2024', '2025', '2026'].map(l => <span key={l}>{l}</span>)}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── 3. Bottom section (6 lists) ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* 3.1 Recent Admissions — DYNAMIC */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent Admissions</h4>
              <span className="text-[10px] font-bold text-green-700 bg-green-50 dark:bg-green-950/25 px-2 py-0.5 rounded-full">
                {recentStudents.length > 0 ? `${recentStudents.length} New` : 'New Enrolls'}
              </span>
            </div>

            {studentsLoading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 rounded bg-slate-100 dark:bg-slate-800 w-3/4" />
                      <div className="h-2 rounded bg-slate-50 dark:bg-slate-800/50 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentStudents.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs font-semibold text-slate-400">No student admissions yet</p>
                <p className="text-[10px] text-slate-350 mt-1">Add students from Student Management</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {recentStudents.map((student: any) => {
                  const initials = (student.name || '??')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  const admDate = student.createdAt
                    ? (() => {
                        const d = new Date(student.createdAt);
                        const today = new Date();
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        if (d.toDateString() === today.toDateString()) return 'Today';
                        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
                        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                      })()
                    : '—';

                  return (
                    <div key={student.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-green-100 dark:ring-green-950 flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[140px]">{student.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{student.className || student.settings?.className || 'No Class'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-semibold flex-shrink-0">{admDate}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3.2 Today's Classes — DYNAMIC */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Today's Classes</h4>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/25 px-2 py-0.5 rounded-full">
                {todayName}
              </span>
            </div>

            {timetableLoading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-16 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 rounded bg-slate-100 dark:bg-slate-800 w-2/3" />
                      <div className="h-2 rounded bg-slate-50 dark:bg-slate-700/30 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : todaySlots.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs font-semibold text-slate-400">No classes scheduled today</p>
                <p className="text-[10px] text-slate-350 mt-1">Configure periods in the Timetable module</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySlots.map((slot: any) => (
                  <div key={slot.id} className="flex gap-3.5 items-start p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <span className="text-[10px] font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-lg shrink-0 leading-tight text-center">
                      {slot.startTime}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{slot.subjectName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">Class {slot.className} | {slot.roomNumber}</p>
                      <p className="text-[9px] font-extrabold text-[var(--school-color,#10b981)] mt-0.5">{slot.teacherName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3.3 Upcoming Exams */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4.5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Upcoming Exams</h4>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/25 px-2 py-0.5 rounded-full">Exams Room</span>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Mathematics Midterm', meta: 'Grade 10-A | 100 Marks', date: '22 Jul' },
                { title: 'Biology Practical', meta: 'Grade 12-Sci | 50 Marks', date: '24 Jul' },
                { title: 'History Chapter 3 MCQ', meta: 'Grade 8-A | 25 Marks', date: '25 Jul' },
                { title: 'Accountancy Final', meta: 'Grade 12-Comm | 100 Marks', date: '28 Jul' },
              ].map((ex, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{ex.title}</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">{ex.meta}</p>
                  </div>
                  <div className="text-center bg-rose-50 dark:bg-rose-950/20 text-rose-600 px-2.5 py-1 rounded-xl shrink-0">
                    <p className="text-xs font-black leading-none">{ex.date.split(' ')[0]}</p>
                    <p className="text-[8px] font-bold uppercase mt-0.5">{ex.date.split(' ')[1]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3.4 Latest Payments */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4.5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Latest Payments</h4>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/25 px-2 py-0.5 rounded-full">Receipts</span>
            </div>
            <div className="space-y-3.5">
              {[
                { name: 'Rohit Sharma', amount: '₹15,000', transaction: 'UPI | UPS-38491', status: 'Paid' },
                { name: 'Shubman Gill', amount: '₹12,500', transaction: 'Card | REC-92810', status: 'Paid' },
                { name: 'Ishan Kishan', amount: '₹8,000', transaction: 'Cash | REC-99201', status: 'Paid' },
                { name: 'Hardik Pandya', amount: '₹22,000', transaction: 'UPI | UPS-11029', status: 'Paid' },
              ].map((p, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{p.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.transaction}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-slate-800 dark:text-white">{p.amount}</p>
                    <span className="inline-block mt-0.5 text-[9px] font-extrabold text-green-700 bg-green-50 dark:bg-green-950/45 px-2 py-0.2 rounded-md">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3.5 Recent Activities */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4.5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent Activities</h4>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">System Feeds</span>
            </div>
            <div className="space-y-3.5">
              {[
                { text: 'Attendance checked for Grade 10-A by Suresh', time: '5 mins ago', bg: 'bg-green-100 text-green-800' },
                { text: "Homework 'Ex C - Quadratic Equations' set in Maths", time: '30 mins ago', bg: 'bg-blue-100 text-blue-800' },
                { text: 'Marks entered for Chemistry Weekly Test (12-Sci)', time: '2 hrs ago', bg: 'bg-purple-100 text-purple-800' },
                { text: 'Transport route 4 delay notification broadcasted', time: '4 hrs ago', bg: 'bg-amber-100 text-amber-800' },
                { text: 'New admission form submitted by Aryan Patel', time: '1 day ago', bg: 'bg-indigo-100 text-indigo-800' },
              ].map((act, idx) => (
                <div key={idx} className="flex gap-3 hover:bg-slate-50 dark:hover:bg-white/5 p-2 rounded-xl transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0 mt-2" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-snug">{act.text}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3.6 Notifications */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4.5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Notifications</h4>
              <span className="text-[10px] font-bold text-red-650 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full">Urgent Alerts</span>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Low Inventory Warning', desc: "'Library Books' inventory is below 15% safety stock limit.", type: 'warning' },
                { title: 'Fee Gateway Maintenance', desc: 'UPI Gateway v2 maintenance at 11:00 PM tonight.', type: 'info' },
                { title: 'Staff on Leave', desc: '2 teachers reported absent. Substitutions required.', type: 'alert' },
                { title: 'Birthdays Today', desc: '4 students are celebrating birthdays today. Wish them!', type: 'success' },
              ].map((n, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-xl border ${
                    n.type === 'warning' 
                      ? 'bg-rose-50/50 border-rose-100 dark:bg-rose-950/10 dark:border-rose-950/30' 
                      : n.type === 'alert'
                      ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-950/10 dark:border-amber-950/30'
                      : n.type === 'success'
                      ? 'bg-green-50/50 border-green-100 dark:bg-green-950/10 dark:border-green-950/30'
                      : 'bg-blue-50/50 border-blue-105 dark:bg-blue-950/10 dark:border-blue-950/30'
                  }`}
                >
                  <p className="text-[11px] font-bold text-slate-850 dark:text-slate-200">{n.title}</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1 leading-snug">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </SchoolLayout>
  );
}
