'use client';

import React, { useState, useMemo, Fragment } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { useSupport } from '@/hooks/useSupport';

// ── Types ─────────────────────────────────────────────────────────────────────
type Status   = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
type Priority = 'High' | 'Medium' | 'Low';

interface Ticket {
  id:           string;
  subject:      string;
  schoolName:   string;
  submitter:    string;
  priority:     Priority;
  status:       Status;
  date:         string;
  description:  string;
}

// No mock data needed, we use real API
// ── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<Status, string> = {
  Open:          'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
  'In Progress': 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
  Resolved:      'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  Closed:        'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300',
};

const PRIORITY_STYLE: Record<Priority, string> = {
  High:   'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30',
  Medium: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/30',
  Low:    'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
};

const PAGE_SIZE = 8;

export default function SupportTicketsPage() {
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<Status | 'All'>('All');
  const [priorityFilter, setPriority]= useState<Priority | 'All'>('All');
  const [page, setPage]             = useState(1);
  const [sortCol, setSortCol]       = useState<keyof Ticket>('id');
  const [sortDir, setSortDir]       = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { support: rawTickets, isLoading } = useSupport();

  const mappedTickets: Ticket[] = useMemo(() => {
    return (rawTickets || []).map((t: any) => ({
      id: t._id || t.id,
      subject: t.subject || 'No Subject',
      schoolName: t.schoolName || t.schoolId || 'Unknown',
      submitter: t.submitter || 'Unknown',
      priority: (t.priority || 'Low') as Priority,
      status: (t.status || 'Open') as Status,
      date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Unknown',
      description: t.description || '',
    }));
  }, [rawTickets]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let open = 0;
    let inProgress = 0;
    let resolved = 0; // simulating resolved today/recently

    mappedTickets.forEach(t => {
      if (t.status === 'Open') open++;
      if (t.status === 'In Progress') inProgress++;
      if (t.status === 'Resolved' || t.status === 'Closed') resolved++;
    });
    
    return {
      open,
      inProgress,
      resolved,
      avgResponse: '1h 24m',
    };
  }, [mappedTickets]);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...mappedTickets];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(t =>
        t.schoolName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') rows = rows.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'All') rows = rows.filter(t => t.priority === priorityFilter);
    rows.sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      // For simple mock sorting on ID, we just string compare
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [search, statusFilter, priorityFilter, sortCol, sortDir, mappedTickets]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(col: keyof Ticket) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  }

  function SortIcon({ col }: { col: keyof Ticket }) {
    if (sortCol !== col) return <Icon d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" className="w-3 h-3 text-slate-300 dark:text-slate-600" />;
    return <Icon d={sortDir === 'asc' ? ICONS.arrowUp : ICONS.arrowDown} className="w-3 h-3 text-blue-500" />;
  }

  return (
    <DashboardLayout title="Support Tickets" subtitle="Manage incoming helpdesk issues from schools and users">
      <div className="p-4 sm:p-6 space-y-5">

        {/* ── Stat pills ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Open Tickets',       value: stats.open,       color: 'text-red-600 dark:text-red-400',           dot: 'bg-red-500' },
            { label: 'In Progress',        value: stats.inProgress, color: 'text-orange-600 dark:text-orange-400',    dot: 'bg-orange-500' },
            { label: 'Resolved (All)',     value: stats.resolved,   color: 'text-green-700 dark:text-green-400',       dot: 'bg-green-500' },
            { label: 'Avg Response Time',  value: stats.avgResponse,color: 'text-blue-700 dark:text-blue-400',         dot: 'bg-blue-500' },
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
                <input type="text" placeholder="Search ticket ID or subject..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full sm:w-64 h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-700 dark:text-slate-200 placeholder-slate-400" />
              </div>
              <div className="flex items-center gap-2">
                <select value={priorityFilter} onChange={e => { setPriority(e.target.value as any); setPage(1); }}
                  className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer appearance-none pr-8 relative">
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <select value={statusFilter} onChange={e => { setStatus(e.target.value as any); setPage(1); }}
                  className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer appearance-none pr-8 relative">
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button title="Create Ticket" className="h-10 px-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm">
                <Icon d="M12 4v16m8-8H4" className="w-4 h-4" />
                New Ticket
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#1a1d27]/80 border-b border-slate-100 dark:border-[#2a2d3a]">
                  {([
                    ['id', 'Ticket ID'], ['subject', 'Subject'], ['schoolName', 'School'],
                    ['priority', 'Priority'], ['status', 'Status'], ['date', 'Date']
                  ] as [keyof Ticket, string][]).map(([col, label]) => (
                    <th key={col} onClick={() => toggleSort(col)}
                      className={`px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800 dark:hover:text-slate-300 select-none whitespace-nowrap ${col === 'id' ? 'pl-6' : ''}`}>
                      <div className="flex items-center gap-1.5">{label}<SortIcon col={col} /></div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500 pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-[#2a2d3a]">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <Icon d={ICONS.support} className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-400 dark:text-slate-600">No tickets found</p>
                    </td>
                  </tr>
                ) : paginated.map(tkt => (
                  <Fragment key={tkt.id}>
                    <tr className={`group hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer ${expandedId === tkt.id ? 'bg-slate-50/60 dark:bg-white/[0.03]' : ''}`}
                      onClick={() => setExpandedId(expandedId === tkt.id ? null : tkt.id)}>
                      <td className="pl-6 px-4 py-3.5">
                        <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">{tkt.id}</span>
                      </td>
                      <td className="px-4 py-3.5 min-w-[250px] max-w-[300px]">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{tkt.subject}</p>
                      </td>
                      <td className="px-4 py-3.5 min-w-[180px]">
                        <div className="flex flex-col">
                          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{tkt.schoolName}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">by {tkt.submitter}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${PRIORITY_STYLE[tkt.priority]}`}>
                          {tkt.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tkt.status === 'Open' ? 'bg-blue-500' : tkt.status === 'In Progress' ? 'bg-orange-400' : tkt.status === 'Resolved' ? 'bg-green-500' : 'bg-slate-400'}`} />
                          <span className={`text-[10px] font-extrabold ${STATUS_STYLE[tkt.status].split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>{tkt.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-medium text-slate-500">{tkt.date}</span>
                      </td>
                      <td className="px-4 py-3.5 pr-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button title="View Details" className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center justify-center transition-colors">
                            <Icon d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === tkt.id && (
                      <tr className="bg-blue-50/30 dark:bg-blue-950/10">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="max-w-3xl">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-2">Issue Description</p>
                            <div className="bg-white dark:bg-[#1a1d27] border border-slate-200 dark:border-[#2a2d3a] rounded-xl p-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
                              {tkt.description}
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                              <button className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">
                                Reply to Ticket
                              </button>
                              <button className="h-8 px-4 border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-xs font-bold transition-colors">
                                Assign Agent
                              </button>
                              {(tkt.status === 'Open' || tkt.status === 'In Progress') && (
                                <button className="h-8 px-4 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60 rounded-lg text-xs font-bold transition-colors ml-auto">
                                  Mark as Resolved
                                </button>
                              )}
                              {tkt.status === 'Resolved' && (
                                <button className="h-8 px-4 border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-xs font-bold transition-colors ml-auto">
                                  Close Ticket
                                </button>
                              )}
                            </div>
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
              Showing <span className="font-bold text-slate-700 dark:text-slate-200">{paginated.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}</span> to <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{filtered.length}</span> tickets
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
