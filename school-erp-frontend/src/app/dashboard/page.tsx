'use client';

import { useMemo } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { getRoleDisplayName } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';
import { useStats } from '@/hooks/useStats';
import { useSchools } from '@/hooks/useSchools';
import { useUsers } from '@/hooks/useUsers';

// ── mini charts ───────────────────────────────────────────────────────────────
function LineChart({ color }: { color: string }) {
  const pts = [20, 35, 28, 45, 38, 55, 48, 60, 52, 65, 58, 70, 65, 72];
  const w = 120, h = 48, max = Math.max(...pts), min = Math.min(...pts);
  const path = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - ((p - min) / (max - min)) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12">
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={path} />
    </svg>
  );
}

function BarChart() {
  const bars = [25, 35, 30, 50, 45, 55, 60, 75, 70, 80, 85, 90, 88, 95];
  const max = Math.max(...bars);
  return (
    <svg viewBox={`0 0 ${bars.length * 18} 100`} className="w-full h-28">
      {bars.map((b, i) => (
        <rect key={i} x={i * 18 + 2} y={100 - (b / max) * 100} width={14} height={(b / max) * 100} rx={3}
          fill="#818cf8" opacity={i >= bars.length - 4 ? 1 : 0.55} />
      ))}
    </svg>
  );
}

function RevenueChart() {
  const pts = [300, 450, 380, 520, 460, 580, 540, 600, 570, 620, 650, 680, 700, 720];
  const w = 400, h = 140, max = Math.max(...pts), min = Math.min(...pts);
  const coords = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - ((p - min) / (max - min)) * (h - 20) - 10}`);
  const lineD = `M ${coords.join(' L ')}`;
  const areaD = `M 0,${h} L ${coords.join(' L ')} L ${w},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#rg)" />
      <path d={lineD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => {
        const [x, y] = c.split(',');
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#6366f1" />;
      })}
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { role } = useAuth();
  
  // Use generic hooks
  const { stats, isLoading: statsLoading } = useStats();
  const { schools, isLoading: schoolsLoading } = useSchools();
  const { users, isLoading: usersLoading } = useUsers(10); // Fetch recent users for assignments

  const isLoading = statsLoading || schoolsLoading || usersLoading;

  if (isLoading || !stats) {
    return (
      <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${getRoleDisplayName(role)}!`}>
        <div className="p-10 flex justify-center">
          <p className="text-slate-500 font-semibold">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Derive top stat values
  const totalSchools = stats.totalSchools || 0;
  const activeSchools = stats.activeSchools || 0;
  const totalStudents = stats.totalStudents || 0;
  const totalTeachers = stats.totalTeachers || 0;
  const pendingUsers = stats.pendingUsers || 0;
  const inactiveUsers = stats.inactiveUsers || 0;

  const adjustedStats = [
    { label: 'Total Schools',  value: String(totalSchools),  change: '+12.5%', up: true,  bg: 'bg-indigo-50 dark:bg-indigo-950/40', color: 'text-indigo-600 dark:text-indigo-300', icon: ICONS.schools },
    { label: 'Active Schools', value: String(activeSchools), change: '+8.2%',  up: true,  bg: 'bg-green-50 dark:bg-green-950/40',  color: 'text-green-600 dark:text-green-300',  icon: ICONS.schools },
    { label: 'Teachers',       value: String(totalTeachers), change: '+10.8%', up: true,  bg: 'bg-purple-50 dark:bg-purple-950/40', color: 'text-purple-600 dark:text-purple-300', icon: ICONS.users },
    { label: 'Students',       value: String(totalStudents), change: '+15.3%', up: true,  bg: 'bg-blue-50 dark:bg-blue-950/40',   color: 'text-blue-600 dark:text-blue-300',   icon: ICONS.users },
    { label: 'Pending Users',  value: String(pendingUsers),  change: '+5.4%',  up: true,  bg: 'bg-orange-50 dark:bg-orange-950/40', color: 'text-orange-500 dark:text-orange-300', icon: ICONS.users },
    { label: 'Inactive Users', value: String(inactiveUsers), change: '+3.1%',  up: false, bg: 'bg-red-50 dark:bg-red-950/40',    color: 'text-red-500 dark:text-red-300',    icon: ICONS.users },
  ];

  // Map dynamic activities (already prepared in useStats)
  const { dynamicActivities } = stats;

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${getRoleDisplayName(role)}!`}>
      <div className="p-4 sm:p-6 space-y-5">

        {/* Date range */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-200 bg-white dark:bg-[#1a1d27] border border-slate-200 dark:border-[#2a2d3a] rounded-xl px-4 h-9 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <Icon d={ICONS.calendar} className="w-4 h-4 text-slate-400 dark:text-slate-300" />
            Last 7 Days
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
                <span className="text-[10px] text-slate-400 dark:text-slate-500">vs last 30 days</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">User Adoption Overview</h3>
              <button className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-[#2a2d3a] rounded-lg px-3 h-7 hover:bg-slate-50 dark:hover:bg-white/5">
                Last 30 Days <Icon d={ICONS.chevronDown} className="w-3 h-3" />
              </button>
            </div>
            <div className="mb-3">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{(totalStudents + totalTeachers).toLocaleString()}</span>
              <span className="ml-2 text-xs font-bold text-green-600">↑ 16.3%</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">vs last 30 days</span>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium py-1">
                {['50K','40K','30K','20K','10K','0'].map(l => <span key={l}>{l}</span>)}
              </div>
              <div className="pl-12">
                <RevenueChart />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  {['Apr 27','May 4','May 11','May 18','May 26'].map(l => <span key={l}>{l}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">School Growth</h3>
              <button className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-[#2a2d3a] rounded-lg px-3 h-7 hover:bg-slate-50 dark:hover:bg-white/5">
                Last 30 Days <Icon d={ICONS.chevronDown} className="w-3 h-3" />
              </button>
            </div>
            <div className="mb-3">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalSchools}</span>
              <span className="ml-2 text-xs font-bold text-green-600">↑ 14.2%</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">vs last 30 days</span>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium py-1">
                {['150','120','90','60','30','0'].map(l => <span key={l}>{l}</span>)}
              </div>
              <div className="pl-12">
                <BarChart />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  {['Apr 27','May 4','May 11','May 18','May 26'].map(l => <span key={l}>{l}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI mini-cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1">Monthly Active Users</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{(totalStudents * 0.8).toLocaleString()}</p>
            <span className="text-xs font-bold text-green-600">↑ 17.6%</span>
            <div className="mt-3"><LineChart color="#22c55e" /></div>
          </div>
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1">Pending User Approvals</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{pendingUsers}</p>
            <span className="text-xs font-bold text-red-500">↑ 6.2%</span>
            <div className="mt-3"><LineChart color="#f97316" /></div>
          </div>
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">Profile Completion</p>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-300">
                <Icon d={ICONS.users} className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">92% <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">avg</span></p>
            <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full w-[92%] rounded-full bg-blue-500" /></div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Almost perfect</p>
          </div>
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">Access Health</p>
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/40 flex items-center justify-center text-green-600 dark:text-green-300">
                <Icon d={ICONS.shield} className="w-4 h-4" />
              </div>
            </div>
            <p className="text-sm font-extrabold text-green-600 mt-3">{activeSchools === totalSchools ? 'All Systems Go' : 'Some issues'}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">{totalSchools > 0 ? Math.round((activeSchools/totalSchools)*100) : 0}% active</p>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Registrations */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5 overflow-y-auto max-h-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent School Registrations</h3>
              <button className="text-xs text-blue-600 font-semibold hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {schools.slice(0, 5).map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-300 flex-shrink-0">
                    <Icon d={ICONS.schools} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{s.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{s.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(s.createdAt || Date.now()).toLocaleDateString()}</p>
                    <span className={`inline-block mt-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${s.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300'}`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
              {schools.length === 0 && <p className="text-xs text-slate-400">No recent registrations</p>}
            </div>
          </div>

          {/* Assignments */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5 overflow-y-auto max-h-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent User Assignments</h3>
              <button className="text-xs text-blue-600 font-semibold hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {users.slice(0, 5).map((u: any, i: number) => {
                const school = schools.find((sch: any) => sch._id === u.schoolId || sch.code === u.schoolId);
                return (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center text-green-600 dark:text-green-300 flex-shrink-0">
                      <Icon d={ICONS.users} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{school ? school.name : 'Platform Admin'}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{u.role}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{u.name}</p>
                      <span className={`inline-block mt-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${u.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300'}`}>
                        {u.status || 'Active'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {users.length === 0 && <p className="text-xs text-slate-400">No recent users</p>}
            </div>
          </div>

          {/* Activities */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-5 overflow-y-auto max-h-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent Activities</h3>
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
    </DashboardLayout>
  );
}
