'use client';

import { useMemo } from 'react';
import SchoolLayout from '@/components/school/SchoolLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { getRoleDisplayName } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';
import { useStats } from '@/hooks/useStats';
import { useUsers } from '@/hooks/useUsers';

// ── mini charts ───────────────────────────────────────────────────────────────
function LineChart({ color }: { color: string }) {
  const pts = [85, 88, 84, 90, 92, 89, 94, 95, 91, 96, 95, 98, 97, 99];
  const w = 120, h = 48, max = 100, min = 70;
  const path = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - ((p - min) / (max - min)) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12">
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={path} />
    </svg>
  );
}

function BarChart() {
  const bars = [80, 85, 90, 75, 85, 95, 85, 90, 80, 85, 90, 95];
  const max = 100;
  return (
    <svg viewBox={`0 0 ${bars.length * 18} 100`} className="w-full h-28">
      {bars.map((b, i) => (
        <rect key={i} x={i * 18 + 2} y={100 - (b / max) * 100} width={14} height={(b / max) * 100} rx={3}
          fill="#10b981" opacity={i >= bars.length - 3 ? 1 : 0.55} />
      ))}
    </svg>
  );
}

function AttendanceChart() {
  const pts = [90, 92, 91, 94, 93, 95, 94, 96, 95, 97, 96, 98, 97, 98];
  const w = 400, h = 140, max = 100, min = 80;
  const coords = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - ((p - min) / (max - min)) * (h - 20) - 10}`);
  const lineD = `M ${coords.join(' L ')}`;
  const areaD = `M 0,${h} L ${coords.join(' L ')} L ${w},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
      <defs>
        <linearGradient id="rgGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#rgGreen)" />
      <path d={lineD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => {
        const [x, y] = c.split(',');
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#10b981" />;
      })}
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SchoolDashboardPage() {
  const { role } = useAuth();

  // Fetch school specific stats
  const { stats, isLoading: statsLoading } = useStats();
  const { users, isLoading: usersLoading } = useUsers(10); 

  const isLoading = statsLoading || usersLoading;

  if (isLoading || !stats) {
    return (
      <SchoolLayout title="School Dashboard" subtitle={`Welcome back, ${getRoleDisplayName(role)}!`}>
        <div className="p-10 flex justify-center">
          <p className="text-slate-500 font-semibold">Loading dashboard...</p>
        </div>
      </SchoolLayout>
    );
  }

  // Derive top stat values for School
  const totalStudents = stats.totalStudents || 0;
  const totalTeachers = stats.totalTeachers || 0;
  const totalParents = Math.floor(totalStudents * 0.4); 
  const totalClasses = Math.ceil(totalStudents / 30); 
  const attendanceToday = 96; 
  const feeCollected = 85; 

  const adjustedStats = [
    { label: 'Total Students', value: String(totalStudents), change: '+5.2%', up: true, bg: 'bg-blue-50 dark:bg-blue-950/40', color: 'text-blue-600 dark:text-blue-300', icon: ICONS.users },
    { label: 'Total Teachers', value: String(totalTeachers), change: '+2.0%', up: true, bg: 'bg-emerald-50 dark:bg-emerald-950/40', color: 'text-emerald-600 dark:text-emerald-300', icon: ICONS.users },
    { label: 'Total Parents', value: String(totalParents), change: '+4.5%', up: true, bg: 'bg-purple-50 dark:bg-purple-950/40', color: 'text-purple-600 dark:text-purple-300', icon: ICONS.users },
    { label: 'Active Classes', value: String(totalClasses), change: '0%', up: true, bg: 'bg-orange-50 dark:bg-orange-950/40', color: 'text-orange-500 dark:text-orange-300', icon: ICONS.dashboard },
    { label: 'Attendance', value: `${attendanceToday}%`, change: '+1.1%', up: true, bg: 'bg-green-50 dark:bg-green-950/40', color: 'text-green-500 dark:text-green-300', icon: ICONS.check },
    { label: 'Fee Collection', value: `${feeCollected}%`, change: '-2.1%', up: false, bg: 'bg-red-50 dark:bg-red-950/40', color: 'text-red-500 dark:text-red-300', icon: ICONS.payments },
  ];

  const { dynamicActivities } = stats;

  return (
    <SchoolLayout title="School Dashboard" subtitle={`Welcome back, ${getRoleDisplayName(role)}!`}>
      <div className="p-4 sm:p-6 space-y-5">

        {/* Date range */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-200 bg-white dark:bg-[#1a1d27] border border-slate-200 dark:border-[#2a2d3a] rounded-xl px-4 h-9 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <Icon d={ICONS.calendar} className="w-4 h-4 text-slate-400 dark:text-slate-300" />
            Today
            <Icon d={ICONS.chevronDown} className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300" />
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {adjustedStats.map((s) => (
            <div key={s.label} className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-4 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-300">{s.label}</p>
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon d={s.icon} className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
              <div className="flex items-center gap-1">
                <svg className={`w-3 h-3 ${s.up ? 'text-green-500' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.up ? ICONS.arrowUp : ICONS.arrowDown} />
                </svg>
                <span className={`text-[11px] font-bold ${s.up ? 'text-green-600' : 'text-red-500'}`}>{s.change}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">vs last week</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Overall Attendance Trend</h3>
              <button className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-[#2a2d3a] rounded-lg px-3 h-7 hover:bg-slate-50 dark:hover:bg-white/5">
                Last 30 Days <Icon d={ICONS.chevronDown} className="w-3 h-3" />
              </button>
            </div>
            <div className="mb-3">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{attendanceToday}%</span>
              <span className="ml-2 text-xs font-bold text-green-600">↑ 1.2%</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">vs last 30 days</span>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium py-1">
                {['100%', '95%', '90%', '85%', '80%'].map(l => <span key={l}>{l}</span>)}
              </div>
              <div className="pl-10">
                <AttendanceChart />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(l => <span key={l}>{l}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Fee Collection Target</h3>
              <button className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-[#2a2d3a] rounded-lg px-3 h-7 hover:bg-slate-50 dark:hover:bg-white/5">
                This Month <Icon d={ICONS.chevronDown} className="w-3 h-3" />
              </button>
            </div>
            <div className="mb-3">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{feeCollected}%</span>
              <span className="ml-2 text-xs font-bold text-green-600">On Track</span>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium py-1">
                {['100%', '75%', '50%', '25%', '0%'].map(l => <span key={l}>{l}</span>)}
              </div>
              <div className="pl-10">
                <BarChart />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(l => <span key={l}>{l}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Users in School */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5 overflow-y-auto max-h-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent Users / Staff</h3>
              <button className="text-xs text-blue-600 font-semibold hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {users.slice(0, 5).map((u: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0">
                    <Icon d={ICONS.users} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{u.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{u.role}</p>
                    <span className={`inline-block mt-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${u.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300'}`}>
                      {u.status || 'Active'}
                    </span>
                  </div>
                </div>
              ))}
              {users.length === 0 && <p className="text-xs text-slate-400">No recent users</p>}
            </div>
          </div>

          {/* Activities */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5 overflow-y-auto max-h-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent School Activities</h3>
              <button className="text-xs text-blue-600 font-semibold hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {dynamicActivities.map((a: any, i: number) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className={`w-7 h-7 rounded-lg ${a.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon d={a.icon} className={`w-3.5 h-3.5 ${a.color}`} />
                  </div>
                  <p className="flex-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-snug">{a.desc}</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0 whitespace-nowrap">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </SchoolLayout>
  );
}
