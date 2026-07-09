'use client';

import React, { useState, useMemo, useEffect, Fragment } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { useAuth } from '@/lib/AuthContext';
import { canPerform } from '@/lib/auth';
import { api } from '@/lib/api';
import { useUsers } from '@/hooks/useUsers';
import { useRouter } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = 'System Admin' | 'School Admin' | 'Headmaster' | 'Teacher' | 'Staff' | 'Parent';
type Status = 'Active' | 'Inactive' | 'Locked' | 'Pending';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  schoolId: string;
  school: string;
  operator: string;
  status: Status;
  lastLogin: string;
  phone: string;
  createdAt: string;
}

// No mock data needed, we use real API
// ── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<Status, string> = {
  Active: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  Pending: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
  Locked: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  Inactive: 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400',
};

const ROLE_STYLE: Record<Role, string> = {
  'System Admin': 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400',
  'School Admin': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
  'Headmaster': 'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-400',
  'Teacher': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
  'Staff': 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300',
  'Parent': 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400',
};

const PAGE_SIZE = 8;

export default function UsersPage() {
  const { permissions } = useAuth();
  const canDeleteUsers = canPerform(permissions, 'users', 'delete');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatus] = useState<Status | 'All'>('All');
  const [roleFilter, setRole] = useState<Role | 'All'>('All');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortCol, setSortCol] = useState<keyof User>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();
  const { users: rawUsers, isLoading, mutate } = useUsers();

  const mappedUsers: User[] = useMemo(() => {
    return (rawUsers || []).map((u: any) => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role as Role,
      schoolId: u.schoolId,
      school: u.school || '—',
      operator: u.operator || '—',
      status: (u.status || 'Active') as Status,
      lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never',
      phone: u.phone || '—',
      createdAt: new Date(u.createdAt || Date.now()).toLocaleDateString(),
    }));
  }, [rawUsers]);

  async function handleDeleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      mutate();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: mappedUsers.length,
    active: mappedUsers.filter(u => u.status === 'Active').length,
    pending: mappedUsers.filter(u => u.status === 'Pending').length,
    locked: mappedUsers.filter(u => u.status === 'Locked').length,
    inactive: mappedUsers.filter(u => u.status === 'Inactive').length,
  }), [mappedUsers]);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...mappedUsers];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(u =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) ||
        u.school.toLowerCase().includes(q) || u.schoolId.toLowerCase().includes(q) ||
        u.operator.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') rows = rows.filter(u => u.status === statusFilter);
    if (roleFilter !== 'All') rows = rows.filter(u => u.role === roleFilter);
    rows.sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [search, statusFilter, roleFilter, sortCol, sortDir, mappedUsers]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(col: keyof User) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  }

  function toggleAll() {
    const ids = paginated.map(u => u.id);
    const all = ids.length > 0 && ids.every(id => selected.has(id));
    setSelected(prev => {
      const n = new Set(prev);
      if (all) {
        ids.forEach(id => n.delete(id));
      } else {
        ids.forEach(id => n.add(id));
      }
      return n;
    });
  }

  function toggleRow(id: string) {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  }

  function SortIcon({ col }: { col: keyof User }) {
    if (sortCol !== col) return <Icon d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" className="w-3 h-3 text-slate-300 dark:text-slate-600" />;
    return <Icon d={sortDir === 'asc' ? ICONS.arrowUp : ICONS.arrowDown} className="w-3 h-3 text-blue-500" />;
  }

  return (
    <DashboardLayout title="School Users" subtitle="See which user belongs to which school and who operates the account">
      <div className="p-4 sm:p-6 space-y-5">

        {/* ── Stat pills ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Users', value: stats.total, color: 'text-slate-900 dark:text-white', dot: 'bg-slate-400' },
            { label: 'Active', value: stats.active, color: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
            { label: 'Pending', value: stats.pending, color: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-400' },
            { label: 'Locked', value: stats.locked, color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
            { label: 'Inactive', value: stats.inactive, color: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
              <div>
                <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
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
                <input type="text" placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full sm:w-64 h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-700 dark:text-slate-200 placeholder-slate-400" />
              </div>
              <div className="flex items-center gap-2">
                <select value={roleFilter} onChange={e => { setRole(e.target.value as Role | 'All'); setPage(1); }}
                  className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer appearance-none pr-8 relative">
                  <option value="All">All Roles</option>
                  {Object.keys(ROLE_STYLE).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={statusFilter} onChange={e => { setStatus(e.target.value as Status | 'All'); setPage(1); }}
                  className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer appearance-none pr-8 relative">
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Locked">Locked</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button title="Export" className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm">
                <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" className="w-4 h-4" />
              </button>
              <button onClick={() => router.push('/users/create')} className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-colors">
                <Icon d={ICONS.users} className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#1a1d27]/80 border-b border-slate-100 dark:border-[#2a2d3a]">
                  <th className="w-12 px-4 py-3">
                    <input type="checkbox"
                      checked={paginated.length > 0 && paginated.every(u => selected.has(u.id))}
                      onChange={toggleAll}
                      className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 accent-blue-600 cursor-pointer" />
                  </th>
                  {([
                    ['name', 'User'], ['role', 'Role'], ['school', 'School'],
                    ['operator', 'Operated By'], ['status', 'Status'], ['lastLogin', 'Last Login'], ['createdAt', 'Added'],
                  ] as [keyof User, string][]).map(([col, label]) => (
                    <th key={col} onClick={() => toggleSort(col)}
                      className="px-3 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800 dark:hover:text-slate-300 select-none whitespace-nowrap">
                      <div className="flex items-center gap-1.5">{label}<SortIcon col={col} /></div>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-[#2a2d3a]">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <Icon d={ICONS.users} className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-400 dark:text-slate-600">No users found</p>
                      <p className="text-xs text-slate-300 dark:text-slate-700 mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : paginated.map(user => (
                  <Fragment key={user.id}>
                    <tr className={`group hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer ${selected.has(user.id) ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                      onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(user.id)} onChange={() => toggleRow(user.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 accent-blue-600 cursor-pointer" />
                      </td>
                      <td className="px-3 py-3.5 min-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-[10px] flex-shrink-0 shadow-sm">
                            {user.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{user.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${ROLE_STYLE[user.role]}`}>{user.role}</span>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 max-w-[160px] truncate">{user.school}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{user.schoolId}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{user.operator}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">Account owner / operator</p>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${user.status === 'Active' ? 'bg-green-500' : user.status === 'Pending' ? 'bg-orange-400' : user.status === 'Locked' ? 'bg-red-500' : 'bg-slate-400'}`} />
                          <span className={`text-[10px] font-extrabold ${STATUS_STYLE[user.status].split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>{user.status}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{user.lastLogin}</span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{user.createdAt}</span>
                      </td>
                      <td className="px-3 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button title="Edit User" className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                            <Icon d={ICONS.edit} className="w-3.5 h-3.5" />
                          </button>
                          {canDeleteUsers && (
                            <button
                              title="Delete User"
                              onClick={() => handleDeleteUser(user.id)}
                              className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center justify-center transition-colors"
                            >
                              <Icon d={ICONS.trash} className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === user.id && (
                      <tr className="bg-blue-50/30 dark:bg-blue-950/10">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                              { label: 'User ID', value: user.id },
                              { label: 'School ID', value: user.schoolId },
                              { label: 'Phone', value: user.phone },
                              { label: 'Email', value: user.email },
                              { label: 'School Context', value: `${user.role} at ${user.school}` },
                              { label: 'Operated By', value: user.operator },
                            ].map(d => (
                              <div key={d.label}>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">{d.label}</p>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{d.value}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">View Full Profile</button>
                            <button className="h-8 px-4 border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-xs font-bold transition-colors">Send Email</button>
                            <button className={`h-8 px-4 rounded-lg text-xs font-bold transition-colors border ${user.status === 'Locked'
                              ? 'border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50'
                              : 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50'}`}>
                              {user.status === 'Locked' ? 'Unlock Account' : 'Lock Account'}
                            </button>
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
              Showing <span className="font-bold text-slate-700 dark:text-slate-200">{paginated.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}</span> to <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{filtered.length}</span> users
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
