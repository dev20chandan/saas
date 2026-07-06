'use client';

import React, { useState, useMemo, Fragment } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { api } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────
type Plan   = 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
type Status = 'Active' | 'Past Due' | 'Canceled' | 'Trialling';
type Cycle  = 'Monthly' | 'Annual';

interface Subscription {
  id:           string;
  schoolName:   string;
  schoolId:     string;
  plan:         Plan;
  cycle:        Cycle;
  amount:       number;
  status:       Status;
  lastPayment:  string;
  nextBilling:  string;
}


// ── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<Status, string> = {
  Active:    'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  Trialling: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
  'Past Due':'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
  Canceled:  'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
};

const PLAN_STYLE: Record<Plan, string> = {
  Basic:      'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300',
  Standard:   'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400',
  Premium:    'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
  Enterprise: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
};

const PAGE_SIZE = 8;

export default function SubscriptionsPage() {
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<Status | 'All'>('All');
  const [planFilter, setPlan]       = useState<Plan | 'All'>('All');
  const [page, setPage]             = useState(1);
  const [sortCol, setSortCol]       = useState<keyof Subscription>('schoolName');
  const [sortDir, setSortDir]       = useState<'asc' | 'desc'>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function loadSubs() {
      try {
        const res = await api.get('/schools?limit=1000');
        const schools = res.data || [];
        const mappedSubs: Subscription[] = schools.map((sch: any) => {
          let planAmount = 4999;
          if (sch.plan === 'Standard') planAmount = 9999;
          if (sch.plan === 'Premium') planAmount = 19999;
          if (sch.plan === 'Enterprise') planAmount = 49999;

          let frontendStatus: Status = 'Active';
          if (sch.status === 'Trial') frontendStatus = 'Trialling';
          if (sch.status === 'Expired') frontendStatus = 'Past Due';
          if (sch.status === 'Suspended') frontendStatus = 'Canceled';

          return {
            id: sch._id,
            schoolName: sch.name,
            schoolId: sch.code,
            plan: (sch.plan as Plan) || 'Basic',
            cycle: 'Monthly',
            amount: planAmount,
            status: frontendStatus,
            lastPayment: '-',
            nextBilling: '-',
          };
        });
        setSubs(mappedSubs);
      } catch (error) {
        console.error('Failed to load subscriptions:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSubs();
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let mrr = 0;
    let active = 0;
    let pastDue = 0;
    let paidSchools = 0;

    subs.forEach(s => {
      if (s.status === 'Active') {
        active++;
        paidSchools++;
        mrr += s.cycle === 'Annual' ? s.amount / 12 : s.amount;
      }
      if (s.status === 'Past Due') {
        pastDue++;
        paidSchools++; // Assuming they are on a paid plan even if past due
      }
      if (s.status === 'Trialling') {
        // typically 0 MRR
      }
    });
    
    return {
      mrr: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(mrr),
      active,
      pastDue,
      paidSchools,
    };
  }, [subs]);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...subs];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(s =>
        s.schoolName.toLowerCase().includes(q) || s.schoolId.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') rows = rows.filter(s => s.status === statusFilter);
    if (planFilter   !== 'All') rows = rows.filter(s => s.plan   === planFilter);
    rows.sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [search, statusFilter, planFilter, sortCol, sortDir, subs]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(col: keyof Subscription) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  }

  function SortIcon({ col }: { col: keyof Subscription }) {
    if (sortCol !== col) return <Icon d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" className="w-3 h-3 text-slate-300 dark:text-slate-600" />;
    return <Icon d={sortDir === 'asc' ? ICONS.arrowUp : ICONS.arrowDown} className="w-3 h-3 text-blue-500" />;
  }

  return (
    <DashboardLayout title="Subscriptions" subtitle="Manage school plans, billing, and recurring payments">
      <div className="p-4 sm:p-6 space-y-5">

        {/* ── Stat pills ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total MRR',          value: stats.mrr,         color: 'text-slate-900 dark:text-white',           dot: 'bg-emerald-500' },
            { label: 'Active Subs',        value: stats.active,      color: 'text-green-700 dark:text-green-400',        dot: 'bg-green-500' },
            { label: 'Past Due / Failed',  value: stats.pastDue,     color: 'text-orange-600 dark:text-orange-400',      dot: 'bg-orange-500' },
            { label: 'Paid Schools',       value: stats.paidSchools, color: 'text-blue-700 dark:text-blue-400',          dot: 'bg-blue-500' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-20 h-20 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-110 ${s.dot}`} />
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 dark:bg-white/5`}>
                <span className={`w-3 h-3 rounded-full shadow-sm ${s.dot}`} />
              </div>
              <div className="z-10">
                <p className={`text-2xl font-black tracking-tight ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table card ── */}
        <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm overflow-hidden flex flex-col">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 dark:border-[#2a2d3a] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#1a1d27]/50">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Icon d={ICONS.search} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search subscriptions..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full sm:w-64 h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-700 dark:text-slate-200 placeholder-slate-400" />
              </div>
              <div className="flex items-center gap-2">
                <select value={planFilter} onChange={e => { setPlan(e.target.value as any); setPage(1); }}
                  className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer appearance-none pr-8 relative">
                  <option value="All">All Plans</option>
                  {Object.keys(PLAN_STYLE).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={statusFilter} onChange={e => { setStatus(e.target.value as any); setPage(1); }}
                  className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer appearance-none pr-8 relative">
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Trialling">Trialling</option>
                  <option value="Past Due">Past Due</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button title="Export Invoices" className="h-10 px-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 font-semibold text-sm transition-colors shadow-sm">
                <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#1a1d27]/80 border-b border-slate-100 dark:border-[#2a2d3a]">
                  {([
                    ['schoolName', 'School'], ['plan', 'Plan'], ['cycle', 'Cycle'],
                    ['amount', 'Amount'], ['status', 'Status'], ['lastPayment', 'Last Payment'],
                    ['nextBilling', 'Next Billing']
                  ] as [keyof Subscription, string][]).map(([col, label]) => (
                    <th key={col} onClick={() => toggleSort(col)}
                      className={`px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800 dark:hover:text-slate-300 select-none whitespace-nowrap ${col === 'schoolName' ? 'pl-6' : ''}`}>
                      <div className="flex items-center gap-1.5">{label}<SortIcon col={col} /></div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500 pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-[#2a2d3a]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <p className="text-sm font-semibold text-slate-400 dark:text-slate-600">Loading subscriptions...</p>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <Icon d={ICONS.subscriptions} className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-400 dark:text-slate-600">No subscriptions found</p>
                    </td>
                  </tr>
                ) : paginated.map(sub => (
                  <Fragment key={sub.id}>
                    <tr className="group hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}>
                      <td className="pl-6 px-4 py-3.5 min-w-[200px]">
                        <div className="flex flex-col">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{sub.schoolName}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{sub.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm ${PLAN_STYLE[sub.plan]}`}>{sub.plan}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{sub.cycle}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(sub.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sub.status === 'Active' ? 'bg-green-500' : sub.status === 'Trialling' ? 'bg-blue-400' : sub.status === 'Past Due' ? 'bg-orange-500' : 'bg-red-500'}`} />
                          <span className={`text-[10px] font-extrabold ${STATUS_STYLE[sub.status].split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>{sub.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{sub.lastPayment}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{sub.nextBilling}</span>
                      </td>
                      <td className="px-4 py-3.5 pr-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button title="View Details" className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center justify-center transition-colors">
                            <Icon d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === sub.id && (
                      <tr className="bg-blue-50/30 dark:bg-blue-950/10">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                              { label: 'School ID', value: sub.schoolId },
                              { label: 'Payment Method', value: 'Card ending in •••• 4242' },
                              { label: 'Billing Email', value: `billing@${sub.schoolName.toLowerCase().replace(/ /g, '')}.edu.in` },
                              { label: 'Auto-Renew', value: sub.status === 'Canceled' ? 'Off' : 'On' },
                            ].map(d => (
                              <div key={d.label}>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">{d.label}</p>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{d.value}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button className="h-8 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors">View Invoices</button>
                            <button className="h-8 px-4 border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-xs font-bold transition-colors">Change Plan</button>
                            {sub.status === 'Past Due' && (
                              <button className="h-8 px-4 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/60 rounded-lg text-xs font-bold transition-colors">
                                Resend Payment Link
                              </button>
                            )}
                            {sub.status === 'Active' && (
                              <button className="h-8 px-4 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-bold transition-colors ml-auto">
                                Cancel Subscription
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 dark:border-[#2a2d3a] flex items-center justify-between bg-slate-50/30 dark:bg-[#1a1d27]/30">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-700 dark:text-slate-200">{paginated.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}</span> to <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{filtered.length}</span> subscriptions
            </p>
            <div className="flex items-center gap-1.5">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <Icon d={ICONS.chevronDown} className="w-4 h-4 rotate-90" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${page === i + 1 ? 'bg-blue-600 text-white' : 'border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <Icon d={ICONS.chevronRight} className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
