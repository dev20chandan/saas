'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { api } from '@/lib/api';

const modules = ['dashboard', 'schools', 'users', 'subscriptions', 'payments', 'analytics', 'support', 'audit', 'settings'];

export default function EditAdminPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialLoading, setInitialLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');

  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(() => {
    const init: any = {};
    modules.forEach(m => {
      init[m] = { view: false, edit: false, delete: false };
    });
    return init;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      api.get(`/admins/${id}`).then(res => {
        const admin = res;
        setName(admin.name || '');
        setEmail(admin.email || '');
        setRole(admin.role || 'Admin');

        let parsedSettings = admin.settings;
        if (typeof parsedSettings === 'string') {
          try { parsedSettings = JSON.parse(parsedSettings); } catch (e) {}
        }
        const existing = parsedSettings?.permissions || {};
        
        setPermissions(prev => {
          const init: any = {};
          modules.forEach(m => {
            init[m] = existing[m] || { view: false, edit: false, delete: false };
          });
          return init;
        });
      }).catch(err => {
        setError(err.message || 'Failed to load admin');
      }).finally(() => {
        setInitialLoading(false);
      });
    }
  }, [id]);

  const togglePermission = (mod: string, action: 'view' | 'edit' | 'delete') => {
    setPermissions(prev => ({
      ...prev,
      [mod]: {
        ...prev[mod],
        [action]: !prev[mod][action]
      }
    }));
  };

  const toggleModule = (mod: string, enabled: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [mod]: {
        view: enabled,
        edit: enabled,
        delete: enabled
      }
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const dataToUpdate: any = { name, email, role, permissions };
      if (password.trim() !== '') {
        dataToUpdate.password = password;
      }
      await api.put(`/admins/${id}`, dataToUpdate);
      router.push('/admins');
    } catch (err: any) {
      setError(err.message || 'Failed to update admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Edit Admin" subtitle="Modify admin details and permissions">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {initialLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1d27] rounded-2xl shadow-sm border border-slate-200 dark:border-[#2a2d3a] p-6 space-y-6">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input type="password" placeholder="Leave blank to keep same" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:ring-2 focus:ring-blue-500/30">
                  <option value="Admin">Admin</option>
                  <option value="Sub Admin">Sub Admin</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Module Permissions</h3>
              <div className="border border-slate-200 dark:border-[#2a2d3a] rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-[#2a2d3a]">
                {modules.map(mod => {
                  const p = permissions[mod];
                  const isAll = p.view && p.edit && p.delete;
                  return (
                    <div key={mod} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3 w-1/3">
                        <input type="checkbox" checked={isAll} onChange={e => toggleModule(mod, e.target.checked)} className="w-4 h-4 rounded border-slate-300" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">{mod}</span>
                      </div>
                      <div className="flex items-center gap-6 w-2/3 justify-end">
                        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                          <input type="checkbox" checked={p.view} onChange={() => togglePermission(mod, 'view')} className="w-3.5 h-3.5 rounded border-slate-300" /> View
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                          <input type="checkbox" checked={p.edit} onChange={() => togglePermission(mod, 'edit')} className="w-3.5 h-3.5 rounded border-slate-300" /> Edit
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                          <input type="checkbox" checked={p.delete} onChange={() => togglePermission(mod, 'delete')} className="w-3.5 h-3.5 rounded border-slate-300" /> Delete
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#2a2d3a]">
              <button type="button" onClick={() => router.push('/admins')} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 disabled:opacity-50 transition-colors">
                {loading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
