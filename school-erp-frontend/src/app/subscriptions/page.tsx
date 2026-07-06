'use client';

import React, { useMemo, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useSubscriptions, Subscription, Status, Plan } from '@/hooks/useSubscriptions';
import { ICONS, Icon } from '@/components/dashboard/Sidebar';

const STATUS_STYLE: Record<Status, string> = {
  Active:    'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  Trialling: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
  'Past Due':'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  Canceled:  'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300',
};

const PLAN_STYLE: Record<Plan, string> = {
  Basic:      'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300',
  Standard:   'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
  Premium:    'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
  Enterprise: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400',
};

export default function SubscriptionsPage() {
  const { subscriptions, isLoading } = useSubscriptions();
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [planFilter, setPlanFilter] = useState<Plan | 'All'>('All');

  const stats = useMemo(() => {
    let active = 0, mrr = 0, pastDue = 0, churn = 0;
    subscriptions.forEach(s => {
      if (s.status === 'Active' || s.status === 'Trialling') {
        active++;
        mrr += s.amount;
      }
      if (s.status === 'Past Due') pastDue++;
      if (s.status === 'Canceled') churn++;
    });
    return {
      active,
      mrr: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(mrr),
      pastDue,
      churn
    };
  }, [subscriptions]);

  const filteredSubs = useMemo(() => {
    let rows = subscriptions;
    if (statusFilter !== 'All') rows = rows.filter(s => s.status === statusFilter);
    if (planFilter !== 'All') rows = rows.filter(s => s.plan === planFilter);
    return rows;
  }, [subscriptions, statusFilter, planFilter]);

  const columns: Column<Subscription>[] = [
    { key: 'id', label: 'Sub ID', render: (val) => <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">{val}</span> },
    { key: 'schoolName', label: 'School', render: (val, row) => (
        <div className="flex flex-col">
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{val}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{row.schoolId}</p>
        </div>
      ) 
    },
    { key: 'plan', label: 'Plan', render: (val) => (
        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm ${PLAN_STYLE[val as Plan]}`}>{val}</span>
      )
    },
    { key: 'amount', label: 'Amount', render: (val, row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)}
          </span>
          <span className="text-[9px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">{row.cycle}</span>
        </div>
      )
    },
    { key: 'status', label: 'Status', render: (val) => (
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${val === 'Active' ? 'bg-green-500' : val === 'Trialling' ? 'bg-orange-400' : val === 'Past Due' ? 'bg-red-500' : 'bg-slate-400'}`} />
          <span className={`text-[10px] font-extrabold ${STATUS_STYLE[val as Status].split(' ').filter((c: string) => c.startsWith('text-')).join(' ')}`}>{val}</span>
        </div>
      )
    },
    { key: 'lastPayment', label: 'Last Payment', render: (val) => <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{val}</span> },
    { key: 'nextBilling', label: 'Next Billing', render: (val) => <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{val}</span> },
  ];

  const renderExpandedRow = (row: Subscription) => (
    <div className="flex items-center justify-end gap-3">
      <button className="h-8 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors">Manage Plan</button>
      <button className="h-8 px-4 border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-xs font-bold transition-colors">View Invoices</button>
      {(row.status === 'Active' || row.status === 'Trialling') && (
        <button className="h-8 px-4 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-bold transition-colors ml-auto">Cancel Sub</button>
      )}
    </div>
  );

  return (
    <DashboardLayout title="Subscriptions" subtitle="Manage billing plans, upcoming renewals, and subscription statuses">
      <div className="p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Active Subs" value={stats.active} dot="bg-green-500" color="text-slate-900 dark:text-white" variant="pills" />
          <StatCard label="Monthly Rev (MRR)" value={stats.mrr} dot="bg-blue-500" color="text-slate-900 dark:text-white" variant="pills" />
          <StatCard label="Past Due" value={stats.pastDue} dot="bg-red-500" color="text-red-600 dark:text-red-400" variant="pills" />
          <StatCard label="Churn (Canceled)" value={stats.churn} dot="bg-slate-500" color="text-slate-600 dark:text-slate-400" variant="pills" />
        </div>

        <DataTable<Subscription> 
          data={filteredSubs} 
          columns={columns} 
          loading={isLoading}
          searchPlaceholder="Search ID, School, Plan..."
          emptyIcon={ICONS.subscriptions}
          emptyMessage="No subscriptions found"
          renderExpandedRow={renderExpandedRow}
          filterSelectors={
            <div className="flex items-center gap-2">
              <select value={planFilter} onChange={e => setPlanFilter(e.target.value as any)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option value="All">All Plans</option>
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="Enterprise">Enterprise</option>
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Trialling">Trialling</option>
                <option value="Past Due">Past Due</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
          }
        />
      </div>
    </DashboardLayout>
  );
}
