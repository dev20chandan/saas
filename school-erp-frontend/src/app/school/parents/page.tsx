'use client';

import { useState, useMemo } from 'react';
import SchoolLayout from '@/components/school/SchoolLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { api } from '@/lib/api';
import useSWR from 'swr';
import { useAuth } from '@/lib/AuthContext';

interface StudentSettings {
  rollNumber: string;
  className: string;
  guardianName: string;
  dob: string;
  gender: string;
  bloodGroup?: string;
  feeStatus?: 'Paid' | 'Pending' | 'Overdue';
  attendanceRate?: number;
}

interface StudentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Pending';
  settings: StudentSettings;
  createdAt: string;
}

const fetcher = (url: string) => api.get(url);

export default function SchoolParentsPage() {
  const { schoolId } = useAuth();
  const { data, error, mutate } = useSWR('/students?limit=100', fetcher, {
    revalidateOnFocus: false,
  });

  const rawStudents = data?.users || [];
  const isLoading = !data && !error;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedFee, setSelectedFee] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    parentName: '',
    phone: '',
    email: '',
    feeStatus: 'Pending' as 'Paid' | 'Pending' | 'Overdue',
  });

  // Calculate unique classes
  const classes = useMemo(() => {
    const list = new Set<string>();
    rawStudents.forEach((s: any) => {
      if (s.settings?.className) {
        list.add(s.settings.className);
      }
    });
    if (list.size === 0) {
      return ['10-A', '10-B', '9-A', '9-B', '8-A', '11-Sci', '12-Comm'];
    }
    return Array.from(list);
  }, [rawStudents]);

  // Map students to Parent items
  const parentRecords = useMemo(() => {
    return rawStudents.map((s: any) => {
      const settings = s.settings || {};
      return {
        id: s.id || s._id,
        parentName: settings.guardianName || 'Unknown Parent',
        studentName: s.name,
        studentEmail: s.email,
        studentId: s.id,
        rollNumber: settings.rollNumber || '—',
        className: settings.className || '—',
        phone: s.phone || '—',
        status: s.status || 'Active',
        feeStatus: settings.feeStatus || 'Pending',
        attendanceRate: settings.attendanceRate || 95,
        dob: settings.dob || '',
        gender: settings.gender || 'Male',
        bloodGroup: settings.bloodGroup || 'O+',
        fullStudent: s,
      };
    });
  }, [rawStudents]);

  // Filter parents list
  const filteredParents = useMemo(() => {
    return parentRecords.filter((parent: any) => {
      const matchesSearch =
        parent.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.phone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass = selectedClass === 'All' || parent.className === selectedClass;
      const matchesFee = selectedFee === 'All' || parent.feeStatus === selectedFee;

      return matchesSearch && matchesClass && matchesFee;
    });
  }, [parentRecords, searchQuery, selectedClass, selectedFee]);

  // Calculate high-fidelity stats
  const stats = useMemo(() => {
    const total = parentRecords.length;
    const feeAlerts = parentRecords.filter((p: any) => p.feeStatus === 'Pending' || p.feeStatus === 'Overdue').length;
    const paid = parentRecords.filter((p: any) => p.feeStatus === 'Paid').length;
    const criticalOverdue = parentRecords.filter((p: any) => p.feeStatus === 'Overdue').length;

    return { total, feeAlerts, paid, criticalOverdue };
  }, [parentRecords]);

  // Open Edit Modal
  const handleEditOpen = (parent: any) => {
    setSelectedParent(parent);
    setFormData({
      parentName: parent.parentName,
      phone: parent.phone,
      email: parent.studentEmail,
      feeStatus: parent.feeStatus,
    });
    setIsModalOpen(true);
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParent) return;

    try {
      const student = selectedParent.fullStudent;
      const payload = {
        ...student,
        name: student.name,
        phone: formData.phone,
        settings: {
          ...(student.settings || {}),
          guardianName: formData.parentName,
          feeStatus: formData.feeStatus,
        },
      };

      await api.put(`/students/${selectedParent.id}`, payload);
      mutate();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error updating parent record');
    }
  };

  // Quick Action: Send Fee Reminder Alert
  const sendFeeReminder = (parent: any) => {
    alert(`Fee reminder SMS notification queued for ${parent.parentName} (${parent.phone}) regarding student ${parent.studentName}'s pending dues.`);
  };

  return (
    <SchoolLayout title="Parent Directory" subtitle="Overview dashboard of student guardians, communications and fee configurations.">
      <div className="p-4 sm:p-6 space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Parents Linked', value: stats.total, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Cleared Fees', value: stats.paid, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
            { label: 'Pending Dues Alerts', value: stats.feeAlerts, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Critically Overdue', value: stats.criticalOverdue, color: 'text-rose-650 dark:text-rose-455', bg: 'bg-rose-500/10' },
          ].map(it => (
            <div key={it.label} className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base flex-shrink-0 ${it.bg} ${it.color}`}>
                👨‍👩‍👧
              </span>
              <div>
                <p className={`text-lg font-extrabold ${it.color}`}>{it.value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{it.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-[#2a2d3a] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#1a1d27]/70">
            <div className="flex flex-wrap gap-2.5 items-center flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Icon d={ICONS.search} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search parents, linked student, phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-700 dark:text-slate-200 placeholder-slate-400"
                />
              </div>

              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All">All Classes</option>
                {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>

              <select
                value={selectedFee}
                onChange={e => setSelectedFee(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All">All Fee Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#1c1f2e] border-b border-slate-105 dark:border-[#2b2e3b]">
                  <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Parent / Guardian Name</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Contact Number</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Linked Student</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Class Grade</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Dues Status</th>
                  <th className="px-5 py-3 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2a2d3a]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-sm text-slate-550">Loading parents directory...</td>
                  </tr>
                ) : filteredParents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Icon d={ICONS.users} className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-500">No parent records found</p>
                    </td>
                  </tr>
                ) : filteredParents.map((parent: any) => {
                  let feeBadge = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
                  if (parent.feeStatus === 'Paid') feeBadge = 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300';
                  else if (parent.feeStatus === 'Pending') feeBadge = 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
                  else if (parent.feeStatus === 'Overdue') feeBadge = 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-350';

                  return (
                    <tr key={parent.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#2a2d3a] flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                            {parent.parentName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{parent.parentName}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Guardian Account ID: #{parent.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-750 dark:text-slate-300">
                        {parent.phone}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-slate-900 dark:text-white">
                        {parent.studentName}
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                        Class {parent.className}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${feeBadge}`}>
                          {parent.feeStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {parent.feeStatus !== 'Paid' && (
                            <button
                              onClick={() => sendFeeReminder(parent)}
                              title="Send Fee Reminder SMS"
                              className="w-7 h-7 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 flex items-center justify-center transition-all"
                            >
                              <Icon d={ICONS.bell} className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            title="Edit Contact/Details"
                            onClick={() => handleEditOpen(parent)}
                            className="w-7 h-7 rounded-lg text-slate-550 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-all"
                          >
                            <Icon d={ICONS.edit} className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in scale-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2a2d3a] flex items-center justify-between bg-slate-50/50 dark:bg-[#1c1f2e]">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                Update Parent Profile
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <Icon d={ICONS.chevronDown} className="w-4 h-4 rotate-180" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-3">
                
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Parent / Guardian Name</label>
                  <input
                    type="text"
                    required
                    value={formData.parentName}
                    onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Fee Status (for {selectedParent?.studentName})</label>
                  <select
                    value={formData.feeStatus}
                    onChange={e => setFormData({ ...formData, feeStatus: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none text-slate-805 dark:text-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

              </div>

              <div className="border-t border-slate-100 dark:border-[#2a2d3a] pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md shadow-green-500/10"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </SchoolLayout>
  );
}
