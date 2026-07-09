'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { api } from '@/lib/api';

export default function CreateUserPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Headmaster');
  const [schoolId, setSchoolId] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/users', { name, email, password, role, schoolId, phone });
      router.push('/users');
    } catch (err: any) {
      setError(err.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add New User" subtitle="Create a new user and assign a role">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
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
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:ring-2 focus:ring-blue-500/30">
                <option value="Headmaster">Headmaster</option>
                <option value="Teacher">Teacher</option>
                <option value="Staff">Staff</option>
                <option value="Parent">Parent</option>
                <option value="School Admin">School Admin</option>
                <option value="System Admin">System Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">School ID (Optional)</label>
              <input type="text" value={schoolId} onChange={e => setSchoolId(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. SCH-1234" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#2a2d3a]">
            <button type="button" onClick={() => router.push('/users')} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 disabled:opacity-50 transition-colors">
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
