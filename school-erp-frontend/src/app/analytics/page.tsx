'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { api } from '@/lib/api';

// ── Mock Data ─────────────────────────────────────────────────────────────────
const REVENUE_DATA = [
  { month: 'Jan', value: 450000, height: '40%' },
  { month: 'Feb', value: 520000, height: '48%' },
  { month: 'Mar', value: 610000, height: '55%' },
  { month: 'Apr', value: 590000, height: '52%' },
  { month: 'May', value: 780000, height: '75%' },
  { month: 'Jun', value: 890000, height: '85%' },
  { month: 'Jul', value: 950000, height: '92%' },
];



export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/stats/dashboard');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to load analytics', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !stats) {
    return (
      <DashboardLayout title="Analytics & Overview" subtitle="High-level insights into platform performance and revenue">
        <div className="p-10 flex justify-center">
          <p className="text-slate-500 font-semibold">Loading analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  const studentsCount = stats.totalStudents || 0;
  const teachersCount = stats.totalTeachers || 0;
  const adminCount = stats.counters?.schoolAdmins || 0;
  const parentsCount = Math.floor(studentsCount * 0.4); 
  const totalUsers = studentsCount + teachersCount + adminCount + parentsCount;

  const dynamicUserDistribution = [
    { role: 'Students', count: studentsCount, percent: totalUsers ? Math.round((studentsCount/totalUsers)*100) : 0, color: 'bg-blue-500' },
    { role: 'Parents',  count: parentsCount,  percent: totalUsers ? Math.round((parentsCount/totalUsers)*100) : 0, color: 'bg-purple-500' },
    { role: 'Teachers', count: teachersCount, percent: totalUsers ? Math.round((teachersCount/totalUsers)*100) : 0, color: 'bg-emerald-500' },
    { role: 'Admins',   count: adminCount,    percent: totalUsers ? Math.round((adminCount/totalUsers)*100) : 0, color: 'bg-orange-500' },
  ];

  let dynamicActivities = (stats.recentActivities || []).map((act: any, i: number) => ({
    id: i + 1,
    title: act.type,
    desc: act.text,
    time: new Date(act.time).toLocaleString(),
    icon: ICONS.schools,
    color: `text-${act.color}-500`,
    bg: `bg-${act.color}-100 dark:bg-${act.color}-500/20`
  }));

  if (dynamicActivities.length === 0) {
    dynamicActivities = [
      { id: 1, title: 'No recent activity', desc: 'System is running smoothly.', time: '-', icon: ICONS.schools, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' }
    ];
  }

  return (
    <DashboardLayout title="Analytics & Overview" subtitle="High-level insights into platform performance and revenue">
      <div className="p-4 sm:p-6 space-y-6">

        {/* ── Top Overview Metrics ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Monthly Active Users', value: (stats.monthlyActiveUsers || 0).toLocaleString(), trend: '+12.5%', isUp: true, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Total Revenue (YTD)', value: '₹4.8M', trend: '+24.8%', isUp: true, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Schools Onboarded', value: stats.totalSchools || '0', trend: '+4', isUp: true, color: 'text-purple-600 dark:text-purple-400' },
            { label: 'System Uptime', value: '99.98%', trend: '-0.01%', isUp: false, color: 'text-slate-600 dark:text-slate-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-[#1a1d27] rounded-2xl p-5 border border-slate-100 dark:border-[#2a2d3a] shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${stat.isUp ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                  <Icon d={stat.isUp ? ICONS.arrowUp : ICONS.arrowDown} className="w-2.5 h-2.5" />
                  {stat.trend}
                </span>
              </div>
              <p className={`text-3xl font-black tracking-tight ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ── Revenue Growth Chart (Pure CSS) ── */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Revenue Growth</h3>
                <p className="text-xs text-slate-500 mt-1">Monthly recurring revenue (MRR) for the last 7 months</p>
              </div>
              <select className="text-xs font-bold bg-slate-50 dark:bg-[#1a1d27] border border-slate-200 dark:border-[#2a2d3a] rounded-lg px-3 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none">
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>
            
            <div className="flex-1 relative min-h-[250px] flex items-end gap-2 sm:gap-6 pt-10 border-b border-slate-200 dark:border-slate-800">
              {/* Grid lines (Background) */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full border-t border-dashed border-slate-200 dark:border-[#2a2d3a] h-0" />
                ))}
              </div>
              
              {/* Bars */}
              {REVENUE_DATA.map((data, i) => (
                <div key={i} className="relative flex-1 flex flex-col items-center justify-end h-full group pb-1 z-10">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg pointer-events-none whitespace-nowrap shadow-xl">
                    ₹{data.value.toLocaleString()}
                  </div>
                  {/* Bar */}
                  <div 
                    className="w-full max-w-[40px] bg-gradient-to-t from-blue-500 to-cyan-400 dark:from-blue-600 dark:to-cyan-400 rounded-t-lg transition-all duration-700 ease-out group-hover:brightness-110 shadow-[0_0_15px_rgba(56,189,248,0.2)]" 
                    style={{ height: data.height }}
                  />
                  {/* X-Axis Label */}
                  <span className="absolute -bottom-6 text-[10px] font-bold text-slate-500">{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Side Panel (User Distribution & Activity) ── */}
          <div className="space-y-6">
            
            {/* User Distribution */}
            <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">User Distribution</h3>
              <div className="space-y-5">
                {dynamicUserDistribution.map(u => (
                  <div key={u.role}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-700 dark:text-slate-300">{u.role}</span>
                      <span className="text-slate-500">{u.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className={`h-2 rounded-full ${u.color} transition-all duration-1000`} style={{ width: `${u.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {dynamicActivities.map((activity: any, i: number) => (
                  <div key={activity.id} className="flex gap-4 relative">
                    {i !== dynamicActivities.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-[1px] bg-slate-200 dark:bg-[#2a2d3a] -ml-px" />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${activity.bg}`}>
                      <Icon d={activity.icon} className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="pb-4">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-200">{activity.title}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{activity.desc}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
