import React from 'react';
import { Icon } from '@/components/dashboard/Sidebar';

export interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  isUp?: boolean;
  color: string;
  dot?: string;
  icon?: string;
  variant?: 'minimal' | 'pills'; // minimal for analytics, pills for payments
}

export function StatCard({ label, value, trend, isUp, color, dot, icon, variant = 'minimal' }: StatCardProps) {
  if (variant === 'pills') {
    return (
      <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-20 h-20 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-110 ${dot}`} />
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 dark:bg-white/5`}>
          <span className={`w-3 h-3 rounded-full shadow-sm ${dot}`} />
        </div>
        <div className="z-10">
          <p className={`text-2xl font-black tracking-tight ${color}`}>{value}</p>
          <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">{label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a1d27] rounded-2xl p-5 border border-slate-100 dark:border-[#2a2d3a] shadow-sm relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        {trend && (
          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isUp ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
            {icon && <Icon d={icon} className="w-2.5 h-2.5" />}
            {trend}
          </span>
        )}
      </div>
      <p className={`text-3xl font-black tracking-tight ${color}`}>{value}</p>
    </div>
  );
}
