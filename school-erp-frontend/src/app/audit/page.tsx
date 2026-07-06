'use client';

import React, { useState, useMemo, Fragment } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { useAudit } from '@/hooks/useAudit';

// ── Types ─────────────────────────────────────────────────────────────────────
type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT';
type Status     = 'Success' | 'Failure';

interface AuditLog {
  id:           string;
  timestamp:    string;
  user:         string;
  role:         string;
  action:       ActionType;
  resource:     string;
  status:       Status;
  ipAddress:    string;
  payload:      any;
}

// No mock data needed, we use real API
// ── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<Status, string> = {
  Success: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  Failure: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
};

const ACTION_STYLE: Record<ActionType, string> = {
  CREATE: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/30',
  UPDATE: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30',
  DELETE: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30',
  LOGIN:  'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  EXPORT: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-900/30',
};

const PAGE_SIZE = 8;

export default function AuditLogPage() {
  const [search, setSearch]         = useState('');
  const [actionFilter, setAction]   = useState<ActionType | 'All'>('All');
  const [statusFilter, setStatus]   = useState<Status | 'All'>('All');
  const [page, setPage]             = useState(1);
  const [sortCol, setSortCol]       = useState<keyof AuditLog>('timestamp');
  const [sortDir, setSortDir]       = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { audit: rawLogs, isLoading } = useAudit();

  const mappedLogs: AuditLog[] = useMemo(() => {
    return (rawLogs || []).map((l: any) => ({
      id: l._id || l.id,
      timestamp: l.timestamp ? new Date(l.timestamp).toLocaleString() : new Date(l.createdAt || Date.now()).toLocaleString(),
      user: l.userEmail || l.userId || 'Unknown',
      role: l.role || 'Unknown',
      action: (l.action || 'UPDATE') as ActionType,
      resource: l.resource || 'System',
      status: (l.status || 'Success') as Status,
      ipAddress: l.ipAddress || 'Unknown',
      payload: l.payload || {},
    }));
  }, [rawLogs]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let failedLogins = 0;
    let criticalActions = 0;

    mappedLogs.forEach(l => {
      if (l.action === 'LOGIN' && l.status === 'Failure') failedLogins++;
      if (l.action === 'DELETE' || l.action === 'EXPORT') criticalActions++;
    });
    
    return {
      total: mappedLogs.length, // simulating "today's events" for the mock
      failedLogins,
      criticalActions,
      activeAdmins: 3,
    };
  }, [mappedLogs]);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...mappedLogs];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(l =>
        l.user.toLowerCase().includes(q) || l.resource.toLowerCase().includes(q) || l.id.toLowerCase().includes(q)
      );
    }
    if (actionFilter !== 'All') rows = rows.filter(l => l.action === actionFilter);
    if (statusFilter !== 'All') rows = rows.filter(l => l.status === statusFilter);
    rows.sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [search, actionFilter, statusFilter, sortCol, sortDir, mappedLogs]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(col: keyof AuditLog) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
    setPage(1);
  }

  function SortIcon({ col }: { col: keyof AuditLog }) {
    if (sortCol !== col) return <Icon d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" className="w-3 h-3 text-slate-300 dark:text-slate-600" />;
    return <Icon d={sortDir === 'asc' ? ICONS.arrowUp : ICONS.arrowDown} className="w-3 h-3 text-blue-500" />;
  }

  return (
    <DashboardLayout title="Audit Logs" subtitle="Security tracking and administrative oversight of all system activities">
      <div className="p-4 sm:p-6 space-y-5">

        {/* ── Stat pills ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Events (Today)',value: stats.total,           color: 'text-slate-900 dark:text-white',           dot: 'bg-blue-500' },
            { label: 'Critical Actions',    value: stats.criticalActions, color: 'text-orange-600 dark:text-orange-400',     dot: 'bg-orange-500' },
            { label: 'Failed Logins',       value: stats.failedLogins,    color: 'text-red-600 dark:text-red-400',           dot: 'bg-red-500' },
            { label: 'Active Admins',       value: stats.activeAdmins,    color: 'text-emerald-700 dark:text-emerald-400',   dot: 'bg-emerald-500' },
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
                <input type="text" placeholder="Search user, resource, or ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full sm:w-64 h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-700 dark:text-slate-200 placeholder-slate-400" />
              </div>
              <div className="flex items-center gap-2">
                <select value={actionFilter} onChange={e => { setAction(e.target.value as any); setPage(1); }}
                  className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer appearance-none pr-8 relative">
                  <option value="All">All Actions</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="LOGIN">Login</option>
                  <option value="EXPORT">Export</option>
                </select>
                <select value={statusFilter} onChange={e => { setStatus(e.target.value as any); setPage(1); }}
                  className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer appearance-none pr-8 relative">
                  <option value="All">All Statuses</option>
                  <option value="Success">Success</option>
                  <option value="Failure">Failure</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button title="Export Logs" className="h-10 px-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 font-semibold text-sm transition-colors shadow-sm">
                <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#1a1d27]/80 border-b border-slate-100 dark:border-[#2a2d3a]">
                  {([
                    ['id', 'Event ID'], ['timestamp', 'Timestamp'], ['user', 'User'],
                    ['action', 'Action'], ['resource', 'Resource'], ['status', 'Status'],
                    ['ipAddress', 'IP Address']
                  ] as [keyof AuditLog, string][]).map(([col, label]) => (
                    <th key={col} onClick={() => toggleSort(col)}
                      className={`px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800 dark:hover:text-slate-300 select-none whitespace-nowrap ${col === 'id' ? 'pl-6' : ''}`}>
                      <div className="flex items-center gap-1.5">{label}<SortIcon col={col} /></div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500 pr-6">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-[#2a2d3a]">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <Icon d={ICONS.audit} className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-400 dark:text-slate-600">No events found</p>
                    </td>
                  </tr>
                ) : paginated.map(log => (
                  <Fragment key={log.id}>
                    <tr className={`group hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer ${expandedId === log.id ? 'bg-slate-50/60 dark:bg-white/[0.03]' : ''}`}
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                      <td className="pl-6 px-4 py-3.5">
                        <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">{log.id}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{log.timestamp}</span>
                      </td>
                      <td className="px-4 py-3.5 min-w-[200px]">
                        <div className="flex flex-col">
                          <p className={`text-xs font-bold truncate ${log.user === 'unknown' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{log.user}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{log.role}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${ACTION_STYLE[log.action]}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{log.resource}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${log.status === 'Success' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={`text-[10px] font-extrabold ${STATUS_STYLE[log.status].split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>{log.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-mono text-slate-500">{log.ipAddress}</span>
                      </td>
                      <td className="px-4 py-3.5 pr-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button title="View Payload" className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center justify-center transition-colors">
                            <Icon d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr className="bg-slate-900 dark:bg-[#0f1117]">
                        <td colSpan={8} className="px-6 py-6 border-l-4 border-blue-500">
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Event Payload Data</p>
                              <button className="text-[10px] text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                                <Icon d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" className="w-3 h-3" />
                                Copy JSON
                              </button>
                            </div>
                            <pre className="text-[11px] font-mono text-green-400 bg-black/50 p-4 rounded-xl overflow-x-auto border border-white/10 shadow-inner">
                              <code>
                                {JSON.stringify(log.payload, null, 2)}
                              </code>
                            </pre>
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
              Showing <span className="font-bold text-slate-700 dark:text-slate-200">{paginated.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}</span> to <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{filtered.length}</span> events
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
