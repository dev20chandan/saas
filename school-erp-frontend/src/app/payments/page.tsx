'use client';

import React, { useMemo, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useTransactions, Transaction, TxnStatus, Method } from '@/hooks/useTransactions';
import { ICONS, Icon } from '@/components/dashboard/Sidebar';

const STATUS_STYLE: Record<TxnStatus, string> = {
  Successful: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  Pending:    'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
  Failed:     'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  Refunded:   'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300',
};

const METHOD_STYLE: Record<Method, string> = {
  'Credit Card':   'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
  'Bank Transfer': 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400',
  'UPI':           'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
  'PayPal':        'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400',
};

export default function PaymentsPage() {
  const { transactions, isLoading } = useTransactions();
  const [statusFilter, setStatusFilter] = useState<TxnStatus | 'All'>('All');
  const [methodFilter, setMethodFilter] = useState<Method | 'All'>('All');

  const stats = useMemo(() => {
    let revenue = 0, outstanding = 0, failed = 0, refunded = 0;
    transactions.forEach(t => {
      if (t.status === 'Successful') revenue += t.amount;
      if (t.status === 'Pending') outstanding += t.amount;
      if (t.status === 'Failed') failed += t.amount;
      if (t.status === 'Refunded') refunded += t.amount;
    });
    
    return {
      revenue: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(revenue),
      outstanding: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(outstanding),
      failed: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(failed),
      refunded: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(refunded),
    };
  }, [transactions]);

  const filteredTxns = useMemo(() => {
    let rows = transactions;
    if (statusFilter !== 'All') rows = rows.filter(t => t.status === statusFilter);
    if (methodFilter !== 'All') rows = rows.filter(t => t.method === methodFilter);
    return rows;
  }, [transactions, statusFilter, methodFilter]);

  const columns: Column<Transaction>[] = [
    { key: 'id', label: 'Txn ID', render: (val) => <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">{val}</span> },
    { key: 'schoolName', label: 'School', render: (val, row) => (
        <div className="flex flex-col">
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{val}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{row.schoolId}</p>
        </div>
      ) 
    },
    { key: 'amount', label: 'Amount', render: (val) => (
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)}
        </span>
      )
    },
    { key: 'date', label: 'Date', render: (val) => <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{val}</span> },
    { key: 'method', label: 'Method', render: (val) => (
        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm ${METHOD_STYLE[val as Method]}`}>{val}</span>
      )
    },
    { key: 'status', label: 'Status', render: (val) => (
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${val === 'Successful' ? 'bg-green-500' : val === 'Pending' ? 'bg-orange-400' : val === 'Failed' ? 'bg-red-500' : 'bg-slate-400'}`} />
          <span className={`text-[10px] font-extrabold ${STATUS_STYLE[val as TxnStatus].split(' ').filter((c: string) => c.startsWith('text-')).join(' ')}`}>{val}</span>
        </div>
      )
    },
    { key: 'invoiceId', label: 'Invoice', render: (val) => <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-medium hover:underline">{val}</span> },
  ];

  const renderExpandedRow = (row: Transaction) => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Description</p>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{row.description}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Payment Method</p>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{row.method} (via Gateway)</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Gateway Reference</p>
          <p className="text-xs font-mono text-slate-800 dark:text-slate-200 mt-0.5">pay_{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="h-8 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
          <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" className="w-3.5 h-3.5" />
          Download Receipt
        </button>
        <button className="h-8 px-4 border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-xs font-bold transition-colors">
          View Invoice
        </button>
        {row.status === 'Failed' && (
          <button className="h-8 px-4 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/60 rounded-lg text-xs font-bold transition-colors ml-auto">
            Retry Payment
          </button>
        )}
        {row.status === 'Successful' && (
          <button className="h-8 px-4 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-bold transition-colors ml-auto">
            Issue Refund
          </button>
        )}
      </div>
    </>
  );

  return (
    <DashboardLayout title="Payments" subtitle="Track all incoming transactions, invoices, and billing history">
      <div className="p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Revenue (YTD)" value={stats.revenue} dot="bg-green-500" color="text-slate-900 dark:text-white" variant="pills" />
          <StatCard label="Outstanding" value={stats.outstanding} dot="bg-orange-400" color="text-orange-600 dark:text-orange-400" variant="pills" />
          <StatCard label="Failed" value={stats.failed} dot="bg-red-500" color="text-red-600 dark:text-red-400" variant="pills" />
          <StatCard label="Refunded" value={stats.refunded} dot="bg-slate-500" color="text-slate-600 dark:text-slate-400" variant="pills" />
        </div>

        <DataTable<Transaction> 
          data={filteredTxns} 
          columns={columns} 
          loading={isLoading}
          searchPlaceholder="Search ID, Invoice, School..."
          emptyIcon={ICONS.payments}
          emptyMessage="No transactions found"
          renderExpandedRow={renderExpandedRow}
          filterSelectors={
            <div className="flex items-center gap-2">
              <select value={methodFilter} onChange={e => setMethodFilter(e.target.value as any)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option value="All">All Methods</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="PayPal">PayPal</option>
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option value="All">All Statuses</option>
                <option value="Successful">Successful</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          }
        />
      </div>
    </DashboardLayout>
  );
}
